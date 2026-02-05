import fs from 'fs/promises';
import path from 'path';
import type { IStorageProvider, UploadResult } from '../_shared/types.js';

export class LocalStorageProvider implements IStorageProvider {
	private basePath: string;

	constructor(basePath?: string) {
		this.basePath = basePath || process.env.STORAGE_PATH || './storage';
	}

	private getFilePath(key: string): string {
		// Prevent path traversal attacks
		const normalizedKey = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '');
		const filePath = path.join(this.basePath, normalizedKey);
		const resolvedPath = path.resolve(filePath);
		const resolvedBase = path.resolve(this.basePath);

		if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
			throw new Error('Invalid file path: path traversal detected');
		}
		return filePath;
	}

	async upload(key: string, data: Buffer | Uint8Array): Promise<UploadResult> {
		try {
			const filePath = this.getFilePath(key);
			await fs.mkdir(path.dirname(filePath), { recursive: true });
			await fs.writeFile(filePath, data);
			return { success: true, key };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async download(key: string): Promise<Buffer | null> {
		try {
			return await fs.readFile(this.getFilePath(key));
		} catch {
			return null;
		}
	}

	async delete(key: string): Promise<boolean> {
		try {
			await fs.unlink(this.getFilePath(key));
			return true;
		} catch {
			return false;
		}
	}

	async getUrl(key: string): Promise<string | null> {
		if (await this.exists(key)) {
			return `/files/${key}`;
		}
		return null;
	}

	async exists(key: string): Promise<boolean> {
		try {
			await fs.access(this.getFilePath(key));
			return true;
		} catch {
			return false;
		}
	}
}

export const localStorage = new LocalStorageProvider();
