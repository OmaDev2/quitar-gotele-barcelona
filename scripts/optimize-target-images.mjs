import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function optimizeImages() {
    const rootDir = process.cwd();

    // Configuration for images to optimize
    const imagesToOptimize = [
        {
            path: 'public/images/home/blocks/0/value/backgroundImage.webp',
            width: 1920,
            quality: 75, // Lower quality for background
            fit: 'cover'
        },
        {
            path: 'public/images/services/blocks/2/value/items/0/image.webp',
            width: 700, // Reduced from 994 to ~700 (displayed at ~697)
            quality: 80
        },
        {
            path: 'public/images/services/blocks/2/value/items/1/image.webp',
            width: 700,
            quality: 80
        },
        {
            path: 'public/images/services/blocks/2/value/items/2/image.webp',
            width: 700,
            quality: 80
        },
        {
            path: 'public/images/services/blocks/2/value/items/3/image.webp',
            width: 700,
            quality: 80
        }
    ];

    console.log('🚀 Starting targeted image optimization...');

    for (const imgConfig of imagesToOptimize) {
        const fullPath = path.resolve(rootDir, imgConfig.path);

        if (fs.existsSync(fullPath)) {
            try {
                const oldSize = fs.statSync(fullPath).size;
                console.log(`\n📸 Processing: ${imgConfig.path}`);
                console.log(`   Current size: ${(oldSize / 1024).toFixed(2)} KB`);

                const image = sharp(fullPath);
                const metadata = await image.metadata();

                // Only resize if the current width is larger than target
                if (metadata.width > imgConfig.width) {
                    console.log(`   Resizing width: ${metadata.width}px -> ${imgConfig.width}px`);

                    const buffer = await image
                        .resize({
                            width: imgConfig.width,
                            withoutEnlargement: true,
                            fit: imgConfig.fit || 'inside'
                        })
                        .webp({
                            quality: imgConfig.quality,
                            effort: 6 // Creating the best possible compression
                        })
                        .toBuffer();

                    fs.writeFileSync(fullPath, buffer);

                    const newSize = fs.statSync(fullPath).size;
                    const savings = oldSize - newSize;
                    const savingsPercent = (savings / oldSize) * 100;

                    console.log(`   ✅ Optimized size: ${(newSize / 1024).toFixed(2)} KB`);
                    console.log(`   🎉 Saved: ${(savings / 1024).toFixed(2)} KB (${savingsPercent.toFixed(1)}%)`);
                } else {
                    console.log(`   ⚠️ Image width (${metadata.width}px) is already smaller or equal to target (${imgConfig.width}px). Compressing only...`);

                    // Just compress if size is okay
                    const buffer = await image
                        .webp({
                            quality: imgConfig.quality,
                            effort: 6
                        })
                        .toBuffer();

                    fs.writeFileSync(fullPath, buffer);
                    const newSize = fs.statSync(fullPath).size;
                    console.log(`   ✅ Optimized size: ${(newSize / 1024).toFixed(2)} KB`);
                }

            } catch (error) {
                console.error(`   ❌ Error processing ${imgConfig.path}:`, error.message);
            }
        } else {
            console.log(`   ⚠️  File not found: ${imgConfig.path}`);
        }
    }
}

optimizeImages().catch(console.error);
