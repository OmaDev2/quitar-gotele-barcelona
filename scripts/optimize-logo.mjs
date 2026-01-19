import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function optimizeLogo() {
    const rootDir = process.cwd();
    const logoPaths = [
        path.resolve(rootDir, 'public/images/logo.webp'),
        path.resolve(rootDir, 'src/assets/images/logo.webp')
    ];

    for (const logoPath of logoPaths) {
        if (fs.existsSync(logoPath)) {
            console.log(`🎯 Optimizing logo: ${logoPath}`);
            const buffer = await sharp(logoPath)
                .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            const oldSize = fs.statSync(logoPath).size;
            fs.writeFileSync(logoPath, buffer);
            const newSize = fs.statSync(logoPath).size;
            console.log(`   ✅ Resized to 400px. Size: ${(oldSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB`);
        }
    }
}

optimizeLogo().catch(console.error);
