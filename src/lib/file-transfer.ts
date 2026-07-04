import { decryptData, encryptFile, sha256Hash, signMessage } from '@scrt-link/core';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import { api, asyncPool } from '$lib/api';

// If the request fails, we retry
axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay });

type SignedUrlGetResponse = {
	url: string;
};
export type PresignedUploadResponse = { url: string };

type Chunk = {
	key: string;
	signature: string;
	size: number;
};

export type FileMeta = {
	name: string;
	size: number;
	mimeType: string;
	isSingleChunk: boolean;
};
export type FileReference = {
	bucket: string;
	chunks: Chunk[];
};

export interface SecretFile extends FileMeta, FileReference {
	secretIdHash: string;
	// When set, chunk downloads are authorized against a secret request
	// (ECDSA signature verified vs. secret_request.responseFilePublicKey)
	// instead of the secret table.
	requestIdHash?: string;
	decryptionKey: string;
	progress: number;
}

type HandleFileEncryptionAndUpload = {
	controllers: Map<number, AbortController>;
	file: File;
	masterKey: string;
	privateKey: CryptoKey;
	chunkSize: number;
	progressCallback: (progress: number) => void;
};
export const handleFileEncryptionAndUpload = async ({
	controllers,
	file,
	masterKey,
	privateKey,
	chunkSize,
	progressCallback
}: HandleFileEncryptionAndUpload): Promise<Chunk[]> => {
	const fileSize = file.size;
	const numberOfChunks = typeof chunkSize === 'number' ? Math.ceil(fileSize / chunkSize) : 1;
	const concurrentUploads = Math.min(3, numberOfChunks);
	const progressOfEachChunk: number[] = [];
	progressCallback(0);

	if (!fileSize) {
		throw new Error('Empty file (zero bytes). Please select another file.');
	}

	return asyncPool(concurrentUploads, [...new Array(numberOfChunks).keys()], async (i: number) => {
		const controller = new AbortController();
		const signal = controller.signal;
		controllers.set(i, controller); // Store the controller

		const start = i * chunkSize;
		const end = i + 1 === numberOfChunks ? fileSize : (i + 1) * chunkSize;
		const chunk = file.slice(start, end);

		const encryptedFile = await encryptFile(chunk, masterKey);

		const chunkFileSize = encryptedFile.size;
		const fileName = crypto.randomUUID();
		const signature = await signMessage(fileName, privateKey);

		const fileNameHashed = await sha256Hash(fileName);
		const { url } = await api<PresignedUploadResponse>(`/secrets/files?file=${fileNameHashed}`);

		await uploadFileToS3({
			signal,
			url,
			blob: encryptedFile,
			size: chunkFileSize,
			progressCallback: (p) => {
				progressOfEachChunk[i] = p;
				const sum = (progressOfEachChunk.reduce((a, b) => a + b, 0) / numberOfChunks) * 100;
				progressCallback(sum);
			}
		}).then(() => {
			controllers.delete(i); // Remove controller after completion
		});

		return {
			key: fileName,
			signature,
			size: chunk.size
		};
	});
};

type UploadFileToS3Params = {
	signal: AbortSignal;
	url: string;
	blob: Blob;
	size: number;
	progressCallback: (progress: number) => void;
};

export const uploadFileToS3 = async ({
	signal,
	url,
	blob,
	size,
	progressCallback
}: UploadFileToS3Params): Promise<void> => {
	progressCallback(0);

	// Upload with a presigned PUT (Cloudflare R2 doesn't implement S3 POST Object).
	// The Content-Type must match what the URL was signed with on the server
	// (application/octet-stream), otherwise R2 rejects the signature.
	// Using axios b/c of built-in progress callback.
	await axios.request({
		signal,
		method: 'PUT',
		url: url,
		data: blob,
		headers: { 'Content-Type': 'application/octet-stream' },
		onUploadProgress: (p) => {
			progressCallback(p.loaded / (p.total || size));
		}
	});
};

const chunkDownload = async ({
	secretIdHash,
	requestIdHash,
	bucket,
	chunk
}: Pick<SecretFile, 'secretIdHash' | 'requestIdHash' | 'bucket'> & { chunk: Chunk }) => {
	const { key, signature } = chunk;
	const keyHash = await sha256Hash(key);

	const { url } = requestIdHash
		? await api<SignedUrlGetResponse>(
				`/secret-requests/files/${key}`,
				{ method: 'POST' },
				{ requestIdHash, bucket, keyHash, signature }
			)
		: await api<SignedUrlGetResponse>(
				`/secrets/files/${key}`,
				{ method: 'POST' },
				{ secretIdHash, bucket, keyHash, signature }
			);
	const response = await fetch(url);

	if (!response.ok || !response.body) {
		throw new Error(`Couldn't retrieve file - it may no longer exist.`);
	}
	return response;
};

// Function runs in Service Worker, which means no access to DOM, etc.
export const handleFileChunksDownload = (file: SecretFile) => {
	const { secretIdHash, requestIdHash, chunks, bucket, decryptionKey } = file;

	let loaded = 0;
	const totalSize = chunks.map((o) => o['size']).reduce((a, b) => a + b);

	const decryptionStream = new ReadableStream({
		async start(controller) {
			// We download the chunks in sequence.
			// We could do concurrent fetching but the order of the chunks in the stream is important.
			for (const chunk of chunks) {
				const response = await chunkDownload({ secretIdHash, requestIdHash, bucket, chunk });

				// This stream is for reading the download progress
				const res = new Response(
					new ReadableStream({
						async start(controller) {
							const reader = response.body!.getReader();
							for (;;) {
								const { done, value } = await reader.read();
								if (done) {
									break;
								}
								loaded += value.byteLength;
								file.progress = loaded / totalSize;
								controller.enqueue(value);
							}
							controller.close();
						}
					})
				);

				const encryptedFileChunk = await res.blob();
				const decryptedFileChunk = await decryptData(encryptedFileChunk, decryptionKey);

				controller.enqueue(new Uint8Array(decryptedFileChunk));
			}

			controller.close();
		}
	});

	return decryptionStream;
};

export const getFileExtension = (file: File): string | null => {
	const name = file.name;
	const parts = name.split('.');
	return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? null) : null;
};
