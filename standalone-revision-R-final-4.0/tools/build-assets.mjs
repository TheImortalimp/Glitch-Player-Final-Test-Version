import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Vector geometry keeps both brackets legible even at taskbar / title-menu sizes.
const shapes = [
    [[38, 55], [72, 55], [72, 71], [55, 71], [55, 185], [72, 185], [72, 201], [38, 201]],
    [[184, 55], [218, 55], [218, 201], [184, 201], [184, 185], [201, 185], [201, 71], [184, 71]],
    [[88, 59], [132, 59], [157, 66], [172, 87], [172, 110], [159, 130], [141, 137],
        [177, 197], [151, 197], [116, 140], [110, 140], [110, 197], [88, 197]]
];
const hole = [[110, 80], [131, 80], [145, 84], [151, 94], [151, 105], [144, 115], [131, 119], [110, 119]];
function inside(x, y, points) {
    let hit = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i], [xj, yj] = points[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
}
function pixel(x, y) {
    const dx = Math.max(16 - x, 0, x - 240), dy = Math.max(16 - y, 0, y - 240);
    if (dx * dx + dy * dy > 256) return [0, 0, 0, 0];
    if (inside(x, y, shapes[0]) || inside(x, y, shapes[1])) return [229, 178, 76, 255];
    if (inside(x, y, shapes[2]) && !inside(x, y, hole)) return [255, 239, 191, 255];
    return [12, 15, 20, 255];
}
const sizes = [16, 20, 24, 32, 40, 48, 64, 128, 256];
const bitmaps = sizes.map((size) => {
    const maskRow = Math.ceil(size / 32) * 4;
    const bmp = Buffer.alloc(40 + size * size * 4 + maskRow * size);
    bmp.writeUInt32LE(40, 0);
    bmp.writeInt32LE(size, 4);
    bmp.writeInt32LE(size * 2, 8);
    bmp.writeUInt16LE(1, 12);
    bmp.writeUInt16LE(32, 14);
    bmp.writeUInt32LE(size * size * 4, 20);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const rgba = [0, 0, 0, 0];
        for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
            const p = pixel((x + (sx + 0.5) / 4) * 256 / size, (y + (sy + 0.5) / 4) * 256 / size);
            p.forEach((v, k) => { rgba[k] += v / 16; });
        }
        const pos = 40 + ((size - y - 1) * size + x) * 4;
        [rgba[2], rgba[1], rgba[0], rgba[3]].forEach((v, k) => { bmp[pos + k] = Math.round(v); });
    }
    return bmp;
});
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
    const pos = 6 + i * 16;
    header[pos] = header[pos + 1] = size === 256 ? 0 : size;
    header.writeUInt16LE(1, pos + 4);
    header.writeUInt16LE(32, pos + 6);
    header.writeUInt32LE(bitmaps[i].length, pos + 8);
    header.writeUInt32LE(offset, pos + 12);
    offset += bitmaps[i].length;
});
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'assets', 'r4.ico'), Buffer.concat([header, ...bitmaps]));
console.log('[assets] Generated complete [R] icon at 9 sizes (16-256 px).');
