using System.Management;
using System.Runtime.CompilerServices;
using Microsoft.Web.WebView2.Core;

namespace GlitchPlayerR4;

// Keep WebView2 reputation checks enabled and report Windows Security Center state.
// Downloads are cancelled by policy, so no download scanner is attached.
internal static class DefenderGuard
{
    private static readonly List<WeakReference<CoreWebView2>> Attached = new();
    private static readonly object Gate = new();
    private static readonly ConditionalWeakTable<CoreWebView2, object> ExpectedAppNavigation = new();
    private static System.Windows.Forms.Timer watchdog;
    private static string lastWarning;

    public static void Init()
    {
        watchdog = new System.Windows.Forms.Timer { Interval = 300_000 };
        watchdog.Tick += (_, _) => CheckSecurityCenter();
        watchdog.Start();
        CheckSecurityCenter();
    }

    public static void AllowAppDocumentNavigation(CoreWebView2 core)
    {
        ExpectedAppNavigation.Remove(core);
        ExpectedAppNavigation.Add(core, new object());
    }

    public static void Attach(CoreWebView2 core)
    {
        core.Settings.IsReputationCheckingRequired = true;
        lock (Gate) Attached.Add(new WeakReference<CoreWebView2>(core));
        core.NavigationStarting += (_, e) =>
        {
            if (ExpectedAppNavigation.TryGetValue(core, out _) && AppPolicy.IsAppDocument(e.Uri))
            {
                ExpectedAppNavigation.Remove(core);
                return;
            }
            if (AppPolicy.IsBlockedScheme(e.Uri))
            {
                e.Cancel = true;
                HostLog.Write(AppPaths.HostLog, "blocked risky navigation scheme: " + AppPolicy.Shorten(e.Uri));
            }
        };
        core.DownloadStarting += (_, e) =>
        {
            e.Cancel = true;
            e.Handled = true;
            HostLog.Write(AppPaths.HostLog, "cancelled download: " + AppPolicy.Shorten(e.DownloadOperation.Uri));
        };
    }

    public static void Reassert()
    {
        lock (Gate)
        {
            for (var i = Attached.Count - 1; i >= 0; i--)
            {
                if (!Attached[i].TryGetTarget(out var core))
                {
                    Attached.RemoveAt(i);
                    continue;
                }
                try
                {
                    if (!core.Settings.IsReputationCheckingRequired)
                    {
                        core.Settings.IsReputationCheckingRequired = true;
                        HostLog.Write("re-enabled SmartScreen reputation checking");
                    }
                }
                catch (ObjectDisposedException) { Attached.RemoveAt(i); }
                catch (InvalidOperationException) { Attached.RemoveAt(i); }
            }
        }
    }

    private static void CheckSecurityCenter()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher(
                @"root\SecurityCenter2", "SELECT displayName, productState FROM AntiVirusProduct");
            var enabled = new List<string>();
            var stale = new List<string>();
            var total = 0;
            foreach (ManagementObject av in searcher.Get())
            {
                total++;
                var name = av["displayName"] as string ?? "antivirus";
                var state = Convert.ToUInt32(av["productState"]);
                if (((state >> 8) & 0xFF) is 0x10 or 0x11)
                {
                    enabled.Add(name);
                    if ((state & 0xFF) != 0) stale.Add(name);
                }
            }
            var warning =
                total == 0 ? "No antivirus product is registered with Windows Security Center." :
                enabled.Count == 0 ? "Real-time antivirus protection appears to be off. Check Windows Security before using this app." :
                stale.Count > 0 ? "Antivirus definitions may be out of date for: " + string.Join(", ", stale) + "." :
                null;
            if (warning == null)
            {
                lastWarning = null;
                return;
            }
            if (warning == lastWarning) return;
            lastWarning = warning;
            HostLog.Write(AppPaths.HostLog, "Security Center watchdog: " + warning);
            MessageBox.Show(warning, AppPaths.AppName + " security", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
        catch (Exception e) when (e is ManagementException or UnauthorizedAccessException or System.Runtime.InteropServices.COMException or InvalidOperationException)
        {
            HostLog.Write(AppPaths.HostLog, "Security Center watchdog unavailable: " + e.Message);
        }
    }
}
