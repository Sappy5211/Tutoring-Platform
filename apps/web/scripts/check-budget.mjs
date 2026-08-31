import { readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const assets = join(process.cwd(), "dist", "assets");
const files = (await readdir(assets)).filter((file) => file.endsWith(".js"));
const entries = [];
for (const file of files) entries.push({ file, gzip: gzipSync(await readFile(join(assets, file)), { level: 9 }).byteLength });
entries.sort((a, b) => b.gzip - a.gzip);
const entry = entries.find(({ file }) => file.startsWith("index-"));
const max = 200 * 1024;
console.table(entries.map(({ file, gzip }) => ({ file, gzipKB: (gzip / 1024).toFixed(1) })));
if (!entry || entry.gzip > max) { console.error(`Initial JS budget failed: ${entry ? (entry.gzip / 1024).toFixed(1) : "missing"}KB > 200KB`); process.exit(1); }
console.log(`Initial JS budget passed: ${(entry.gzip / 1024).toFixed(1)}KB / 200KB`);
