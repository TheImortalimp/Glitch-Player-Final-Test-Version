using System.Diagnostics;

var root = AppContext.BaseDirectory;
var webUi = Path.Combine(root, "webui");
if (!Directory.Exists(webUi))
{
    webUi = Path.Combine(Directory.GetParent(root.TrimEnd(Path.DirectorySeparatorChar))?.FullName ?? root, "webui");
}
var entry = Path.Combine(webUi, "glitch-canvas.html");
const int port = 18180;
var url = $"http://127.0.0.1:{port}/glitch-canvas.html";

if (!File.Exists(entry))
{
    Console.Error.WriteLine($"Missing web UI: {entry}");
    return 1;
}

Process? server = null;
server = StartServer("py", webUi) ?? StartServer("python", webUi);
if (server is null)
{
    Process.Start(new ProcessStartInfo(entry) { UseShellExecute = true });
    Console.WriteLine("Python was not found. Opened local mode; YouTube needs localhost.");
    return 0;
}

Thread.Sleep(500);
Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
Console.WriteLine($"Glitch Canvas is running at {url}");
return 0;

static Process? StartServer(string command, string webUi)
{
    try
    {
        var info = new ProcessStartInfo(command)
        {
            UseShellExecute = false,
            CreateNoWindow = true
        };
        info.ArgumentList.Add("-m");
        info.ArgumentList.Add("http.server");
        info.ArgumentList.Add("18180");
        info.ArgumentList.Add("--bind");
        info.ArgumentList.Add("127.0.0.1");
        info.ArgumentList.Add("--directory");
        info.ArgumentList.Add(webUi);
        return Process.Start(info);
    }
    catch
    {
        return null;
    }
}