using System.Runtime.InteropServices;
using Microsoft.Web.WebView2.Core;

namespace GlitchPlayerR4;

// The optional outbound shield is off by default. Inbound browser capture is always denied.
internal static class CaptureGuard
{
    private const uint WDA_NONE = 0x0;
    private const uint WDA_EXCLUDEFROMCAPTURE = 0x11;   // Windows 10 2004+

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool SetWindowDisplayAffinity(nint hWnd, uint dwAffinity);

    public static bool Apply(Form form, bool shieldOn)
    {
        return form.IsHandleCreated &&
               SetWindowDisplayAffinity(form.Handle, shieldOn ? WDA_EXCLUDEFROMCAPTURE : WDA_NONE);
    }

    public static void HardenBrowser(CoreWebView2 core)
    {
        core.ScreenCaptureStarting += (_, e) => { e.Cancel = true; e.Handled = true; };
    }
}
