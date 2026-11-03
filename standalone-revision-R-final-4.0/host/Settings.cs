using System.Text.Json;

namespace GlitchPlayerR4;

internal static class AppPaths
{
    public const string AppName = "Glitch-Player-R4";
    public static string LauncherPath { get; set; } = Environment.ProcessPath;

    public static readonly string DataDir = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), AppName);

    public static string ProfileDir => Path.Combine(DataDir, "profile");
    public static string MediaCacheDir => Path.Combine(DataDir, "media-cache");
    public static string MediaKeyFile => Path.Combine(DataDir, "media-key.bin");
    public static string SettingsFile => Path.Combine(DataDir, "settings.json");
    public static string HostLog => Path.Combine(DataDir, "host.log");
    public static string WebUiDir => Path.Combine(AppContext.BaseDirectory, "webui");
}

// Flat string settings, same shape as K-Meleon-R's settings.json.
internal static class Settings
{
    private static Dictionary<string, string> data = Load();

    private static Dictionary<string, string> Load()
    {
        try
        {
            var info = new FileInfo(AppPaths.SettingsFile);
            if (!info.Exists || info.Length > 64 * 1024) return new();
            return JsonSerializer.Deserialize<Dictionary<string, string>>(File.ReadAllText(info.FullName)) ?? new();
        }
        catch (Exception e) when (e is IOException or UnauthorizedAccessException or JsonException or NotSupportedException)
        {
            return new();
        }
    }

    public static string Get(string key, string def) => data.TryGetValue(key, out var v) && v != null ? v : def;

    public static void Set(string key, string value)
    {
        data[key] = value;
        try
        {
            Directory.CreateDirectory(AppPaths.DataDir);
            File.WriteAllText(AppPaths.SettingsFile, JsonSerializer.Serialize(data));
        }
        catch (Exception e) when (e is IOException or UnauthorizedAccessException) { }
    }
}

// Size-capped logs: no unbounded tails.
internal static class HostLog
{
    private const long MaxBytes = 512 * 1024;
    private static readonly object Gate = new();

    public static void Write(string path, string line)
    {
        lock (Gate)
        {
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(path)!);
                var info = new FileInfo(path);
                if (info.Exists && info.Length > MaxBytes) info.Delete();
                File.AppendAllText(path, $"{DateTime.Now:s} {AppPolicy.Shorten(line)}{Environment.NewLine}");
            }
            catch (Exception e) when (e is IOException or UnauthorizedAccessException) { }
        }
    }

    public static void Write(string line) => Write(AppPaths.HostLog, line);
}
