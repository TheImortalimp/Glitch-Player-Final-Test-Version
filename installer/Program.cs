using System.IO.Compression;
using System.Reflection;
using System.Security.Cryptography.X509Certificates;
using System.Windows.Forms;

namespace StandaloneRevisionRFinalInstaller;

internal static class Program
{
    private const string PackageResourceName = "StandaloneRevisionRFinalInstaller.payload.zip";
    private const string ProductFolderName = "standalone-revision-R-final-1.0";
    private const string LauncherName = "Launch-Standalone-Revision-R-Final.cmd";

    [STAThread]
    private static int Main(string[] arguments)
    {
        var quiet = arguments.Any(argument => string.Equals(argument, "--quiet", StringComparison.OrdinalIgnoreCase));
        var customInstallRoot = arguments.FirstOrDefault(argument => !string.Equals(argument, "--quiet", StringComparison.OrdinalIgnoreCase));
        var installRoot = !string.IsNullOrWhiteSpace(customInstallRoot)
            ? Path.GetFullPath(customInstallRoot)
            : Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), ProductFolderName);

        try
        {
            Directory.CreateDirectory(installRoot);
            using var archiveStream = Assembly.GetExecutingAssembly().GetManifestResourceStream(PackageResourceName)
                ?? throw new InvalidOperationException("The embedded installation package is missing.");
            using var archive = new ZipArchive(archiveStream, ZipArchiveMode.Read);

            foreach (var entry in archive.Entries)
            {
                var targetPath = Path.GetFullPath(Path.Combine(installRoot, entry.FullName));
                if (!targetPath.StartsWith(Path.GetFullPath(installRoot) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException("The installation package contains an invalid path.");
                }

                if (string.IsNullOrEmpty(entry.Name))
                {
                    Directory.CreateDirectory(targetPath);
                    continue;
                }

                Directory.CreateDirectory(Path.GetDirectoryName(targetPath)!);
                entry.ExtractToFile(targetPath, overwrite: true);
            }

            var appPath = Path.Combine(installRoot, "app", "StandaloneRevisionRFinal.exe");
            if (!File.Exists(appPath))
            {
                throw new InvalidOperationException("The installed application executable is missing.");
            }

            TrustEmbeddedPublisherCertificate(installRoot);

            var launcherPath = Path.Combine(installRoot, LauncherName);
            File.WriteAllLines(launcherPath, [
                "@echo off",
                "start \"\" \"%~dp0app\\StandaloneRevisionRFinal.exe\""
            ]);

            if (!quiet)
            {
                MessageBox.Show($"Installed to:\n{installRoot}", "Standalone Revision-R Final", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            return 0;
        }
        catch (Exception exception)
        {
            if (!quiet)
            {
                MessageBox.Show(exception.Message, "Standalone Revision-R Final installer", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            else
            {
                Console.Error.WriteLine(exception.Message);
            }
            return 1;
        }
    }

    private static void TrustEmbeddedPublisherCertificate(string installRoot)
    {
        var certificatePath = Path.Combine(installRoot, "publisher.cer");
        if (!File.Exists(certificatePath))
        {
            return;
        }

        using var certificate = new X509Certificate2(certificatePath);
        AddCertificateToStore(certificate, StoreName.TrustedPeople);
        AddCertificateToStore(certificate, StoreName.Root);
    }

    private static void AddCertificateToStore(X509Certificate2 certificate, StoreName storeName)
    {
        using var store = new X509Store(storeName, StoreLocation.CurrentUser);
        store.Open(OpenFlags.ReadWrite);
        if (!store.Certificates.Cast<X509Certificate2>().Any(existing =>
                string.Equals(existing.Thumbprint, certificate.Thumbprint, StringComparison.OrdinalIgnoreCase)))
        {
            store.Add(certificate);
        }
    }
}