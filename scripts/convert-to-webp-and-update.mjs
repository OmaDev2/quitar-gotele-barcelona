import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const TARGET_DIRS = ['public/images', 'src/assets/images'];
const SEARCH_DIR = 'src';
const MAX_WIDTH = 1920;
const QUALITY = 80;

async function getFiles(dir) {
    try {
        const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? getFiles(res) : res;
        }));
        return files.flat();
    } catch (e) {
        if (e.code === 'ENOENT') return [];
        throw e;
    }
}

async function run() {
    const rootDir = process.cwd();
    const replacements = [];

    for (const target of TARGET_DIRS) {
        const imagesDir = path.resolve(rootDir, target);
        const allFiles = await getFiles(imagesDir);
        const images = allFiles.filter(f => /\.(png|jpg|jpeg)$/i.test(f));

        console.log(`🚀 Found ${images.length} images in ${target}...`);

        for (const imgPath of images) {
            const ext = path.extname(imgPath);
            const webpPath = imgPath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');

            console.log(`📸 Processing: ${path.relative(rootDir, imgPath)}`);

            try {
                const image = sharp(imgPath);
                const metadata = await image.metadata();

                let pipeline = image;
                if (metadata.width && metadata.width > MAX_WIDTH) {
                    console.log(`   Resizing ${metadata.width}px -> ${MAX_WIDTH}px`);
                    pipeline = pipeline.resize(MAX_WIDTH);
                }

                await pipeline.webp({ quality: QUALITY }).toFile(webpPath);

                const oldSize = fs.statSync(imgPath).size;
                const newSize = fs.statSync(webpPath).size;
                const saved = oldSize - newSize;

                console.log(`   ✅ Saved ${(saved / 1024).toFixed(0)} KB`);

                // Prepare replacement strings
                const relOld = path.relative(rootDir, imgPath).replace(/\\/g, '/');
                const relNew = path.relative(rootDir, webpPath).replace(/\\/g, '/');

                // Also handle public paths (starting with /images)
                const rootPublic = path.resolve(rootDir, 'public');
                if (imgPath.startsWith(rootPublic)) {
                    const pubOld = imgPath.replace(rootPublic, '').replace(/\\/g, '/');
                    const pubNew = webpPath.replace(rootPublic, '').replace(/\\/g, '/');
                    replacements.push({ old: pubOld, new: pubNew });
                }

                // Handle relative imports (e.g. ./logo.png -> ./logo.webp)
                const filenameOld = path.basename(imgPath);
                const filenameNew = path.basename(webpPath);
                replacements.push({ old: filenameOld, new: filenameNew });

                fs.unlinkSync(imgPath);
            } catch (err) {
                console.error(`   ❌ Error:`, err.message);
            }
        }
    }

    // Deduplicate replacements and sort by length descending to avoid partial matches
    const finalReplacements = Array.from(new Set(replacements.map(JSON.stringify)))
        .map(JSON.parse)
        .sort((a, b) => b.old.length - a.old.length);

    if (finalReplacements.length > 0) {
        console.log(`\n🔗 Updating references...`);
        const allTextFiles = (await getFiles(path.resolve(rootDir, SEARCH_DIR)))
            .filter(f => /\.(mdx|md|yaml|yml|json|astro|ts|tsx|js|jsx|html|css)$/i.test(f));

        for (const file of allTextFiles) {
            let content = fs.readFileSync(file, 'utf8');
            let changed = false;

            for (const r of finalReplacements) {
                if (content.includes(r.old)) {
                    const regex = new RegExp(r.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    content = content.replace(regex, r.new);
                    changed = true;
                    console.log(`   Updated ${r.old} -> ${r.new} in ${path.relative(rootDir, file)}`);
                }
            }

            if (changed) fs.writeFileSync(file, content);
        }
    }

    console.log('\n🎉 Finished!');
}

run().catch(console.error);
