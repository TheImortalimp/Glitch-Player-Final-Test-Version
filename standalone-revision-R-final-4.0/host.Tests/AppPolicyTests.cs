using System.Text.Json;

namespace GlitchPlayerR4.Tests;

public class AppPolicyTests
{
    private static readonly string Hash = new('a', 64);

    [Theory]
    [InlineData("https://player-r4.local/index.html", true)]
    [InlineData("https://PLAYER-R4.LOCAL/index.html", true)]
    [InlineData("https://player-r4.local/other.html", false)]
    [InlineData("http://player-r4.local/index.html", false)]
    [InlineData("https://player-r4.local:8443/index.html", false)]
    [InlineData("https://user@player-r4.local/index.html", false)]
    [InlineData("https://media-r4.local/index.html", false)]
    [InlineData("https://player-r4.local.evil.example/index.html", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void IsAppDocument_AllowsOnlyTheLocalIndex(string uri, bool expected) =>
        Assert.Equal(expected, AppPolicy.IsAppDocument(uri));

    [Theory]
    [InlineData("about:blank", true)]
    [InlineData("about:srcdoc", true)]
    [InlineData("https://www.youtube-nocookie.com/embed/abc", true)]
    [InlineData("https://www.youtube.com/embed/abc", true)]
    [InlineData("http://www.youtube.com/embed/abc", false)]
    [InlineData("https://www.youtube.com.evil.example/embed/abc", false)]
    [InlineData("https://evil.example/", false)]
    [InlineData("javascript:alert(1)", false)]
    public void IsAllowedFrameUri_AllowsOnlyYouTubeEmbeds(string uri, bool expected) =>
        Assert.Equal(expected, AppPolicy.IsAllowedFrameUri(uri));

    [Theory]
    [InlineData("https://imortalimp.nl/", true)]
    [InlineData("https://www.youtube.com/watch?v=abc", true)]
    [InlineData("https://youtu.be/abc", true)]
    [InlineData("http://imortalimp.nl/", false)]
    [InlineData("https://imortalimp.nl.evil.example/", false)]
    [InlineData("https://evil.example/", false)]
    [InlineData("https://127.0.0.1/", false)]
    [InlineData("https://user:pass@imortalimp.nl/", false)]
    [InlineData("https://imortalimp.nl:444/", false)]
    public void IsAllowedExternalUri_AllowsOnlyListedHttpsHosts(string uri, bool expected) =>
        Assert.Equal(expected, AppPolicy.IsAllowedExternalUri(uri));

    [Theory]
    [InlineData("javascript:alert(1)", true)]
    [InlineData("JavaScript:alert(1)", true)]
    [InlineData("data:text/html,x", true)]
    [InlineData("vbscript:x", true)]
    [InlineData("file:///C:/Windows", true)]
    [InlineData("ms-settings:privacy", true)]
    [InlineData("https://imortalimp.nl/", false)]
    [InlineData(null, false)]
    public void IsBlockedScheme_FlagsDangerousSchemes(string uri, bool expected) =>
        Assert.Equal(expected, AppPolicy.IsBlockedScheme(uri));

    [Fact]
    public void IsMediaFileName_AcceptsOnlyHashedMp4AndM4a()
    {
        Assert.True(AppPolicy.IsMediaFileName(Hash + ".mp4"));
        Assert.True(AppPolicy.IsMediaFileName(Hash + ".m4a"));
        Assert.False(AppPolicy.IsMediaFileName(Hash.ToUpperInvariant() + ".mp4"));
        Assert.False(AppPolicy.IsMediaFileName(Hash + ".webm"));
        Assert.False(AppPolicy.IsMediaFileName(Hash[1..] + ".mp4"));
        Assert.False(AppPolicy.IsMediaFileName("../" + Hash + ".mp4"));
        Assert.False(AppPolicy.IsMediaFileName(Hash + ".mp4\n"));
        Assert.False(AppPolicy.IsMediaFileName(null));
    }

    [Fact]
    public void TrySplitMessage_AcceptsOnlyKnownKinds()
    {
        Assert.True(AppPolicy.TrySplitMessage("log|renderer:ready", out var kind, out var payload));
        Assert.Equal("log", kind);
        Assert.Equal("renderer:ready", payload);

        Assert.True(AppPolicy.TrySplitMessage("presets:export|{}", out kind, out payload));
        Assert.Equal("presets:export", kind);
        Assert.Equal("{}", payload);

        Assert.False(AppPolicy.TrySplitMessage("shell:run|calc", out _, out _));
        Assert.False(AppPolicy.TrySplitMessage("|log", out _, out _));
        Assert.False(AppPolicy.TrySplitMessage("log", out _, out _));
        Assert.False(AppPolicy.TrySplitMessage(new string('x', 33) + "|y", out _, out _));
        Assert.False(AppPolicy.TrySplitMessage("log|" + new string('x', AppPolicy.MaxMessageChars), out _, out _));
        Assert.False(AppPolicy.TrySplitMessage(null, out _, out _));
    }

    [Theory]
    [InlineData("1", true)]
    [InlineData("12345678901234567890", true)]
    [InlineData("123456789012345678901", false)]
    [InlineData("", false)]
    [InlineData("12a", false)]
    [InlineData("-1", false)]
    [InlineData("\u0661", false)]
    [InlineData(null, false)]
    public void IsRequestId_AcceptsOnlyShortAsciiDigits(string id, bool expected) =>
        Assert.Equal(expected, AppPolicy.IsRequestId(id));

    [Fact]
    public void TryParseConvertRequest_ValidatesIdAndKind()
    {
        Assert.True(AppPolicy.TryParseConvertRequest("{\"id\":\"7\",\"kind\":\"video\"}", out var id, out var kind));
        Assert.Equal("7", id);
        Assert.Equal("video", kind);
        Assert.True(AppPolicy.TryParseConvertRequest("{\"id\":\"8\",\"kind\":\"audio\"}", out _, out _));

        Assert.False(AppPolicy.TryParseConvertRequest("{\"id\":\"7\",\"kind\":\"exe\"}", out _, out _));
        Assert.False(AppPolicy.TryParseConvertRequest("{\"id\":7,\"kind\":\"video\"}", out _, out _));
        Assert.False(AppPolicy.TryParseConvertRequest("{\"id\":\"x\",\"kind\":\"video\"}", out _, out _));
        Assert.False(AppPolicy.TryParseConvertRequest("[\"7\",\"video\"]", out _, out _));
        Assert.False(AppPolicy.TryParseConvertRequest("{not json", out _, out _));
        Assert.False(AppPolicy.TryParseConvertRequest("{\"id\":\"7\",\"kind\":\"video\",\"pad\":\"" + new string('x', 256) + "\"}", out _, out _));
        Assert.False(AppPolicy.TryParseConvertRequest(null, out _, out _));
    }

    private static string Export(object presets, object version = null, string format = AppPolicy.PresetExportFormat) =>
        JsonSerializer.Serialize(new { format, version = version ?? 1, presets });

    private static object Entry(string name) => new { name, settings = new { effects = new { Flash = 0.32 } } };

    [Fact]
    public void IsValidPresetExport_AcceptsTheBridgeEnvelope()
    {
        Assert.True(AppPolicy.IsValidPresetExport(Export(new[] { Entry("night drive") })));
        Assert.True(AppPolicy.IsValidPresetExport(Export(Array.Empty<object>())));
        Assert.True(AppPolicy.IsValidPresetExport(Export(Enumerable.Range(1, AppPolicy.MaxUserPresets).Select(i => Entry("p" + i)).ToArray())));
        Assert.True(AppPolicy.IsValidPresetExport(Export(new[] { Entry(new string('n', AppPolicy.MaxPresetNameChars)) })));
    }

    [Fact]
    public void IsValidPresetExport_RejectsMalformedOrOversizedExports()
    {
        Assert.False(AppPolicy.IsValidPresetExport(Export(new[] { Entry("a") }, format: "glitch-player-r4-presets")));
        Assert.False(AppPolicy.IsValidPresetExport(Export(new[] { Entry("a") }, version: 2)));
        Assert.False(AppPolicy.IsValidPresetExport(Export(new[] { Entry("a") }, version: "1")));
        Assert.False(AppPolicy.IsValidPresetExport(Export(new { a = new { } })));
        Assert.False(AppPolicy.IsValidPresetExport(Export(Enumerable.Range(1, AppPolicy.MaxUserPresets + 1).Select(i => Entry("p" + i)).ToArray())));
        Assert.False(AppPolicy.IsValidPresetExport(Export(new[] { Entry("") })));
        Assert.False(AppPolicy.IsValidPresetExport(Export(new[] { Entry("   ") })));
        Assert.False(AppPolicy.IsValidPresetExport(Export(new[] { Entry(new string('n', AppPolicy.MaxPresetNameChars + 1)) })));
        Assert.False(AppPolicy.IsValidPresetExport(Export(new object[] { new { name = "a", settings = "x" } })));
        Assert.False(AppPolicy.IsValidPresetExport(Export(new object[] { new { name = 5, settings = new { } } })));
        Assert.False(AppPolicy.IsValidPresetExport(Export(new object[] { "not an object" })));
        Assert.False(AppPolicy.IsValidPresetExport("[]"));
        Assert.False(AppPolicy.IsValidPresetExport("{not json"));
        Assert.False(AppPolicy.IsValidPresetExport(""));
        Assert.False(AppPolicy.IsValidPresetExport(null));
    }

    [Fact]
    public void IsValidPresetExport_RejectsOverDeepAndOver2MbJson()
    {
        var deep = string.Concat(Enumerable.Repeat("{\"a\":", 20)) + "1" + new string('}', 20);
        Assert.False(AppPolicy.IsValidPresetExport(Export(new object[] { new { name = "a", settings = JsonDocument.Parse(deep).RootElement } })));

        var big = new string('x', AppPolicy.MaxPresetExportBytes);
        Assert.False(AppPolicy.IsValidPresetExport(Export(new object[] { new { name = "a", settings = new { pad = big } } })));
    }

    [Theory]
    [InlineData("renderer:ready", true)]
    [InlineData("media.convert-ok_1", true)]
    [InlineData("Renderer", false)]
    [InlineData(":start", false)]
    [InlineData("has space", false)]
    [InlineData("line\n", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void IsLogEvent_AcceptsOnlyShortLowercaseCodes(string text, bool expected) =>
        Assert.Equal(expected, AppPolicy.IsLogEvent(text));

    [Fact]
    public void IsLogEvent_RejectsOverlongCodes()
    {
        Assert.True(AppPolicy.IsLogEvent(new string('a', AppPolicy.MaxLogEventChars)));
        Assert.False(AppPolicy.IsLogEvent(new string('a', AppPolicy.MaxLogEventChars + 1)));
    }

    [Fact]
    public void Shorten_TruncatesAndFlattensLines()
    {
        Assert.Equal("", AppPolicy.Shorten(null));
        Assert.Equal("a b c", AppPolicy.Shorten("a\rb\nc"));
        var shortened = AppPolicy.Shorten(new string('x', 200));
        Assert.Equal(161, shortened.Length);
        Assert.EndsWith("\u2026", shortened);
    }

    [Theory]
    [InlineData(@"C:\Apps\Glitch-Player-R4\presets.json", @"C:\Apps\Glitch-Player-R4", true)]
    [InlineData(@"C:\Apps\Glitch-Player-R4\sub\presets.json", @"C:\Apps\Glitch-Player-R4\", true)]
    [InlineData(@"c:\apps\GLITCH-PLAYER-R4\presets.json", @"C:\Apps\Glitch-Player-R4", true)]
    [InlineData(@"C:\Apps\Glitch-Player-R4", @"C:\Apps\Glitch-Player-R4", true)]
    [InlineData(@"C:\Apps\Other\..\Glitch-Player-R4\presets.json", @"C:\Apps\Glitch-Player-R4", true)]
    [InlineData(@"C:/Apps/Glitch-Player-R4/presets.json", @"C:\Apps\Glitch-Player-R4", true)]
    [InlineData(@"C:\Apps\Glitch-Player-R4-old\presets.json", @"C:\Apps\Glitch-Player-R4", false)]
    [InlineData(@"C:\Apps\Glitch-Player-R4\..\presets.json", @"C:\Apps\Glitch-Player-R4", false)]
    [InlineData(@"D:\Apps\Glitch-Player-R4\presets.json", @"C:\Apps\Glitch-Player-R4", false)]
    [InlineData(@"C:\Users\me\Documents\presets.json", @"C:\Apps\Glitch-Player-R4", false)]
    [InlineData("", @"C:\Apps\Glitch-Player-R4", false)]
    [InlineData(null, @"C:\Apps\Glitch-Player-R4", false)]
    [InlineData(@"C:\Apps\presets.json", "", false)]
    [InlineData(@"C:\presets.json", @"C:\", true)]
    public void IsInsideFolder_MatchesTheFolderAndItsDescendantsOnly(string path, string folder, bool expected) =>
        Assert.Equal(expected, AppPolicy.IsInsideFolder(path, folder));
}
