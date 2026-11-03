using System.Runtime.InteropServices;

namespace GlitchPlayerR4;

internal static class WindowShell
{
    internal const string AppId = "Imortalimp.GlitchPlayer.R4";
    internal static readonly int RefreshMessage = RegisterWindowMessage("GlitchPlayerR4.Refresh.5A1B3DF5-64B4-487A-9275-2F9D29A0FDC4");
    internal static readonly int ActivateMessage = RegisterWindowMessage("GlitchPlayerR4.Activate.5A1B3DF5-64B4-487A-9275-2F9D29A0FDC4");

    internal static void Initialize() => Marshal.ThrowExceptionForHR(SetCurrentProcessExplicitAppUserModelID(AppId));

    internal static void ConfigureWindow(nint hwnd, string launcher)
    {
        if (OperatingSystem.IsWindowsVersionAtLeast(10, 0, 22000))
        {
            uint noBorder = 0xfffffffe, squareCorners = 1;
            Marshal.ThrowExceptionForHR(DwmSetWindowAttribute(hwnd, 34, ref noBorder, sizeof(uint)));
            Marshal.ThrowExceptionForHR(DwmSetWindowAttribute(hwnd, 33, ref squareCorners, sizeof(uint)));
        }
        var iid = typeof(IPropertyStore).GUID;
        Marshal.ThrowExceptionForHR(SHGetPropertyStoreForWindow(hwnd, ref iid, out var store));
        try
        {
            Set(store, 2, "\"" + launcher + "\"");
            Set(store, 3, launcher + ",0");
            Set(store, 4, "Glitch Player R4");
            Set(store, 5, AppId);
            store.Commit();
        }
        finally { Marshal.ReleaseComObject(store); }
    }

    private static void Set(IPropertyStore store, uint id, string text)
    {
        var key = new PropertyKey { Format = new Guid("9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3"), Id = id };
        var value = new PropVariant { Type = 31, Text = Marshal.StringToCoTaskMemUni(text) };
        try { store.SetValue(ref key, ref value); }
        finally { Marshal.FreeCoTaskMem(value.Text); }
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct PropertyKey { public Guid Format; public uint Id; }
    [StructLayout(LayoutKind.Explicit, Size = 24)]
    private struct PropVariant
    {
        [FieldOffset(0)] public ushort Type;
        [FieldOffset(8)] public nint Text;
    }
    [ComImport, Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IPropertyStore
    {
        void GetCount(out uint count);
        void GetAt(uint index, out PropertyKey key);
        void GetValue(ref PropertyKey key, out PropVariant value);
        void SetValue(ref PropertyKey key, ref PropVariant value);
        void Commit();
    }

    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    private static extern int SetCurrentProcessExplicitAppUserModelID(string appId);
    [DllImport("shell32.dll")]
    private static extern int SHGetPropertyStoreForWindow(nint hwnd, ref Guid iid, [MarshalAs(UnmanagedType.Interface)] out IPropertyStore store);
    [DllImport("dwmapi.dll")]
    private static extern int DwmSetWindowAttribute(nint hwnd, int attribute, ref uint value, int size);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int RegisterWindowMessage(string message);
}
