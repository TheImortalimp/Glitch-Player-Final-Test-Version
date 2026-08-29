using Microsoft.Web.WebView2.Core;
using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Interop;

namespace StandaloneRevisionRFinal;

public partial class MainWindow : Window
{
    private const string AppHost = "player.local";
    private const int ResetToWelcomeCommand = 0x1FF0;
    private const int MfByCommand = 0x00000000;
    private const int MfSeparator = 0x00000800;

    public MainWindow()
    {
        InitializeComponent();
        SourceInitialized += ConfigureSystemMenu;
        Loaded += InitializePlayerAsync;
    }

    private void ConfigureSystemMenu(object? sender, EventArgs eventArgs)
    {
        var windowHandle = new WindowInteropHelper(this).Handle;
        var systemMenu = GetSystemMenu(windowHandle, false);
        AppendMenu(systemMenu, MfSeparator, UIntPtr.Zero, string.Empty);
        AppendMenu(systemMenu, MfByCommand, (UIntPtr)ResetToWelcomeCommand, "Return to welcome screen");
        HwndSource.FromHwnd(windowHandle)?.AddHook(HandleWindowMessage);
    }

    private IntPtr HandleWindowMessage(IntPtr windowHandle, int message, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        const int WmSysCommand = 0x0112;
        if (message == WmSysCommand && (wParam.ToInt32() & 0xFFF0) == ResetToWelcomeCommand)
        {
            ResetToWelcomeScreen();
            handled = true;
        }
        return IntPtr.Zero;
    }

    private void ResetToWelcomeScreen()
    {
        if (PlayerView.CoreWebView2 is null)
        {
            return;
        }

        var resetUrl = $"https://{AppHost}/glitch-canvas-v-sync.html?welcome={DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        PlayerView.CoreWebView2.Navigate(resetUrl);
    }

    private async void InitializePlayerAsync(object sender, RoutedEventArgs eventArgs)
    {
        try
        {
            var userDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "TheImortalimp",
                "StandaloneRevisionRFinal",
                "WebView2");
            Directory.CreateDirectory(userDataPath);
            var environment = await CoreWebView2Environment.CreateAsync(null, userDataPath);
            await PlayerView.EnsureCoreWebView2Async(environment);

            var webUiPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "webui"));
            if (!Directory.Exists(webUiPath))
            {
                webUiPath = Path.Combine(AppContext.BaseDirectory, "webui");
            }
            if (!File.Exists(Path.Combine(webUiPath, "glitch-canvas-v-sync.html")))
            {
                MessageBox.Show("The bundled player files are missing.", Title, MessageBoxButton.OK, MessageBoxImage.Error);
                Close();
                return;
            }

            PlayerView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                AppHost,
                webUiPath,
                CoreWebView2HostResourceAccessKind.DenyCors);
            PlayerView.CoreWebView2.NewWindowRequested += BlockNewWindows;
            PlayerView.CoreWebView2.NavigationStarting += RestrictTopLevelNavigation;
            PlayerView.CoreWebView2.Navigate($"https://{AppHost}/glitch-canvas-v-sync.html");
        }
        catch (Exception exception)
        {
            var diagnosticPath = Path.Combine(AppContext.BaseDirectory, "startup-error.log");
            File.WriteAllText(diagnosticPath, exception.ToString());
            MessageBox.Show($"Unable to start the media player shell.\n\n{exception.Message}", Title, MessageBoxButton.OK, MessageBoxImage.Error);
            Close();
        }
    }

    private static void BlockNewWindows(object? sender, CoreWebView2NewWindowRequestedEventArgs eventArgs)
    {
        eventArgs.Handled = true;
    }

    private static void RestrictTopLevelNavigation(object? sender, CoreWebView2NavigationStartingEventArgs eventArgs)
    {
        if (!Uri.TryCreate(eventArgs.Uri, UriKind.Absolute, out var uri))
        {
            eventArgs.Cancel = true;
            return;
        }

        var host = uri.Host.ToLowerInvariant();
        var isAppPage = uri.Scheme == Uri.UriSchemeHttps && host == AppHost;
        if (uri.Scheme == Uri.UriSchemeHttps && host == "www.imortalimp.nl")
        {
            eventArgs.Cancel = true;
            Process.Start(new ProcessStartInfo(uri.AbsoluteUri) { UseShellExecute = true });
            return;
        }
        var isYouTube = uri.Scheme == Uri.UriSchemeHttps &&
            (host == "youtube.com" || host.EndsWith(".youtube.com", StringComparison.Ordinal) || host == "youtu.be");
        eventArgs.Cancel = !isAppPage && !isYouTube;
    }

    [System.Runtime.InteropServices.DllImport("user32.dll", CharSet = System.Runtime.InteropServices.CharSet.Unicode)]
    private static extern IntPtr GetSystemMenu(IntPtr windowHandle, bool revert);

    [System.Runtime.InteropServices.DllImport("user32.dll", CharSet = System.Runtime.InteropServices.CharSet.Unicode)]
    private static extern bool AppendMenu(IntPtr menuHandle, int flags, UIntPtr itemId, string text);
}