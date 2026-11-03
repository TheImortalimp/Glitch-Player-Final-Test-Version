using System.Text.Json;
using System.Text.RegularExpressions;

namespace GlitchPlayerR4;

// Pure allow-list policy shared by the host and its unit tests (no WebView2 or WinForms types here).
internal static class AppPolicy
{
    public const string AppHost = "player-r4.local";
    public const string MediaHost = "media-r4.local";
    public const string AppOrigin = "https://" + AppHost;
    public const string AppDocument = AppOrigin + "/index.html";
    public const string MediaOrigin = "https://" + MediaHost;
    public const int MaxMessageChars = 2_200_000;
    public const int MaxPresetExportBytes = 2 * 1024 * 1024;
    public const int MaxUserPresets = 500;
    public const int MaxPresetNameChars = 80;
    public const string PresetExportFormat = "signal-lab-presets";
    public const int MaxLogEventChars = 64;

    private static readonly string[] YouTubeFrameHosts = { "www.youtube-nocookie.com", "www.youtube.com" };

    private static readonly string[] ExternalHosts =
    {
        "imortalimp.nl", "www.imortalimp.nl",
        "youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be",
    };

    // \z rather than $: in .NET, $ also matches before a trailing "\n".
    private static readonly Regex MediaName = new("^[0-9a-f]{64}\\.(mp4|m4a)\\z", RegexOptions.CultureInvariant);
    private static readonly Regex LogEvent = new("^[a-z0-9][a-z0-9:._-]{0,63}\\z", RegexOptions.CultureInvariant);

    private static bool TryHttps(string uri, out Uri parsed)
    {
        parsed = null;
        if (string.IsNullOrEmpty(uri) || uri.Length > 8192) return false;
        if (!Uri.TryCreate(uri, UriKind.Absolute, out var u)) return false;
        if (u.Scheme != Uri.UriSchemeHttps || !u.IsDefaultPort || !string.IsNullOrEmpty(u.UserInfo)) return false;
        parsed = u;
        return true;
    }

    // The only top-level document the WebView may ever show.
    public static bool IsAppDocument(string uri)
    {
        if (!TryHttps(uri, out var u)) return false;
        return u.Host.Equals(AppHost, StringComparison.OrdinalIgnoreCase) && u.AbsolutePath == "/index.html";
    }

    // Child frames: the YouTube embed (and the blank documents it uses internally).
    public static bool IsAllowedFrameUri(string uri)
    {
        if (uri == "about:blank" || uri == "about:srcdoc") return true;
        if (!TryHttps(uri, out var u)) return false;
        return Array.Exists(YouTubeFrameHosts, h => u.Host.Equals(h, StringComparison.OrdinalIgnoreCase));
    }

    // Links that may be handed to the user's default browser, after confirmation.
    public static bool IsAllowedExternalUri(string uri)
    {
        if (!TryHttps(uri, out var u)) return false;
        if (u.HostNameType != UriHostNameType.Dns) return false;
        return Array.Exists(ExternalHosts, h => u.IdnHost.Equals(h, StringComparison.OrdinalIgnoreCase));
    }

    public static bool IsBlockedScheme(string uri) =>
        uri != null && (uri.StartsWith("javascript:", StringComparison.OrdinalIgnoreCase) ||
                        uri.StartsWith("data:", StringComparison.OrdinalIgnoreCase) ||
                        uri.StartsWith("vbscript:", StringComparison.OrdinalIgnoreCase) ||
                        uri.StartsWith("file:", StringComparison.OrdinalIgnoreCase) ||
                        uri.StartsWith("ms-settings:", StringComparison.OrdinalIgnoreCase));

    public static bool IsMediaFileName(string name) => name != null && MediaName.IsMatch(name);

    // "kind|payload" — kind is a short fixed token, payload is arbitrary text checked by the handler.
    public static bool TrySplitMessage(string message, out string kind, out string payload)
    {
        kind = payload = null;
        if (string.IsNullOrEmpty(message) || message.Length > MaxMessageChars) return false;
        var bar = message.IndexOf('|');
        if (bar <= 0 || bar > 32) return false;
        kind = message[..bar];
        payload = message[(bar + 1)..];
        return kind is "media:convert" or "media:cancel" or "presets:export" or "ui:escape" or "log";
    }

