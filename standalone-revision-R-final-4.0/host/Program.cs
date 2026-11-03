using Microsoft.Win32;

namespace GlitchPlayerR4;

internal static class Program
{
    private static readonly string[] UnsafeEnvironmentVariables =
    {
        "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
        "WEBVIEW2_PIPE_FOR_SCRIPT_DEBUGGER",
        "WEBVIEW2_WAIT_FOR_SCRIPT_DEBUGGER",
        "WEBVIEW2_BROWSER_EXECUTABLE_FOLDER",
        "WEBVIEW2_USER_DATA_FOLDER",
        "WEBVIEW2_RELEASE_CHANNEL_PREFERENCE",
        "WEBVIEW2_CHANNEL_SEARCH_KIND",
    };

    [STAThread]
    private static void Main(string[] args)
    {
        if (args.Length != 0 && (args.Length != 2 || args[0] != "--launcher" ||
            !Path.IsPathFullyQualified(args[1]) || !File.Exists(args[1]) ||
            !Path.GetFileName(args[1]).Equals("GlitchPlayerR4.exe", StringComparison.OrdinalIgnoreCase)))
        {
            MessageBox.Show("The launcher arguments are not valid.", AppPaths.AppName, MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }
        AppPaths.LauncherPath = args.Length == 2 ? Path.GetFullPath(args[1]) : Environment.ProcessPath;
        if (!ValidateEnvironment())
        {
            MessageBox.Show(
                "The app cannot start because an external WebView2 override is configured. Remove the reported environment or policy override and try again.",
                AppPaths.AppName, MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        NativeMethods.SetDllDirectory("");
        CursorGuard.HardenProcess();
        ApplicationConfiguration.Initialize();
        WindowShell.Initialize();
        Directory.CreateDirectory(AppPaths.DataDir);
        Directory.CreateDirectory(AppPaths.ProfileDir);
        Directory.CreateDirectory(AppPaths.MediaCacheDir);
        CursorGuard.Start(AppPaths.AppName);
        DefenderGuard.Init();
        Application.Run(new MainForm());
    }

    private static bool ValidateEnvironment()
    {
        foreach (var name in UnsafeEnvironmentVariables)
        {
            if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(name))) continue;
            HostLog.Write(AppPaths.HostLog, "refused WebView2 environment override: " + name);
            return false;
        }

        if (HasWebView2PolicyOverride())
        {
            HostLog.Write("refused WebView2 policy override");
            return false;
        }

        return true;
    }

    private static bool HasWebView2PolicyOverride()
    {
        const string keyPath = @"Software\Policies\Microsoft\Edge\WebView2";
        string exeName = Path.GetFileName(Environment.ProcessPath) ?? "GlitchPlayerR4.exe";
        foreach (var root in new[] { Registry.CurrentUser, Registry.LocalMachine })
        {
            try
            {
                using var key = root.OpenSubKey(keyPath, writable: false);
                if (key == null) continue;
                foreach (var valueName in key.GetValueNames())
                {
                    if (!IsRelevantPolicy(valueName)) continue;
                    var value = key.GetValue(valueName)?.ToString();
                    if (!string.IsNullOrWhiteSpace(value)) return true;
                }
                foreach (var subkeyName in key.GetSubKeyNames())
                {
                    if (subkeyName == "*" || subkeyName.Equals(exeName, StringComparison.OrdinalIgnoreCase))
                        return true;
                }
            }
            catch (Exception e) when (e is UnauthorizedAccessException or System.Security.SecurityException)
            {
                HostLog.Write("could not inspect WebView2 policy key: " + e.Message);
                return true;
            }
        }
        return false;
    }

    private static bool IsRelevantPolicy(string name) =>
        name.Equals("AdditionalBrowserArguments", StringComparison.OrdinalIgnoreCase) ||
        name.Equals("BrowserExecutableFolder", StringComparison.OrdinalIgnoreCase) ||
        name.Equals("UserDataFolder", StringComparison.OrdinalIgnoreCase) ||
        name.Equals("ReleaseChannelPreference", StringComparison.OrdinalIgnoreCase) ||
        name.Equals("ChannelSearchKind", StringComparison.OrdinalIgnoreCase);
}
