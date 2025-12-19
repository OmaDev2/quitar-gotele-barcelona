import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagePath = 'public/images/blog/default.jpg';

async function convert() {
    const fullPath = path.resolve(process.cwd(), imagePath);
    if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${fullPath}`);
        return;
    }
    const parsed = path.parse(fullPath);
    const outputPath = path.join(parsed.dir, parsed.name + '.webp');

    try {
        await sharp(fullPath)
            .webp({ quality: 80 })
            .toFile(outputPath);
        console.log(`Converted ${imagePath} to ${outputPath}`);
    } catch (err) {
        console.error(`Error converting ${imagePath}:`, err);
    }
}

convert();
