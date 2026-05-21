import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outputsDir = path.resolve('public/barbershop-reviews');
if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir, { recursive: true });
}

const crops = [
  {
    input: 'client-briefs/modern-classic/screenshots/review screenshot.webp',
    output: 'public/barbershop-reviews/michael-review-cropped.png',
    left: 0,
    top: 320,
    width: 722,
    height: 500,
  },
  {
    input: 'client-briefs/modern-classic/screenshots/review screenshot 2.webp',
    output: 'public/barbershop-reviews/eric-review-cropped.png',
    left: 0,
    top: 370,
    width: 722,
    height: 500,
  },
];

for (const crop of crops) {
  await sharp(crop.input)
    .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
    .png({ quality: 92 })
    .toFile(crop.output);
  console.log(`Wrote ${crop.output}`);
}
