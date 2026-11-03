using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace GlitchPlayerR4;

internal sealed class MainForm : Form
{
    private const int BorderSize = 6;
    private readonly WebView2 view = new();
    private LocalMediaConverter mediaConverter;
    private CancellationTokenSource mediaConversion;
    private string mediaRequestId;
    private bool initializing;
    private bool fullScreen;
    private Rectangle restoreBounds;
    private FormWindowState restoreWindowState;
    private int lastRendererRecoveryTick;
    private string refreshDevice;
    private string postedRefresh;
    private bool freezeFrameBusy;
    private bool windowDialogBusy;

    public MainForm()
    {
        Text = "Glitch Player R4";
        Name = "GlitchPlayerR4";
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.None;
        MinimumSize = new Size(480, 320);
        Size = new Size(1280, 800);
        Padding = Padding.Empty;
        BackColor = Color.FromArgb(8, 10, 15);
        KeyPreview = true;
        Icon = Icon.ExtractAssociatedIcon(Environment.ProcessPath);
        view.Dock = DockStyle.Fill;
        view.DefaultBackgroundColor = Color.FromArgb(8, 10, 15);
        Controls.Add(view);
        Shown += OnShown;
        FormClosing += OnFormClosing;
        Resize += (_, _) => ApplyCaptureShield();
        LocationChanged += (_, _) => PostDisplayRefresh(false);
        Microsoft.Win32.SystemEvents.DisplaySettingsChanged += OnDisplaySettingsChanged;
        FormClosed += (_, _) => Microsoft.Win32.SystemEvents.DisplaySettingsChanged -= OnDisplaySettingsChanged;
    }

    private async void OnShown(object sender, EventArgs e)
    {
        if (initializing) return;
        initializing = true;
        try
        {
            WindowShell.ConfigureWindow(Handle, AppPaths.LauncherPath);
            await InitializeWebViewAsync();
            ApplyCaptureShield();
        }
        catch (Exception error) when (error is InvalidOperationException or IOException or UnauthorizedAccessException or System.Runtime.InteropServices.COMException or ArgumentException)
        {
            HostLog.Write(AppPaths.HostLog, "WebView2 startup failed: " + error);
            MessageBox.Show(
                "Glitch Player could not start its WebView2 runtime. Install or repair the Microsoft Edge WebView2 Runtime, then try again.\n\n" + error.Message,
                AppPaths.AppName, MessageBoxButtons.OK, MessageBoxIcon.Error);
            Close();
        }
    }

    private async Task InitializeWebViewAsync()
    {
        if (!Directory.Exists(AppPaths.WebUiDir) || !File.Exists(Path.Combine(AppPaths.WebUiDir, "index.html")))
            throw new FileNotFoundException("The bundled web UI is missing.", Path.Combine(AppPaths.WebUiDir, "index.html"));

        var options = new CoreWebView2EnvironmentOptions
        {
            AllowSingleSignOnUsingOSPrimaryAccount = false,
            // HardwareMediaKeyHandling off keeps playback out of the Windows media
            // controls, so media keys, headsets and other apps cannot drive it.
            AdditionalBrowserArguments =
                "--autoplay-policy=no-user-gesture-required " +
                "--disable-features=CalculateNativeWinOcclusion,HardwareMediaKeyHandling " +
                "--disable-backgrounding-occluded-windows " +
                "--disable-renderer-backgrounding",
        };
#if DEBUG
        var debugPort = Environment.GetEnvironmentVariable("GPR4_DEBUG_PORT");
        if (!string.IsNullOrEmpty(debugPort) && int.TryParse(debugPort, out var port) && port is >= 1024 and <= 65535)
            options.AdditionalBrowserArguments += " --remote-debugging-port=" + port;
#endif
        var environment = await CoreWebView2Environment.CreateAsync(null, AppPaths.ProfileDir, options);
        await view.EnsureCoreWebView2Async(environment);
        var core = view.CoreWebView2;
        ConfigureCore(core);
        // Registered before the first navigation so the app document and every frame get the page-level pointer guard.
        await CursorGuard.AttachAsync(core);

        core.SetVirtualHostNameToFolderMapping(
            AppPolicy.AppHost, AppPaths.WebUiDir, CoreWebView2HostResourceAccessKind.DenyCors);
        core.SetVirtualHostNameToFolderMapping(
            AppPolicy.MediaHost, AppPaths.MediaCacheDir, CoreWebView2HostResourceAccessKind.Allow);

        mediaConverter = new LocalMediaConverter(AppPaths.MediaCacheDir, LoadMediaKey());
        CleanupMediaCache();
        DefenderGuard.AllowAppDocumentNavigation(core);
        core.Navigate(AppPolicy.AppDocument);
    }

