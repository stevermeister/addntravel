import sharp from 'sharp';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateFavicons() {
  const sizes = [16, 32, 180, 192, 512];
  const inputSvg = join(__dirname, '../public/favicon.svg');
  
  for (const size of sizes) {
    const outputName = size === 180 ? 'apple-touch-icon.png' :
                      size === 192 ? 'android-chrome-192x192.png' :
                      size === 512 ? 'android-chrome-512x512.png' :
                      `favicon-${size}x${size}.png`;
    
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, '../public', outputName));
    
    console.log(`Generated ${outputName}`);
  }

  // Generate ICO file (contains both 16x16 and 32x32)
  const ico16 = await sharp(inputSvg)
    .resize(16, 16)
    .png()
    .toBuffer();
  
  const ico32 = await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toBuffer();

  // Use sharp to create ICO file
  await sharp(ico32)
    .toFile(join(__dirname, '../public/favicon.ico'));

  console.log('Generated favicon.ico');
}

generateFavicons().catch(console.error);
