import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

function copyFolder(srcRel, destRel) {
  const src = path.resolve(rootDir, srcRel);
  const dest = path.resolve(distDir, destRel);
  if (fs.existsSync(src)) {
    console.log(`Copying ${srcRel} -> ${destRel}...`);
    fs.cpSync(src, dest, { recursive: true });
  } else {
    console.warn(`Source folder ${srcRel} does not exist, skipping.`);
  }
}

if (fs.existsSync(distDir)) {
  copyFolder('MAKCIK_CANTEEN', 'MAKCIK_CANTEEN');
  copyFolder('neon_kart_3d', 'neon_kart_3d');
  copyFolder('docs', 'docs');
  copyFolder('TEMPLATE_DESIGN_DOCUMENT', 'TEMPLATE_DESIGN_DOCUMENT');
  console.log('✓ Successfully copied all games, slides, and documentation suites into dist/!');
} else {
  console.error('Error: dist directory does not exist. Please run vite build first.');
  process.exit(1);
}