    private void ConfigureCore(CoreWebView2 core)
    {
        var settings = core.Settings;
        settings.AreDevToolsEnabled = false;
        settings.AreHostObjectsAllowed = false;
        settings.AreDefaultContextMenusEnabled = false;
        settings.IsStatusBarEnabled = false;
        settings.IsZoomControlEnabled = false;
        settings.IsPinchZoomEnabled = false;
        settings.IsSwipeNavigationEnabled = false;
        settings.IsPasswordAutosaveEnabled = false;
        settings.IsGeneralAutofillEnabled = false;
        settings.AreBrowserAcceleratorKeysEnabled = false;
        settings.IsReputationCheckingRequired = true;
        settings.IsNonClientRegionSupportEnabled = true;

        view.KeyDown += (_, e) =>
        {
            if (HandleWindowKey(e.KeyData)) e.Handled = true;
        };
        DefenderGuard.Attach(core);
        CaptureGuard.HardenBrowser(core);
        CursorGuard.HardenBrowser(core);
        core.NavigationStarting += OnNavigationStarting;
        core.FrameNavigationStarting += OnFrameNavigationStarting;
        core.NewWindowRequested += OnNewWindowRequested;
        core.WebMessageReceived += OnWebMessageReceived;
        core.PermissionRequested += OnPermissionRequested;
        core.ProcessFailed += OnProcessFailed;
        core.NavigationCompleted += (_, e) =>
        {
            if (e.IsSuccess) { PostDisplayRefresh(true); PostWindowState(); }
        };
        core.ContainsFullScreenElementChanged += (_, _) =>
        {
            if (core.ContainsFullScreenElement) EnterFullScreen();
            else if (fullScreen) ExitFullScreen();
        };
        _ = core.AddScriptToExecuteOnDocumentCreatedAsync(
            "(()=>{try{if(location.hostname!=='player-r4.local'&&window.chrome&&window.chrome.webview)delete window.chrome.webview}catch(e){}})();");
    }

    private void OnNavigationStarting(object sender, CoreWebView2NavigationStartingEventArgs e)
    {
        if (AppPolicy.IsAppDocument(e.Uri)) return;
        e.Cancel = true;
        HostLog.Write(AppPaths.HostLog, "blocked top-level navigation: " + AppPolicy.Shorten(e.Uri));
        if (e.IsUserInitiated && AppPolicy.IsAllowedExternalUri(e.Uri))
        {
            var uri = e.Uri;
            BeginInvoke(() => ConfirmExternalOpen(uri));
        }
    }

    private void OnFrameNavigationStarting(object sender, CoreWebView2NavigationStartingEventArgs e)
    {
        if (AppPolicy.IsAllowedFrameUri(e.Uri)) return;
        e.Cancel = true;
        HostLog.Write(AppPaths.HostLog, "blocked frame navigation: " + AppPolicy.Shorten(e.Uri));
    }

    private void OnNewWindowRequested(object sender, CoreWebView2NewWindowRequestedEventArgs e)
    {
        e.Handled = true;
        if (e.IsUserInitiated && AppPolicy.IsAllowedExternalUri(e.Uri))
        {
            var uri = e.Uri;
            BeginInvoke(() => ConfirmExternalOpen(uri));
        }
        else HostLog.Write(AppPaths.HostLog, "blocked new window: " + AppPolicy.Shorten(e.Uri));
    }

    // The player needs no camera, microphone, clipboard, location, notification, sensor, MIDI, font or file-system
    // permission, so every request from any frame is denied without a prompt and nothing is saved in the profile.
    private void OnPermissionRequested(object sender, CoreWebView2PermissionRequestedEventArgs e)
    {
        e.State = CoreWebView2PermissionState.Deny;
        e.SavesInProfile = false;
        HostLog.Write(AppPaths.HostLog, "denied permission " + e.PermissionKind + ": " + AppPolicy.Shorten(e.Uri));
    }

