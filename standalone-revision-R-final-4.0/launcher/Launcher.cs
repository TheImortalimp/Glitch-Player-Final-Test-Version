using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Threading;
using System.Windows.Forms;
using System.Windows.Shell;
using Microsoft.Win32.SafeHandles;

internal sealed class PayloadFile
{
    internal readonly string Entry, Path, Hash;
    internal readonly long Size;
    internal PayloadFile(string entry, string path, long size, string hash)
    { Entry = entry; Path = path; Size = size; Hash = hash; }
}

internal static class Launcher
{
    private const string AppId = "Imortalimp.GlitchPlayer.R4";
    private const string MessageSuffix = ".5A1B3DF5-64B4-487A-9275-2F9D29A0FDC4";
    private static readonly List<IDisposable> Pins = new List<IDisposable>();
    private static readonly HashSet<string> Directories = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    private static string cache;
    private static string callbackError;
    private static bool verifyOnly;
    private static readonly HashSet<string> extracted = new HashSet<string>(StringComparer.Ordinal);

    [STAThread]
    private static int Main(string[] args)
    {
        verifyOnly = args.Length == 1 && args[0] == "--verify";
        try { return Run(args); }
        catch (IOException e) { return Fail(e); }
        catch (UnauthorizedAccessException e) { return Fail(e); }
        catch (SecurityException e) { return Fail(e); }
        catch (Win32Exception e) { return Fail(e); }
        catch (CryptographicException e) { return Fail(e); }
        catch (InvalidOperationException e) { return Fail(e); }
        catch (COMException e) { return Fail(e); }
        catch (ArgumentException e) { return Fail(e); }
        finally { for (int i = Pins.Count - 1; i >= 0; i--) Pins[i].Dispose(); }
    }

    private static int Fail(Exception error)
    {
        if (verifyOnly) { Console.Error.WriteLine(error.Message); return 1; }
        MessageBox.Show("Glitch Player could not start.\n\n" + error.Message +
            "\n\nNo unverified runtime was started. Reinstall from a trusted copy if the payload is damaged.",
            "Glitch Player R4", MessageBoxButtons.OK, MessageBoxIcon.Error);
        return 1;
    }

    private static int Run(string[] args)
    {
        if (args.Length > 1 || (args.Length == 1 && args[0] != "--refresh" && args[0] != "--verify"))
            throw new ArgumentException("Only --refresh or --verify is accepted.");
        SetDllDirectory("");
        Marshal.ThrowExceptionForHR(SetCurrentProcessExplicitAppUserModelID(AppId));
        string exe = Process.GetCurrentProcess().MainModule.FileName;
        if (exe.StartsWith(@"\\", StringComparison.Ordinal)) throw new IOException("Install the app on a local disk.");
        var sid = WindowsIdentity.GetCurrent().User;
        var mutexSecurity = new MutexSecurity();
        mutexSecurity.SetAccessRuleProtection(true, false);
        mutexSecurity.AddAccessRule(new MutexAccessRule(sid, MutexRights.FullControl, AccessControlType.Allow));
        bool created;
        using (var mutex = new Mutex(false, @"Local\GlitchPlayerR4." + sid.Value, out created, mutexSecurity))
        {
            bool held;
            try { held = mutex.WaitOne(0); }
            catch (AbandonedMutexException) { held = true; }
            if (!held)
            {
                if (args.Length == 1 && args[0] == "--verify") throw new IOException("Close the player before verifying its runtime.");
                SignalExisting(args.Length == 1);
                return 0;
            }

            try
            {
                foreach (string key in Environment.GetEnvironmentVariables().Keys)
                {
                    if (key.StartsWith("WEBVIEW2_", StringComparison.OrdinalIgnoreCase) ||
                        key.StartsWith("CORECLR_", StringComparison.OrdinalIgnoreCase) ||
                        key.StartsWith("COR_", StringComparison.OrdinalIgnoreCase) ||
                        key.StartsWith("COMPLUS_", StringComparison.OrdinalIgnoreCase) ||
                        key == "DOTNET_STARTUP_HOOKS" || key == "DOTNET_ADDITIONAL_DEPS" || key == "DOTNET_SHARED_STORE")
                        throw new InvalidOperationException("Remove the runtime override before starting: " + key);
                }
                string install = Path.GetDirectoryName(exe);
                PinDirectory(install, false);
                PinFile(Path.Combine(install, "payload.cab"), -1, Payload.Hash);
                string runtimeRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Glitch-Player-R4", "runtime");
                PinDirectory(runtimeRoot, true);
                cache = Path.Combine(runtimeRoot, Payload.Hash);
                bool exists = Directory.Exists(cache);
                PinDirectory(cache, true);
                if (!exists) Extract(Path.Combine(install, "payload.cab"));
                VerifyRuntime();
                if (args.Length == 1 && args[0] == "--verify") return 0;

                InstallJumpList(exe);
                var start = new ProcessStartInfo(Path.Combine(cache, "GlitchPlayerR4.exe"),
                    "--launcher \"" + exe + "\"") { UseShellExecute = false, WorkingDirectory = cache };
                using (var app = Process.Start(start))
                {
                    if (app == null) throw new InvalidOperationException("The verified player did not start.");
                    app.WaitForExit();
                    return app.ExitCode;
                }
            }
            finally { mutex.ReleaseMutex(); }
        }
    }

