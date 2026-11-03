import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publish = path.join(root, 'out', 'publish');
const release = path.join(root, 'out', 'app');
const work = path.join(root, 'out', 'cab-build');
for (const dir of [release, work]) fs.mkdirSync(dir, { recursive: true });
function run(exe, args, capture = false) {
    const result = spawnSync(exe, args, { stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8',
        maxBuffer: 8 * 1024 * 1024, cwd: root, windowsHide: true });
    if (result.error) throw result.error;
    if (capture) {
        fs.writeFileSync(path.join(work, 'makecab.log'), result.stdout + result.stderr);
        console.log(result.stdout.split(/[\r\n]+/).filter(Boolean).slice(-7).join('\n'));
        if (result.stderr) console.error(result.stderr);
    }
    if (result.status !== 0) throw new Error(path.basename(exe) + ' failed: ' + result.status);
}
function files(dir, prefix = '') {
    return fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))
        .flatMap((entry) => {
            const relative = prefix + entry.name;
            if (entry.isSymbolicLink() || !/^[a-zA-Z0-9_.\\-]+$/.test(relative)) throw new Error('Unsupported payload path: ' + relative);
            if (entry.isDirectory()) return files(path.join(dir, entry.name), relative + '\\');
            if (!entry.isFile()) throw new Error('Not a regular payload file: ' + relative);
            const full = path.join(publish, relative);
            return [{ path: relative, size: fs.statSync(full).size, hash: hash(full) }];
        });
}
function hash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
const manifest = files(publish);
if (!manifest.some((f) => f.path === 'GlitchPlayerR4.exe') || manifest.length > 2000) throw new Error('Unexpected runtime payload.');
const quote = (s) => {
    if (/["\r\n]/.test(s)) throw new Error('Unsupported build path.');
    return '"' + s + '"';
};
const ddf = [
    '.OPTION EXPLICIT', '.Set Cabinet=on', '.Set Compress=on', '.Set CompressionType=LZX',
    '.Set CompressionMemory=21', '.Set MaxDiskSize=0', '.Set MaxCabinetSize=0',
    '.Set CabinetNameTemplate=payload.cab', '.Set DiskDirectoryTemplate=' + quote(release),
    '.Set RptFileName=' + quote(path.join(work, 'payload.rpt')),
    '.Set InfFileName=' + quote(path.join(work, 'payload.inf')),
    ...manifest.map((f, i) => quote(path.join(publish, f.path)) + ' f' + String(i).padStart(6, '0'))
].join('\r\n');
fs.writeFileSync(path.join(work, 'payload.ddf'), ddf);
const cab = path.join(release, 'payload.cab');
if (fs.existsSync(cab)) fs.unlinkSync(cab);
run(path.join(process.env.WINDIR, 'System32', 'makecab.exe'), ['/F', path.join(work, 'payload.ddf')], true);
const cabHash = hash(cab);
const csString = (s) => JSON.stringify(s);
const generated = [
    'internal static class Payload {',
    'internal const string Hash = "' + cabHash + '";',
    'internal static readonly PayloadFile[] Files = {',
    ...manifest.map((f, i) => 'new PayloadFile("f' + String(i).padStart(6, '0') + '", ' +
        csString(f.path) + ', ' + f.size + 'L, "' + f.hash + '"),'),
    '};', '}'
].join('\r\n');
fs.writeFileSync(path.join(work, 'Payload.g.cs'), generated);
const framework = path.join(process.env.WINDIR, 'Microsoft.NET', 'Framework64', 'v4.0.30319');
run(path.join(framework, 'csc.exe'), [
    '/nologo', '/target:winexe', '/platform:x64', '/optimize+', '/warnaserror+',
    '/out:' + path.join(release, 'GlitchPlayerR4.exe'),
    '/win32icon:' + path.join(root, 'assets', 'r4.ico'),
    '/win32manifest:' + path.join(root, 'launcher', 'app.manifest'),
    '/r:System.Windows.Forms.dll', '/r:System.Xaml.dll',
    '/r:' + path.join(framework, 'WPF', 'PresentationFramework.dll'),
    '/r:' + path.join(framework, 'WPF', 'PresentationCore.dll'),
    '/r:' + path.join(framework, 'WPF', 'WindowsBase.dll'),
    path.join(root, 'launcher', 'Launcher.cs'), path.join(work, 'Payload.g.cs')
]);
fs.writeFileSync(path.join(work, 'manifest.json'), JSON.stringify({ cabHash, files: manifest }, null, 2));
for (const name of ['GlitchPlayerR4.exe', 'payload.cab']) {
    fs.writeFileSync(path.join(release, name + '.sha256'), hash(path.join(release, name)) + '  ' + name + '\n');
}
console.log('[cab] Verified-launcher payload: ' + manifest.length + ' files; SHA-256 ' + cabHash);