    private void ConfirmExternalOpen(string uri)
    {
        if (!AppPolicy.IsAllowedExternalUri(uri)) return;
        if (windowDialogBusy) { HostLog.Write("ignored external link while a confirmation is active"); return; }
        windowDialogBusy = true;
        try
        {
            if (MessageBox.Show(this,
                    "Open this link in your default browser?\n\n" + AppPolicy.Shorten(uri),
                    AppPaths.AppName, MessageBoxButtons.YesNo, MessageBoxIcon.Question,
                    MessageBoxDefaultButton.Button2) != DialogResult.Yes) return;
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(uri) { UseShellExecute = true });
        }
        catch (Exception e) when (e is System.ComponentModel.Win32Exception or InvalidOperationException or System.Security.SecurityException)
        {
            HostLog.Write(AppPaths.HostLog, "could not open confirmed external link: " + e.Message);
            MessageBox.Show("The link could not be opened by the default browser.", AppPaths.AppName,
                MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
        finally { windowDialogBusy = false; }
    }

    private async void OnWebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        if (!AppPolicy.IsAppDocument(e.Source))
        {
            HostLog.Write(AppPaths.HostLog, "ignored WebMessageReceived from a non-app document: " + AppPolicy.Shorten(e.Source));
            return;
        }
        string message;
        try { message = e.TryGetWebMessageAsString(); }
        catch (InvalidOperationException)
        {
            HostLog.Write("ignored non-string WebView2 message");
            return;
        }
        if (!AppPolicy.TrySplitMessage(message, out var kind, out var payload))
        {
            HostLog.Write("ignored invalid or oversized WebView2 message");
            return;
        }

        switch (kind)
        {
            case "window:command":
                if (AppPolicy.IsWindowCommand(payload)) BeginInvoke(() => RunWindowCommand(payload));
                else HostLog.Write("rejected invalid window command");
                break;
            case "media:convert":
                await ConvertLocalMediaAsync(payload, e);
                break;
            case "media:cancel":
                CancelMediaConversion(payload);
                break;
            case "presets:export":
                ExportPresets(payload);
                break;
            case "freeze:capture":
                await CaptureFreezeFrameAsync(payload);
                break;
            case "log":
                if (AppPolicy.IsLogEvent(payload)) HostLog.Write("renderer: " + payload);
                else HostLog.Write("ignored invalid renderer log code");
                break;
            case "ui:escape":
                if (fullScreen) ExitFullScreen();
                break;
        }
    }

    private async Task ConvertLocalMediaAsync(string json, CoreWebView2WebMessageReceivedEventArgs message)
    {
        if (!AppPolicy.TryParseConvertRequest(json, out var id, out var kind))
        {
            PostMediaResult(null, "Invalid local media conversion request.");
            return;
        }
        var objects = message.AdditionalObjects;
        if (objects.Count != 1 || objects[0] is not CoreWebView2File file)
        {
            PostMediaResult(id, "Choose one local file in the app before converting it.");
            return;
        }

        mediaConversion?.Cancel();
        var conversion = new CancellationTokenSource();
        mediaConversion = conversion;
        mediaRequestId = id;
        try
        {
            var name = await mediaConverter.ConvertAsync(file.Path, kind, conversion.Token);
            if (!conversion.IsCancellationRequested && !IsDisposed)
            {
                CleanupMediaCache();
                view.CoreWebView2.PostWebMessageAsString("media:result|" +
                    JsonSerializer.Serialize(new { id, url = AppPolicy.MediaOrigin + "/" + name }));
            }
        }
        catch (OperationCanceledException) when (conversion.IsCancellationRequested) { }
        catch (Exception error) when (error is ArgumentException or IOException or UnauthorizedAccessException or InvalidOperationException or NotSupportedException or System.Runtime.InteropServices.COMException or System.ComponentModel.Win32Exception)
        {
            HostLog.Write(AppPaths.HostLog, "local media conversion failed: " + error);
            PostMediaResult(id, error.Message);
        }
        finally
        {
            if (ReferenceEquals(mediaConversion, conversion))
            {
                mediaConversion = null;
                mediaRequestId = null;
            }
            conversion.Dispose();
        }
    }

    private void PostMediaResult(string id, string error)
    {
        if (IsDisposed || view.CoreWebView2 == null) return;
        try
        {
            view.CoreWebView2.PostWebMessageAsString("media:result|" + JsonSerializer.Serialize(new { id, error }));
        }
        catch (InvalidOperationException e) { HostLog.Write(AppPaths.HostLog, "could not post media result: " + e.Message); }
    }

