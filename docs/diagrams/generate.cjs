#!/usr/bin/env node
/**
 * Génère les PNGs PlantUML via le serveur officiel plantuml.com
 * Usage: node generate.js
 */
const zlib = require('zlib');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Encodage spécifique PlantUML (alphabet modifié)
function encode6bit(b) {
  if (b < 10) return String.fromCharCode(48 + b);
  b -= 10;
  if (b < 26) return String.fromCharCode(65 + b);
  b -= 26;
  if (b < 26) return String.fromCharCode(97 + b);
  b -= 26;
  if (b === 0) return '-';
  if (b === 1) return '_';
  return '?';
}

function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;
  return encode6bit(c1) + encode6bit(c2) + encode6bit(c3) + encode6bit(c4);
}

function encodePlantUML(data) {
  let r = '';
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) {
      r += append3bytes(data[i], data[i + 1], 0);
    } else if (i + 1 === data.length) {
      r += append3bytes(data[i], 0, 0);
    } else {
      r += append3bytes(data[i], data[i + 1], data[i + 2]);
    }
  }
  return r;
}

function deflateAndEncode(text) {
  const compressed = zlib.deflateRawSync(Buffer.from(text, 'utf8'), { level: 9 });
  return encodePlantUML(compressed);
}

function downloadPNG(encoded, outputPath) {
  return new Promise((resolve, reject) => {
    const url = `https://www.plantuml.com/plantuml/png/${encoded}`;
    console.log(`  Fetching: ${url.substring(0, 80)}...`);

    const file = fs.createWriteStream(outputPath);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  const diagrams = [
    { input: 'class_diagram.puml',   output: 'class_diagram.png' },
    { input: 'usecase_diagram.puml', output: 'usecase_diagram.png' },
  ];

  const dir = __dirname;

  for (const d of diagrams) {
    const inputPath  = path.join(dir, d.input);
    const outputPath = path.join(dir, d.output);

    console.log(`\nGenerating: ${d.output}`);
    const text    = fs.readFileSync(inputPath, 'utf8');
    const encoded = deflateAndEncode(text);

    try {
      await downloadPNG(encoded, outputPath);
      const size = fs.statSync(outputPath).size;
      console.log(`  Done: ${d.output} (${(size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  console.log('\nAll done! Check docs/diagrams/ for PNG files.');
}

main();
