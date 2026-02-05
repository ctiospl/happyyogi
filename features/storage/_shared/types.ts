export interface IStorageProvider {
	upload(key: string, data: Buffer | Uint8Array, contentType?: string): Promise<UploadResult>;
	download(key: string): Promise<Buffer | null>;
	delete(key: string): Promise<boolean>;
	getUrl(key: string, expiresIn?: number): Promise<string | null>;
	exists(key: string): Promise<boolean>;
}

export interface UploadResult {
	success: boolean;
	key?: string;
	url?: string;
	error?: string;
}
