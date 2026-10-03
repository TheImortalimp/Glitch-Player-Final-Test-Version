using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;

// Always install straight to the Desktop, no folder picker: WinForms'
// FolderBrowserDialog resolves SelectedPath to an unrelated virtual folder
// (not the real Desktop path) if the user just clicks OK without
// navigating, which is why files weren't landing where expected.
var outputRoot = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),
    "standalone-revision-R-final-3.0");

try
{
    Directory.CreateDirectory(outputRoot);
    var asm = Assembly.GetExecutingAssembly();
    using var stream = asm.GetManifestResourceStream("payload.zip")
        ?? throw new InvalidOperationException("Embedded payload was not found in this installer.");
    using var archive = new ZipArchive(stream, ZipArchiveMode.Read);
    archive.ExtractToDirectory(outputRoot, overwriteFiles: true);

    var launchCmd = Path.Combine(outputRoot, "Launch-Standalone-Revision-R-Final-3.0.cmd");
    var choice = MessageBox.Show(
        $"Installed to:\n{outputRoot}\n\nLaunch it now?",
        "Standalone Revision R Final 3.0",
        MessageBoxButtons.YesNo,
        MessageBoxIcon.Information);

    if (choice == DialogResult.Yes && File.Exists(launchCmd))
    {
        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(launchCmd)
        {
            WorkingDirectory = outputRoot,
            UseShellExecute = true
        });
    }
}
catch (Exception ex)
{
    MessageBox.Show($"Installation failed:\n{ex.Message}", "Standalone Revision R Final 3.0",
        MessageBoxButtons.OK, MessageBoxIcon.Error);
    return 1;
}

return 0;