    private static void SignalExisting(bool refresh)
    {
        string host = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "Glitch-Player-R4", "runtime", Payload.Hash, "GlitchPlayerR4.exe");
        uint message = RegisterWindowMessage("GlitchPlayerR4." + (refresh ? "Refresh" : "Activate") + MessageSuffix);
        for (int attempt = 0; attempt < 30; attempt++)
        {
            foreach (var process in Process.GetProcessesByName("GlitchPlayerR4"))
            {
                using (process)
                {
                    if (process.MainWindowHandle == IntPtr.Zero || process.MainWindowTitle != "Glitch Player R4") continue;
                    if (!string.Equals(process.MainModule.FileName, host, StringComparison.OrdinalIgnoreCase)) continue;
                    UIntPtr result;
                    if (SendMessageTimeout(process.MainWindowHandle, message, UIntPtr.Zero, IntPtr.Zero, 2, 1500, out result) == IntPtr.Zero)
                        throw new Win32Exception(Marshal.GetLastWin32Error(), "The player is not responding to the taskbar command.");
                    return;
                }
            }
            Thread.Sleep(100);
        }
        throw new InvalidOperationException("The player is still starting or another build is open. Try again after it opens, or close that build first.");
    }

    private static void InstallJumpList(string exe)
    {
        var application = new System.Windows.Application();
        var list = new JumpList { ShowFrequentCategory = false, ShowRecentCategory = false };
        list.JumpItems.Add(new JumpTask {
            Title = "Refresh", Description = "Confirm stopping playback and return to the logo screen",
            ApplicationPath = exe, Arguments = "--refresh", WorkingDirectory = Path.GetDirectoryName(exe),
            IconResourcePath = exe, IconResourceIndex = 0
        });
        string rejection = null;
        list.JumpItemsRejected += delegate(object sender, JumpItemsRejectedEventArgs e)
        {
            if (e.RejectionReasons.Count > 0) rejection = string.Join(", ", e.RejectionReasons);
        };
        JumpList.SetJumpList(application, list);
        list.Apply();
        if (rejection != null) throw new InvalidOperationException("Windows rejected the taskbar Refresh task: " + rejection);
    }

    private static void PinDirectory(string path, bool create)
    {
        path = Path.GetFullPath(path).TrimEnd('\\');
        if (path.Length == 2 && path[1] == ':') path += "\\";
        if (Directories.Contains(path)) return;
        string parent = Path.GetDirectoryName(path);
        if (!string.IsNullOrEmpty(parent)) PinDirectory(parent, create);
        if (!Directory.Exists(path))
        {
            if (!create) throw new DirectoryNotFoundException(path);
            var security = new DirectorySecurity();
            security.SetAccessRuleProtection(true, false);
            security.AddAccessRule(new FileSystemAccessRule(WindowsIdentity.GetCurrent().User, FileSystemRights.FullControl,
                InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit, PropagationFlags.None, AccessControlType.Allow));
            security.AddAccessRule(new FileSystemAccessRule(new SecurityIdentifier(WellKnownSidType.LocalSystemSid, null),
                FileSystemRights.FullControl, InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit,
                PropagationFlags.None, AccessControlType.Allow));
            Directory.CreateDirectory(path, security);
        }
        var handle = CreateFile(path, 0, 3, IntPtr.Zero, 3, 0x02200000, IntPtr.Zero);
        if (handle.IsInvalid) { handle.Dispose(); throw new Win32Exception(Marshal.GetLastWin32Error(), "Cannot lock runtime folder: " + path); }
        Pins.Add(handle);
        FileInfoNative info;
        if (!GetFileInformationByHandle(handle, out info)) throw new Win32Exception(Marshal.GetLastWin32Error());
        if ((info.Attributes & 0x400) != 0 || (info.Attributes & 0x10) == 0)
            throw new IOException("Refusing a redirected or invalid runtime folder: " + path);
        Directories.Add(path);
    }

    private static FileStream PinFile(string path, long size, string expectedHash)
    {
        var handle = CreateFile(path, 0x80000000, 1, IntPtr.Zero, 3, 0x00200000, IntPtr.Zero);
        if (handle.IsInvalid) { handle.Dispose(); throw new Win32Exception(Marshal.GetLastWin32Error(), "Cannot read payload file: " + path); }
        Pins.Add(handle);
        FileInfoNative info;
        if (!GetFileInformationByHandle(handle, out info)) throw new Win32Exception(Marshal.GetLastWin32Error());
        if ((info.Attributes & (0x400 | 0x10)) != 0) throw new IOException("Refusing a redirected payload file: " + path);
        var stream = new FileStream(handle, FileAccess.Read, 65536, false);
        Pins.Add(stream);
        if (size >= 0 && stream.Length != size) throw new InvalidDataException("Runtime size mismatch: " + path);
        using (var sha = SHA256.Create())
        {
            string hash = BitConverter.ToString(sha.ComputeHash(stream)).Replace("-", "").ToLowerInvariant();
            if (hash != expectedHash) throw new InvalidDataException("Integrity check failed: " + path +
                "\nIf this is the runtime cache, close the app and remove only this version's cache folder:\n" + cache);
        }
        return stream;
    }

    private static void VerifyRuntime()
    {
        var expected = new HashSet<string>(Payload.Files.Select(f => f.Path), StringComparer.OrdinalIgnoreCase);
        var found = new List<string>();
        Scan(cache, found);
        if (found.Count != expected.Count || found.Any(f => !expected.Contains(f)))
            throw new InvalidDataException("The runtime cache has missing or unexpected files. Remove this version's cache folder and retry:\n" + cache);
        foreach (var file in Payload.Files) PinFile(Path.Combine(cache, file.Path), file.Size, file.Hash);
    }

    private static void Scan(string directory, List<string> found)
    {
        PinDirectory(directory, false);
        foreach (string path in Directory.GetFileSystemEntries(directory))
        {
            var attributes = File.GetAttributes(path);
            if ((attributes & FileAttributes.ReparsePoint) != 0) throw new IOException("Refusing redirected cache content: " + path);
            if ((attributes & FileAttributes.Directory) != 0) Scan(path, found);
            else found.Add(path.Substring(cache.Length + 1));
        }
    }

    private static void Extract(string cabPath)
    {
        foreach (var file in Payload.Files)
        {
            string target = Path.Combine(cache, file.Path);
            if (target.Length >= 260) throw new IOException("The runtime cache path is too long for Windows CAB extraction.");
            PinDirectory(Path.GetDirectoryName(target), true);
        }
        CabinetCallback callback = OnCabinet;
        bool ok = SetupIterateCabinet(cabPath, 0, callback, IntPtr.Zero);
        GC.KeepAlive(callback);
        if (!ok || callbackError != null || extracted.Count != Payload.Files.Length)
            throw new IOException("CAB extraction failed: " + (callbackError ?? new Win32Exception(Marshal.GetLastWin32Error()).Message) +
                "\nRemove only this incomplete version cache before retrying:\n" + cache);
    }

    private static uint OnCabinet(IntPtr context, uint notification, IntPtr param1, IntPtr param2)
    {
        const uint FileInCabinet = 0x11, NeedNewCabinet = 0x12, FileExtracted = 0x13;
        if (notification == NeedNewCabinet) { callbackError = "Split cabinets are not allowed."; return 13; }
        if (notification == FileInCabinet)
        {
            var info = (FileInCabinetInfo)Marshal.PtrToStructure(param1, typeof(FileInCabinetInfo));
            var file = Payload.Files.FirstOrDefault(f => f.Entry == info.NameInCabinet);
            if (file == null || info.FileSize != file.Size || !extracted.Add(file.Entry))
            {
                callbackError = "Unexpected, duplicate or incorrectly sized CAB member.";
                return 0;
            }
            char[] target = (Path.Combine(cache, file.Path) + "\0").ToCharArray();
            Marshal.Copy(target, 0, IntPtr.Add(param1, (int)Marshal.OffsetOf(typeof(FileInCabinetInfo), "FullTargetName")), target.Length);
            return 1;
        }
        if (notification == FileExtracted)
        {
            var paths = (FilePaths)Marshal.PtrToStructure(param1, typeof(FilePaths));
            if (paths.Win32Error != 0) { callbackError = "Windows extraction error " + paths.Win32Error; return paths.Win32Error; }
        }
        return 0;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct FileInCabinetInfo
    {
        [MarshalAs(UnmanagedType.LPWStr)] public string NameInCabinet;
        public uint FileSize, Win32Error;
        public ushort DosDate, DosTime, DosAttribs;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)] public string FullTargetName;
    }
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct FilePaths
    {
        public IntPtr Target, Source;
        public uint Win32Error, Flags;
    }
    [StructLayout(LayoutKind.Sequential)]
    private struct FileInfoNative
    {
        public uint Attributes;
        public System.Runtime.InteropServices.ComTypes.FILETIME Creation, Access, Write;
        public uint Volume, SizeHigh, SizeLow, Links, IndexHigh, IndexLow;
    }
    private delegate uint CabinetCallback(IntPtr context, uint notification, IntPtr param1, IntPtr param2);
    [DllImport("setupapi.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool SetupIterateCabinet(string file, uint reserved, CabinetCallback callback, IntPtr context);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true, EntryPoint = "CreateFileW")]
    private static extern SafeFileHandle CreateFile(string path, uint access, uint share, IntPtr security, uint creation, uint flags, IntPtr template);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetFileInformationByHandle(SafeFileHandle file, out FileInfoNative info);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
    private static extern bool SetDllDirectory(string path);
    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    private static extern int SetCurrentProcessExplicitAppUserModelID(string appId);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern uint RegisterWindowMessage(string message);
    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr SendMessageTimeout(IntPtr hwnd, uint message, UIntPtr wparam, IntPtr lparam, uint flags, uint timeout, out UIntPtr result);
}
