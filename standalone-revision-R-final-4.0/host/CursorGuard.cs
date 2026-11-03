using System.Runtime.InteropServices;
using Microsoft.Web.WebView2.Core;
using Microsoft.Win32;
using System.Text.RegularExpressions;

namespace GlitchPlayerR4;

// System-cursor-only enforcement. Three layers:
//  1. Process hardening: no legacy hook/extension-point DLLs, no remote or low-integrity images.
//  2. Cursor scheme guard: every pointer slot must be empty (built-in default) or a .cur/.ani that resolves,
//     after 8.3/long-name, ".." and reparse-point normalisation, to a real file under %WINDIR%\Cursors.
//     Anything else (e.g. a themed "GEM"-style .cur set) is reset on launch and again on every change.
//  3. Page layer: web content can never replace the pointer (CSS, inline style, shadow DOM, JS style APIs).
internal static class CursorGuard
{
    private static readonly string[] Slots =
    {
        "Arrow", "Help", "AppStarting", "Wait", "Crosshair", "IBeam", "NWPen", "No", "SizeNS", "SizeWE",
        "SizeNWSE", "SizeNESW", "SizeAll", "UpArrow", "Hand", "Pin", "Person",
    };

    private static string logPath = "";
    private static System.Windows.Forms.Timer timer;

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool SetProcessMitigationPolicy(int policy, ref uint flags, nuint length);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern uint GetLongPathName(string shortPath, System.Text.StringBuilder longPath, uint size);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool SystemParametersInfo(uint action, uint param, nint pvParam, uint winIni);

    // Call first thing in Main, before any window exists.
    public static void HardenProcess()
    {
        uint extensionPointsOff = 0x1;           // AppInit DLLs, global SetWindowsHookEx DLLs, legacy IMEs
        uint imageLoad = 0x1 | 0x2 | 0x4;        // no remote images, no low-integrity images, prefer System32
        try { SetProcessMitigationPolicy(6, ref extensionPointsOff, 4); } catch { }
        try { SetProcessMitigationPolicy(10, ref imageLoad, 4); } catch { }
    }