    private void CancelMediaConversion(string id)
    {
        if (AppPolicy.IsRequestId(id) && mediaRequestId == id) mediaConversion?.Cancel();
    }

    private void ExportPresets(string json)
    {
        if (!AppPolicy.IsValidPresetExport(json))
        {
            HostLog.Write("rejected invalid preset export request");
            return;
        }
        using var dialog = new SaveFileDialog
        {
            Title = "Export Glitch Player presets",
            Filter = "JSON preset files (*.json)|*.json",
            DefaultExt = "json",
            AddExtension = true,
            FileName = "glitchCanvasPresets_v2.json",
            OverwritePrompt = true,
            // Without this the dialog can open in the working directory, which is the install folder.
            InitialDirectory = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
        };
        if (!ChooseSavePathOutsideApp(dialog)) return;
        try
        {
            File.WriteAllText(dialog.FileName, json, new UTF8Encoding(false));
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException or ArgumentException)
        {
            HostLog.Write(AppPaths.HostLog, "preset export failed: " + error);
            MessageBox.Show("The preset file could not be saved.\n\n" + error.Message, AppPaths.AppName,
                MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    // Saved files never go into the install folder (replaced on update) or the data folder (removed on uninstall).
    private bool ChooseSavePathOutsideApp(SaveFileDialog dialog)
    {
        while (true)
        {
            if (dialog.ShowDialog(this) != DialogResult.OK) return false;
            if (!AppPolicy.IsInsideFolder(dialog.FileName, AppContext.BaseDirectory) &&
                !AppPolicy.IsInsideFolder(dialog.FileName, Path.GetDirectoryName(AppPaths.LauncherPath)) &&
                !AppPolicy.IsInsideFolder(dialog.FileName, AppPaths.DataDir)) return true;
            MessageBox.Show(
                "Choose a folder outside the app's install and data folders. Updates replace the install folder, and uninstall can remove both.",
                AppPaths.AppName, MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
    }

    // FREEZE FRAME: the page hides its HUD and asks for a capture. The host takes the PNG itself,
    // tells the page it can restore the HUD, and saves only through a user-chosen Save dialog.
    // No image data is posted back into the page.
    private async Task CaptureFreezeFrameAsync(string id)
    {
        if (!AppPolicy.IsRequestId(id))
        {
            HostLog.Write("rejected invalid freeze frame request");
            return;
        }
        if (freezeFrameBusy)
        {
            PostFreezeResult(id, "A freeze frame is already being saved.");
            return;
        }
        var core = view.CoreWebView2;
        if (core == null) return;
        freezeFrameBusy = true;
        try
        {
            byte[] png;
            try
            {
                using var stream = new MemoryStream();
                await core.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png, stream);
                png = stream.ToArray();
            }
            catch (Exception error) when (error is InvalidOperationException or ArgumentException or System.Runtime.InteropServices.COMException)
            {
                HostLog.Write(AppPaths.HostLog, "freeze frame capture failed: " + error);
                PostFreezeResult(id, "The frame could not be captured.");
                return;
            }
            if (IsDisposed) return;
            PostFreezeResult(id, png.Length == 0 ? "The frame could not be captured." : null);
            if (png.Length == 0) return;
            // The capture completion runs inside a WebView2 callback, and WebView2 holds back further
            // events until that callback returns. Leave it before the modal dialog so a repeat request
            // is answered "busy" now instead of queuing behind the dialog and capturing later.
            await Task.Yield();
            if (IsDisposed) return;

            using var dialog = new SaveFileDialog
            {
                Title = "Save freeze frame",
                Filter = "PNG image (*.png)|*.png",
                DefaultExt = "png",
                AddExtension = true,
                FileName = "glitch-player-freeze-" +
                    DateTime.Now.ToString("yyyyMMdd-HHmmss", System.Globalization.CultureInfo.InvariantCulture) + ".png",
                OverwritePrompt = true,
                InitialDirectory = Environment.GetFolderPath(Environment.SpecialFolder.MyPictures),
            };
            if (!ChooseSavePathOutsideApp(dialog)) return;
            try
            {
                File.WriteAllBytes(dialog.FileName, png);
            }
            catch (Exception error) when (error is IOException or UnauthorizedAccessException or ArgumentException)
            {
                HostLog.Write(AppPaths.HostLog, "freeze frame save failed: " + error);
                MessageBox.Show("The freeze frame could not be saved.\n\n" + error.Message, AppPaths.AppName,
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        finally
        {
            freezeFrameBusy = false;
        }
    }

    private void PostFreezeResult(string id, string error)
    {
        if (IsDisposed || view.CoreWebView2 == null) return;
        try
        {
            view.CoreWebView2.PostWebMessageAsString("freeze:captured|" +
                JsonSerializer.Serialize(new { id, ok = error == null, error }));
        }
        catch (InvalidOperationException e) { HostLog.Write(AppPaths.HostLog, "could not post freeze frame result: " + e.Message); }
    }

    private static byte[] LoadMediaKey()
    {
        Directory.CreateDirectory(AppPaths.DataDir);
        if (File.Exists(AppPaths.MediaKeyFile))
        {
            var existing = File.ReadAllBytes(AppPaths.MediaKeyFile);
            if (existing.Length != 32) throw new IOException("The local media cache key is invalid. Remove media-key.bin and restart the app.");
            return existing;
        }
        var key = RandomNumberGenerator.GetBytes(32);
        try
        {
            using var stream = new FileStream(AppPaths.MediaKeyFile, FileMode.CreateNew, FileAccess.Write, FileShare.None);
            stream.Write(key);
        }
        catch (IOException) when (File.Exists(AppPaths.MediaKeyFile))
        {
            CryptographicOperations.ZeroMemory(key);
            var existing = File.ReadAllBytes(AppPaths.MediaKeyFile);
            if (existing.Length != 32) throw new IOException("The local media cache key is invalid. Remove media-key.bin and restart the app.");
            return existing;
        }
        return key;
    }

    private static void CleanupMediaCache()
    {
        try
        {
            var files = new DirectoryInfo(AppPaths.MediaCacheDir).GetFiles();
            var cutoff = DateTime.UtcNow.AddDays(-30);
            foreach (var file in files)
            {
                if (file.Name.EndsWith(".partial.mp4", StringComparison.OrdinalIgnoreCase) ||
                    file.Name.EndsWith(".partial.m4a", StringComparison.OrdinalIgnoreCase) ||
                    file.LastWriteTimeUtc < cutoff)
                {
                    try { file.Delete(); }
                    catch (Exception error) when (error is IOException or UnauthorizedAccessException)
                    {
                        HostLog.Write(AppPaths.HostLog, "media cache cleanup failed: " + error.Message);
                    }
                }
            }
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException)
        {
            HostLog.Write(AppPaths.HostLog, "could not inspect media cache: " + error.Message);
        }
    }

    private void OnProcessFailed(object sender, CoreWebView2ProcessFailedEventArgs e)
    {
        HostLog.Write(AppPaths.HostLog, $"WebView2 process failure ({e.ProcessFailedKind}): {e.Reason}");
        if (e.ProcessFailedKind == CoreWebView2ProcessFailedKind.BrowserProcessExited)
        {
            MessageBox.Show("The WebView2 browser process stopped. The app will close; restart it to continue.",
                AppPaths.AppName, MessageBoxButtons.OK, MessageBoxIcon.Error);
            Close();
            return;
        }
        var now = Environment.TickCount;
        if (unchecked(now - lastRendererRecoveryTick) < 10_000) return;
        lastRendererRecoveryTick = now;
        try { view.CoreWebView2?.Reload(); }
        catch (InvalidOperationException error) { HostLog.Write(AppPaths.HostLog, "renderer recovery failed: " + error.Message); }
    }

    protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
    {
        return HandleWindowKey(keyData) || base.ProcessCmdKey(ref msg, keyData);
    }

    private bool HandleWindowKey(Keys keyData)
    {
        bool toggle = keyData == Keys.F11 || keyData == (Keys.Alt | Keys.Enter);
        if (!toggle && !(keyData == Keys.Escape && fullScreen)) return false;
        BeginInvoke(() =>
        {
            if (toggle) ToggleFullScreen();
            else ExitFullScreen();
        });
        return true;
    }

    private void ToggleFullScreen()
    {
        if (fullScreen) ExitFullScreen();
        else EnterFullScreen();
    }

    private void EnterFullScreen()
    {
        if (fullScreen || WindowState == FormWindowState.Minimized) return;
        fullScreen = true;
        restoreBounds = Bounds;
        restoreWindowState = WindowState;
        SuspendLayout();
        Padding = Padding.Empty;
        FormBorderStyle = FormBorderStyle.None;
        Bounds = Screen.FromControl(this).Bounds;
        ResumeLayout(true);
        PostWindowState();
    }

    private void ExitFullScreen()
    {
        if (!fullScreen) return;
        fullScreen = false;
        SuspendLayout();
        Padding = Padding.Empty;
        Bounds = restoreBounds;
        WindowState = restoreWindowState;
        ResumeLayout(true);
        PostWindowState();
    }

    private void ToggleMaximize()
    {
        if (fullScreen) return;
        WindowState = WindowState == FormWindowState.Maximized ? FormWindowState.Normal : FormWindowState.Maximized;
    }

    private void ToggleCaptureShield()
    {
        var enabled = Settings.Get("shield", "off") != "on";
        Settings.Set("shield", enabled ? "on" : "off");
        ApplyCaptureShield();
        PostWindowState();
    }

    private void ApplyCaptureShield()
    {
        if (!IsHandleCreated || IsDisposed) return;
        var enabled = Settings.Get("shield", "off") == "on";
        if (!CaptureGuard.Apply(this, enabled))
        {
            HostLog.Write(AppPaths.HostLog, "SetWindowDisplayAffinity failed (shield " + (enabled ? "on" : "off") + ").");
        }
    }

    protected override void WndProc(ref Message m)
    {
        if (m.Msg == WindowShell.RefreshMessage || m.Msg == WindowShell.ActivateMessage)
        {
            bool refresh = m.Msg == WindowShell.RefreshMessage;
            BeginInvoke(() =>
            {
                if (WindowState == FormWindowState.Minimized) WindowState = FormWindowState.Normal;
                Activate();
                if (refresh) RefreshPlayer();
            });
            return;
        }
        if (m.Msg == NativeMethods.WmNcHitTest && !fullScreen && WindowState == FormWindowState.Normal)
        {
            var x = unchecked((short)((long)m.LParam & 0xFFFF));
            var y = unchecked((short)(((long)m.LParam >> 16) & 0xFFFF));
            var point = PointToClient(new Point(x, y));
            var left = point.X < BorderSize;
            var right = point.X >= ClientSize.Width - BorderSize;
            var top = point.Y < BorderSize;
            var bottom = point.Y >= ClientSize.Height - BorderSize;
            if (top && left) m.Result = (nint)NativeMethods.HtTopLeft;
            else if (top && right) m.Result = (nint)NativeMethods.HtTopRight;
            else if (bottom && left) m.Result = (nint)NativeMethods.HtBottomLeft;
            else if (bottom && right) m.Result = (nint)NativeMethods.HtBottomRight;
            else if (left) m.Result = (nint)NativeMethods.HtLeft;
            else if (right) m.Result = (nint)NativeMethods.HtRight;
            else if (top) m.Result = (nint)NativeMethods.HtTop;
            else if (bottom) m.Result = (nint)NativeMethods.HtBottom;
            else m.Result = (nint)NativeMethods.HtClient;
            return;
        }
        if (m.Msg == NativeMethods.WmGetMinMaxInfo && WindowState == FormWindowState.Maximized)
        {
            var monitor = NativeMethods.MonitorFromWindow(Handle, NativeMethods.MonitorDefaultToNearest);
            var info = new NativeMethods.MonitorInfo { Size = System.Runtime.InteropServices.Marshal.SizeOf<NativeMethods.MonitorInfo>() };
            if (monitor != 0 && NativeMethods.GetMonitorInfo(monitor, ref info))
            {
                var ptr = m.LParam;
                var minMax = System.Runtime.InteropServices.Marshal.PtrToStructure<NativeMethods.MinMaxInfo>(ptr);
                minMax.MaxPosition = new NativeMethods.Point
                {
                    X = info.Work.Left - info.Monitor.Left,
                    Y = info.Work.Top - info.Monitor.Top,
                };
                minMax.MaxSize = new NativeMethods.Point
                {
                    X = info.Work.Right - info.Work.Left,
                    Y = info.Work.Bottom - info.Work.Top,
                };
                System.Runtime.InteropServices.Marshal.StructureToPtr(minMax, ptr, false);
            }
        }
        base.WndProc(ref m);
    }

    private void PostWindowState()
    {
        if (view.CoreWebView2 == null) return;
        try { view.CoreWebView2.PostWebMessageAsString("window:state|" + (fullScreen ? "full" : "window") + "," + (Settings.Get("shield", "off") == "on" ? "on" : "off")); }
        catch (InvalidOperationException error) { HostLog.Write("could not post window state: " + error.Message); }
    }

    private void RunWindowCommand(string command)
    {
        switch (command)
        {
            case "minimize": WindowState = FormWindowState.Minimized; break;
            case "maximize": ToggleMaximize(); break;
            case "fullscreen": ToggleFullScreen(); break;
            case "close": Close(); break;
            case "shield": ToggleCaptureShield(); break;
            case "refresh": RefreshPlayer(); break;
            default:
                int hit = command switch
                {
                    "resize-left" => NativeMethods.HtLeft, "resize-right" => NativeMethods.HtRight,
                    "resize-top" => NativeMethods.HtTop, "resize-bottom" => NativeMethods.HtBottom,
                    "resize-top-left" => NativeMethods.HtTopLeft, "resize-top-right" => NativeMethods.HtTopRight,
                    "resize-bottom-left" => NativeMethods.HtBottomLeft, "resize-bottom-right" => NativeMethods.HtBottomRight,
                    _ => 0
                };
                if (hit != 0 && !fullScreen && WindowState == FormWindowState.Normal)
                {
                    NativeMethods.ReleaseCapture();
                    NativeMethods.SendMessage(Handle, NativeMethods.WmNcLButtonDown, hit, 0);
                }
                break;
        }
    }

    private void RefreshPlayer()
    {
        if (windowDialogBusy || freezeFrameBusy || view.CoreWebView2 == null) return;
        windowDialogBusy = true;
        try
        {
            if (MessageBox.Show(this, "Stop the current media and return to the logo screen?\n\nUnsaved effect changes will be lost. Saved presets are kept.",
                    "Refresh Glitch Player", MessageBoxButtons.YesNo, MessageBoxIcon.Question,
                    MessageBoxDefaultButton.Button2) != DialogResult.Yes) return;
            mediaConversion?.Cancel();
            mediaRequestId = null;
            view.CoreWebView2.Reload();
        }
        catch (InvalidOperationException error)
        {
            HostLog.Write("refresh failed: " + error.Message);
            MessageBox.Show(this, "The player could not refresh. Close and reopen it.", AppPaths.AppName, MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally { windowDialogBusy = false; }
    }

    private void OnDisplaySettingsChanged(object sender, EventArgs e)
    {
        if (!IsHandleCreated || IsDisposed) return;
        BeginInvoke(() =>
        {
            refreshDevice = null;
            PostDisplayRefresh(false);
        });
    }

    // The renderer's frame-rate governor assumes 60 Hz unless told otherwise; on a 24/30/50 Hz projector or TV
    // every frame legitimately takes longer. WebView2 can pace frames to the primary display rather than the one
    // showing the window, so every attached display's rate is reported, the window's first.
    private void PostDisplayRefresh(bool force)
    {
        var core = view.CoreWebView2;
        if (core == null || !IsHandleCreated || IsDisposed) return;
        var device = Screen.FromHandle(Handle).DeviceName;
        if (!force && device == refreshDevice) return;
        refreshDevice = device;
        var others = Screen.AllScreens.Where(screen => screen.DeviceName != device).Select(screen => ReadRefreshHz(screen.DeviceName));
        var message = AppPolicy.BuildDisplayRefreshMessage(ReadRefreshHz(device), others);
        if (message == null || (!force && message == postedRefresh)) return;
        postedRefresh = message;
        try
        {
            core.PostWebMessageAsString(message);
        }
        catch (InvalidOperationException error)
        {
            HostLog.Write(AppPaths.HostLog, "could not post the display refresh rate: " + error.Message);
        }
    }

    private static uint ReadRefreshHz(string device)
    {
        var mode = new NativeMethods.DevMode { Size = (ushort)System.Runtime.InteropServices.Marshal.SizeOf<NativeMethods.DevMode>() };
        return NativeMethods.EnumDisplaySettings(device, NativeMethods.EnumCurrentSettings, ref mode) ? mode.DisplayFrequency : 0;
    }

    private void OnFormClosing(object sender, FormClosingEventArgs e)
    {
        mediaConversion?.Cancel();
        mediaConversion?.Dispose();
        mediaConversion = null;
    }
}
