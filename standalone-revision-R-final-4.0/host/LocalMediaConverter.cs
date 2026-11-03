using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;
using Windows.Media.MediaProperties;
using Windows.Media.Transcoding;
using Windows.Storage;

namespace GlitchPlayerR4;

internal sealed class LocalMediaConverter
{
    private readonly string cache;
    private readonly byte[] key;

    public LocalMediaConverter(string cache, byte[] key)
    {
        this.cache = Path.GetFullPath(cache);
        this.key = key is { Length: 32 } ? key.ToArray() : throw new ArgumentException("A 32-byte cache key is required.", nameof(key));
        Directory.CreateDirectory(this.cache);
    }

    public async Task<string> ConvertAsync(string source, string kind, CancellationToken cancellation)
    {
        cancellation.ThrowIfCancellationRequested();
        if (kind != "video" && kind != "audio") throw new ArgumentException("Invalid media kind.");
        var file = new FileInfo(source);
        if (!file.Exists) throw new FileNotFoundException("The selected media file no longer exists.");
        var identity = $"windows-native-h264-aac-v2|{file.FullName}|{file.Length}|{file.LastWriteTimeUtc.Ticks}|{kind}";
        var digest = HMACSHA256.HashData(key, Encoding.UTF8.GetBytes(identity));
        var name = Convert.ToHexString(digest).ToLowerInvariant() + (kind == "video" ? ".mp4" : ".m4a");
        var target = Path.Combine(cache, name);
        if (File.Exists(target) && new FileInfo(target).Length > 0) return name;
        var temporary = Guid.NewGuid().ToString("N") + ".partial" + Path.GetExtension(name);
        var temporaryPath = Path.Combine(cache, temporary);
        try
        {
            var input = await StorageFile.GetFileFromPathAsync(file.FullName).AsTask(cancellation);
            var folder = await StorageFolder.GetFolderFromPathAsync(cache).AsTask(cancellation);
            var output = await folder.CreateFileAsync(temporary, CreationCollisionOption.FailIfExists).AsTask(cancellation);
            var profile = kind == "video"
                ? MediaEncodingProfile.CreateMp4(VideoEncodingQuality.HD720p)
                : MediaEncodingProfile.CreateM4a(AudioEncodingQuality.High);
            if (kind == "video")
            {
                var properties = await input.Properties.GetVideoPropertiesAsync().AsTask(cancellation);
                if (properties.Width == 0 || properties.Height == 0)
                    throw new IOException("Windows could not read the video's dimensions or codec.");
                profile.Video.Width = (properties.Width + 1) & ~1u;
                profile.Video.Height = (properties.Height + 1) & ~1u;
            }
            profile.Audio.ChannelCount = 2;
            profile.Audio.SampleRate = 48000;
            profile.Audio.Bitrate = 192000;
            var transcoder = new MediaTranscoder { AlwaysReencode = true };
            var prepared = await transcoder.PrepareFileTranscodeAsync(input, output, profile).AsTask(cancellation);
            if (!prepared.CanTranscode)
                throw new IOException($"Windows native conversion cannot decode/encode this file ({Describe(prepared.FailureReason)}). " +
                    "Install the appropriate licensed Windows codec or convert the file separately. Windows N requires the Media Feature Pack.");
            await prepared.TranscodeAsync().AsTask(cancellation);
            cancellation.ThrowIfCancellationRequested();
            if (!File.Exists(temporaryPath) || new FileInfo(temporaryPath).Length == 0)
                throw new IOException("Windows native conversion produced no playable output.");
            if (!HasMediaSamples(temporaryPath, kind))
                throw new IOException($"Windows native conversion produced no {kind} frames. " +
                    "The installed Windows codec cannot convert this input; use a separately licensed codec/converter.");
            File.Move(temporaryPath, target, overwrite: true);
            return name;
        }
        catch (Exception error) when (error is System.Runtime.InteropServices.COMException or NotSupportedException)
        {
            throw new IOException("Windows native media conversion failed: " + error.Message +
                " Check installed Windows media components/codecs.", error);
        }
        finally
        {
            try { if (File.Exists(temporaryPath)) File.Delete(temporaryPath); }
            catch (Exception cleanup) when (cleanup is IOException or UnauthorizedAccessException) { }
        }
    }

    private static string Describe(TranscodeFailureReason reason) => reason switch
    {
        TranscodeFailureReason.CodecNotFound => "no installed Windows codec can read this format",
        TranscodeFailureReason.InvalidProfile => "Windows rejected the output profile",
        _ => "no installed Windows decoder matches this file's video or audio format"
    };

    // MediaTranscoder can finish an AVI transcode with audio but an empty video track.
    private static bool HasMediaSamples(string path, string kind)
    {
        using var stream = File.OpenRead(path);
        uint Number(long offset)
        {
            stream.Position = offset;
            Span<byte> bytes = stackalloc byte[4];
            stream.ReadExactly(bytes);
            return BinaryPrimitives.ReadUInt32BigEndian(bytes);
        }
        IEnumerable<(string Type, long Start, long End)> Boxes(long start, long end)
        {
            for (var offset = start; offset + 8 <= end;)
            {
                var size = (long)Number(offset);
                stream.Position = offset + 4;
                var typeBytes = new byte[4];
                stream.ReadExactly(typeBytes);
                var header = 8;
                if (size == 1)
                {
                    stream.Position = offset + 8;
                    var extended = new byte[8];
                    stream.ReadExactly(extended);
                    var length = BinaryPrimitives.ReadUInt64BigEndian(extended);
                    if (length > long.MaxValue) throw new IOException("Invalid native output box length.");
                    size = (long)length;
                    header = 16;
                }
                if (size == 0) size = end - offset;
                if (size < header || size > end - offset) throw new IOException("Invalid native output container.");
                yield return (Encoding.ASCII.GetString(typeBytes), offset + header, offset + size);
                offset += size;
            }
        }
        foreach (var moov in Boxes(0, stream.Length).Where(box => box.Type == "moov"))
        foreach (var trak in Boxes(moov.Start, moov.End).Where(box => box.Type == "trak"))
        foreach (var mdia in Boxes(trak.Start, trak.End).Where(box => box.Type == "mdia"))
        {
            var children = Boxes(mdia.Start, mdia.End).ToArray();
            var requiredTrack = children.Any(box => box.Type == "hdlr" && box.End - box.Start >= 12 &&
                Number(box.Start + 8) == (kind == "video" ? 0x76696465u : 0x736f756eu));
            if (!requiredTrack) continue;
            foreach (var minf in children.Where(box => box.Type == "minf"))
            foreach (var stbl in Boxes(minf.Start, minf.End).Where(box => box.Type == "stbl"))
            foreach (var stsz in Boxes(stbl.Start, stbl.End).Where(box => box.Type == "stsz"))
                if (stsz.End - stsz.Start >= 12 && Number(stsz.Start + 8) > 0) return true;
        }
        return false;
    }
}
