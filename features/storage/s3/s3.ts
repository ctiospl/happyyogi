import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { IStorageProvider, UploadResult } from '../_shared/types.js';

export class S3StorageProvider implements IStorageProvider {
	private client: S3Client;
	private bucket: string;

	constructor() {
		this.bucket = process.env.S3_BUCKET || '';
		this.client = new S3Client({
			endpoint: process.env.S3_ENDPOINT,
			region: process.env.S3_REGION || 'auto',
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY || '',
				secretAccessKey: process.env.S3_SECRET_KEY || ''
			},
			forcePathStyle: true // Required for most S3-compatible services
		});
	}

	async upload(
		key: string,
		data: Buffer | Uint8Array,
		contentType = 'application/octet-stream'
	): Promise<UploadResult> {
		try {
			await this.client.send(
				new PutObjectCommand({
					Bucket: this.bucket,
					Key: key,
					Body: data,
					ContentType: contentType
				})
			);
			return { success: true, key };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async download(key: string): Promise<Buffer | null> {
		try {
			const response = await this.client.send(
				new GetObjectCommand({
					Bucket: this.bucket,
					Key: key
				})
			);
			const bytes = await response.Body?.transformToByteArray();
			return bytes ? Buffer.from(bytes) : null;
		} catch {
			return null;
		}
	}

	async delete(key: string): Promise<boolean> {
		try {
			await this.client.send(
				new DeleteObjectCommand({
					Bucket: this.bucket,
					Key: key
				})
			);
			return true;
		} catch {
			return false;
		}
	}

	async getUrl(key: string, expiresIn = 3600): Promise<string | null> {
		try {
			return await getSignedUrl(
				this.client,
				new GetObjectCommand({
					Bucket: this.bucket,
					Key: key
				}),
				{ expiresIn }
			);
		} catch {
			return null;
		}
	}

	async exists(key: string): Promise<boolean> {
		try {
			await this.client.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: key
				})
			);
			return true;
		} catch {
			return false;
		}
	}
}

export const s3Storage = new S3StorageProvider();
