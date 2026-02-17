import sharp from 'sharp';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATIC_IMAGES_DIR = join(__dirname, '..', 'static', 'images');

async function findJpegFiles(dir: string): Promise<string[]> {
	const results: string[] = [];
	const entries = readdirSync(dir);
	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			results.push(...(await findJpegFiles(fullPath)));
		} else {
			const ext = extname(entry).toLowerCase();
			if (ext === '.jpg' || ext === '.jpeg') {
				results.push(fullPath);
			}
		}
	}
	return results;
}

async function convertToWebp(inputPath: string): Promise<void> {
	const ext = extname(inputPath);
	const webpPath = inputPath.slice(0, -ext.length) + '.webp';

	if (existsSync(webpPath)) {
		console.log(`  skip (exists): ${basename(webpPath)}`);
		return;
	}

	const name = basename(inputPath, ext);
	const isLogo = name.toLowerCase() === 'logo-full';
	const maxWidth = isLogo ? 400 : 2000;

	await sharp(inputPath).resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality: 85 }).toFile(webpPath);

	const { size } = statSync(webpPath);
	console.log(`  converted: ${basename(inputPath)} → ${basename(webpPath)} (${(size / 1024).toFixed(1)}KB)`);
}

async function main() {
	if (!existsSync(STATIC_IMAGES_DIR)) {
		console.error(`Directory not found: ${STATIC_IMAGES_DIR}`);
		process.exit(1);
	}
	console.log(`Scanning: ${STATIC_IMAGES_DIR}`);
	const jpegFiles = await findJpegFiles(STATIC_IMAGES_DIR);
	console.log(`Found ${jpegFiles.length} JPEG file(s)\n`);

	for (const file of jpegFiles) {
		await convertToWebp(file);
	}

	console.log('\nDone.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