    public static bool IsRequestId(string id) =>
        !string.IsNullOrEmpty(id) && id.Length <= 20 && id.All(char.IsAsciiDigit);

    public static bool TryParseConvertRequest(string json, out string id, out string kind)
    {
        id = kind = null;
        if (string.IsNullOrEmpty(json) || json.Length > 256) return false;
        try
        {
            using var doc = JsonDocument.Parse(json, new JsonDocumentOptions { MaxDepth = 4 });
            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object) return false;
            if (!root.TryGetProperty("id", out var idEl) || idEl.ValueKind != JsonValueKind.String) return false;
            if (!root.TryGetProperty("kind", out var kindEl) || kindEl.ValueKind != JsonValueKind.String) return false;
            var i = idEl.GetString();
            var k = kindEl.GetString();
            if (!IsRequestId(i) || (k != "video" && k != "audio")) return false;
            id = i;
            kind = k;
            return true;
        }
        catch (JsonException) { return false; }
    }

    // Preset exports are produced by the page; the host only writes well-formed, bounded JSON
    // in the exact envelope host-bridge.js sends: {format, version: 1, presets: [{name, settings}]}.
    public static bool IsValidPresetExport(string json)
    {
        if (string.IsNullOrEmpty(json) || System.Text.Encoding.UTF8.GetByteCount(json) > MaxPresetExportBytes) return false;
        try
        {
            using var doc = JsonDocument.Parse(json, new JsonDocumentOptions { MaxDepth = 16 });
            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object) return false;
            if (!root.TryGetProperty("format", out var f) || f.ValueKind != JsonValueKind.String ||
                f.GetString() != PresetExportFormat) return false;
            if (!root.TryGetProperty("version", out var v) || v.ValueKind != JsonValueKind.Number ||
                !v.TryGetInt32(out var version) || version != 1) return false;
            if (!root.TryGetProperty("presets", out var p) || p.ValueKind != JsonValueKind.Array ||
                p.GetArrayLength() > MaxUserPresets) return false;
            foreach (var entry in p.EnumerateArray())
            {
                if (entry.ValueKind != JsonValueKind.Object) return false;
                if (!entry.TryGetProperty("name", out var n) || n.ValueKind != JsonValueKind.String) return false;
                var name = n.GetString();
                if (name.Length > MaxPresetNameChars || name.Trim().Length == 0) return false;
                if (!entry.TryGetProperty("settings", out var s) || s.ValueKind != JsonValueKind.Object) return false;
            }
            return true;
        }
        catch (JsonException) { return false; }
    }

    public static bool IsLogEvent(string text) => text != null && LogEvent.IsMatch(text);

    // True when path is the folder itself or anything below it, after full-path normalisation.
    // Used to keep user exports out of folders that updates or uninstall replace or remove.
    public static bool IsInsideFolder(string path, string folder)
    {
        if (string.IsNullOrWhiteSpace(path) || string.IsNullOrWhiteSpace(folder)) return false;
        try
        {
            var full = Path.TrimEndingDirectorySeparator(Path.GetFullPath(path));
            var root = Path.TrimEndingDirectorySeparator(Path.GetFullPath(folder));
            var prefix = Path.EndsInDirectorySeparator(root) ? root : root + Path.DirectorySeparatorChar;
            return full.Equals(root, StringComparison.OrdinalIgnoreCase) ||
                   full.StartsWith(prefix, StringComparison.OrdinalIgnoreCase);
        }
        catch (Exception e) when (e is ArgumentException or NotSupportedException or PathTooLongException)
        {
            return false;
        }
    }

    public static string Shorten(string s) =>
        s == null ? "" : (s.Length > 160 ? s[..160] + "\u2026" : s).Replace('\r', ' ').Replace('\n', ' ');
}