    public static void Start(string appName)
    {
        logPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), appName, "cursor-guard.log");
        Enforce();
        timer = new System.Windows.Forms.Timer { Interval = 1500 };
        timer.Tick += (_, _) => Enforce();
        timer.Start();
        SystemEvents.UserPreferenceChanged += (_, _) => Enforce();
    }

    // Returns the number of slots that had to be reset.
    public static int Enforce()
    {
        var changed = 0;
        try
        {
            using (var cursors = Registry.CurrentUser.OpenSubKey(@"Control Panel\Cursors", true))
            {
                if (cursors != null)
                {
                    foreach (var slot in Slots)
                    {
                        var raw = cursors.GetValue(slot) as string;
                        if (IsApproved(raw)) continue;
                        cursors.SetValue(slot, "", RegistryValueKind.ExpandString);
                        Log($"reset {slot}: {raw}");
                        changed++;
                    }
                    if (changed > 0) cursors.SetValue("", "");
                }
            }
            using (var themes = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes"))
                if (!Equals(themes.GetValue("ThemeChangesMousePointers"), 0))
                    themes.SetValue("ThemeChangesMousePointers", 0, RegistryValueKind.DWord);
            if (changed > 0) SystemParametersInfo(0x0057 /* SPI_SETCURSORS */, 0, 0, 0x2 /* SPIF_SENDCHANGE */);
        }
        catch (Exception ex) { LogOnce("enforce failed: " + ex.Message); }
        // Only an existing per-user policy key is updated; it is never created here.
        try
        {
            using var policy = Registry.CurrentUser.OpenSubKey(@"Software\Policies\Microsoft\Windows\Personalization", true);
            if (policy != null && !Equals(policy.GetValue("NoChangingMousePointers"), 1))
                policy.SetValue("NoChangingMousePointers", 1, RegistryValueKind.DWord);
            if (policy != null && !Equals(policy.GetValue("NoChangingSoundScheme"), 1))
                policy.SetValue("NoChangingSoundScheme", 1, RegistryValueKind.DWord);
        }
        catch { }
        return changed;
    }

    private static string lastError = "";

    private static void LogOnce(string line)
    {
        if (line == lastError) return;
        lastError = line;
        Log(line);
    }

    private static bool IsApproved(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return true;
        try
        {
            var expanded = Environment.ExpandEnvironmentVariables(raw.Trim().Trim('"'));
            // Reject device paths (\\.\, \\?\), UNC shares and NTFS alternate streams outright.
            if (expanded.StartsWith(@"\\") || expanded.IndexOf(':', 2) >= 0) return false;
            if (expanded.Split('\\', '/').Contains("..")) return false;

            var full = Path.GetFullPath(expanded);
            if (!File.Exists(full)) return false;
            var sb = new System.Text.StringBuilder(1024);
            if (GetLongPathName(full, sb, (uint)sb.Capacity) == 0) return false;   // expands DOS 8.3 names
            full = sb.ToString();

            var ext = Path.GetExtension(full);
            if (!ext.Equals(".cur", StringComparison.OrdinalIgnoreCase) && !ext.Equals(".ani", StringComparison.OrdinalIgnoreCase))
                return false;

            var root = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "Cursors");
            if (!full.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) return false;

            var file = new FileInfo(full);
            if (file.LinkTarget != null || (file.Attributes & FileAttributes.ReparsePoint) != 0) return false;
            var dir = new DirectoryInfo(root);
            return dir.LinkTarget == null && (dir.Attributes & FileAttributes.ReparsePoint) == 0;
        }
        catch { return false; }
    }

    private static void Log(string line)
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(logPath)!);
            File.AppendAllText(logPath, $"{DateTime.Now:s} {line}{Environment.NewLine}");
        }
        catch { }
    }

    public static Task<string> AttachAsync(CoreWebView2 core) => core.AddScriptToExecuteOnDocumentCreatedAsync(PageScript);

    // Theme/pointer packages are the delivery vehicle for a themed-cursor takeover, so they are never downloaded or opened.
    private static readonly Regex ThemeFile = new(@"\.(theme|themepack|deskthemepack|cur|ani)(?=$|[\s""';])", RegexOptions.IgnoreCase);

    public static bool IsBlockedThemeFile(string name) =>
        !string.IsNullOrEmpty(name) && ThemeFile.IsMatch(name.TrimEnd(' ', '.'));   // Windows ignores trailing dots and spaces

    public static bool IsBlockedThemeUri(string uri)
    {
        try { return IsBlockedThemeFile(Uri.UnescapeDataString(new Uri(uri).AbsolutePath)); }
        catch { return false; }
    }

    // Only web links may leave the app; this stops theme files, ms-settings: and other shell handlers being launched.
    public static bool IsSafeExternalUri(string uri)
    {
        try
        {
            var u = new Uri(uri);
            return (u.Scheme == Uri.UriSchemeHttp || u.Scheme == Uri.UriSchemeHttps) && !IsBlockedThemeUri(uri);
        }
        catch { return false; }
    }

    public static void HardenBrowser(CoreWebView2 core)
    {
        core.DownloadStarting += (_, e) =>
        {
            var op = e.DownloadOperation;
            e.Cancel = true;
            e.Handled = true;
            Log("cancelled download: " + op.Uri);
        };
        core.NavigationStarting += (_, e) =>
        {
            if (IsBlockedThemeUri(e.Uri) || e.Uri.StartsWith("ms-settings:", StringComparison.OrdinalIgnoreCase))
            {
                e.Cancel = true;
                Log("blocked navigation: " + e.Uri);
            }
        };
    }

    // setProperty and cssText are filtered synchronously. Chromium exposes style.cursor through a named-property
    // interceptor with no prototype accessor, so direct assignments are cleaned by the MutationObserver at the next
    // microtask checkpoint, before the next paint; computed cursors are reset on pointer events.
    private const string PageScript = """
(()=>{
if(window.__sysCursorGuard)return;
try{Object.defineProperty(window,'__sysCursorGuard',{value:1})}catch(e){}
const SAFE=new Set(['auto','default','pointer','text','wait','progress','help','crosshair','not-allowed','no-drop','move','all-scroll','vertical-text','context-menu','cell','alias','copy','e-resize','n-resize','ne-resize','nw-resize','s-resize','se-resize','sw-resize','w-resize','ew-resize','ns-resize','nesw-resize','nwse-resize','col-resize','row-resize']);
const safeValue=v=>typeof v==='string'&&SAFE.has(v.trim().toLowerCase());
const P=CSSStyleDeclaration.prototype;
const sp=P.setProperty;
try{
  P.setProperty=function(n,v,p){if(/^cursor$/i.test(n)){if(!safeValue(v))return;return sp.call(this,n,v.trim().toLowerCase(),p)}return sp.call(this,n,v,p)};
}catch(e){}
try{
  const c=Object.getOwnPropertyDescriptor(P,'cssText');
  if(c&&c.configurable&&c.set)Object.defineProperty(P,'cssText',{get:c.get,set(v){c.set.call(this,v);const u=this.getPropertyValue('cursor');if(u&&!safeValue(u))this.removeProperty('cursor')},configurable:false});
}catch(e){}
const fix=el=>{
  if(!el||el.nodeType!==1)return;
  try{const v=getComputedStyle(el).cursor;if(v&&!SAFE.has(v.trim().toLowerCase()))sp.call(el.style,'cursor','auto','important')}catch(e){}
};
const onPtr=e=>{const t=e.composedPath&&e.composedPath()[0]||e.target;fix(t);fix(document.documentElement)};
for(const n of ['pointermove','pointerdown','mouseover','mousemove'])addEventListener(n,onPtr,{capture:true,passive:true});
try{
  const cleanStyle=el=>{if(el&&el.style){const v=el.style.getPropertyValue('cursor');if(v&&!safeValue(v))el.style.removeProperty('cursor')}};
  new MutationObserver(ms=>{for(const m of ms){if(m.type==='attributes')cleanStyle(m.target);else if(m.type==='childList')for(const n of m.addedNodes)if(n.nodeType===1){cleanStyle(n);n.querySelectorAll&&n.querySelectorAll('[style]').forEach(cleanStyle)}}}).observe(document,{attributes:true,attributeFilter:['style'],childList:true,subtree:true});
}catch(e){}
})();
""";
}
