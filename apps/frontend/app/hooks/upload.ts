"use client";

import { useRef, useState, useCallback } from "react";

export interface UploadOptions {
	uploadUrl: string;
	chunkSize: number;
	maxFileSize?: number;
	onComplete?: (filesUploadedID: fileUploadedID[]) => void;
	onError?: (error: Error) => void;
}

export type UploadStatus = "pending" | "uploading" | "done" | "error";

export interface FileUploadMetaData {
	status: UploadStatus;
	progress: number;
}

export interface FileListItem {
	id: string;
	file: File;
}

export interface fileUploadedID {
	id: string;
	mimeType: string;
	fileName: string;
}

export function useUpload({
	uploadUrl,
	chunkSize,
	maxFileSize = 100 * 1024 * 1024, // 100MB default
	onComplete,
	onError,
}: UploadOptions) {
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState<number>(0);
	const [uploading, setUploading] = useState<boolean>(false);
	const [fileList, setFileList] = useState<FileListItem[]>([]);
	const [fileMetaData, setFileMetaData] = useState<FileUploadMetaData[]>([]);

	const abortController = useRef<AbortController>();

	const validateFile = useCallback(
		(file: File) => {
			if (file.size > maxFileSize) {
				throw new Error(
					`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`,
				);
			}
			return true;
		},
		[maxFileSize],
	);

	const setFile = useCallback(
		(files: File[]) => {
			console.log("setFile called with:", files);

			const validFiles = files.filter((file) => {
				try {
					return validateFile(file);
				} catch (error) {
					onError?.(error as Error);
					return false;
				}
			});

			console.log("Valid files:", validFiles);

			const newFiles = validFiles.map((file) => ({
				id: crypto.randomUUID(),
				file,
			}));

			console.log("New files with IDs:", newFiles);

			setFileList((prev) => {
				const updatedList = [...prev, ...newFiles];
				console.log("Updated fileList:", updatedList);
				return updatedList;
			});

			setFileMetaData((prev) => {
				const newMetaData = newFiles.map(() => ({
					status: "pending" as UploadStatus,
					progress: 0,
				}));
				const updatedMetaData = [...prev, ...newMetaData];
				console.log("Updated fileMetaData:", updatedMetaData);
				return updatedMetaData;
			});
		},
		[validateFile, onError],
	);

	const setFileAndUpload = useCallback(
		(files: File[]) => {
			console.log("setFileAndUpload called with:", files);

			const validFiles = files.filter((file) => {
				try {
					return validateFile(file);
				} catch (error) {
					onError?.(error as Error);
					return false;
				}
			});

			console.log("Valid files:", validFiles);

			const newFiles = validFiles.map((file) => ({
				id: crypto.randomUUID(),
				file,
			}));

			console.log("New files with IDs:", newFiles);

			setFileList((prev) => {
				const updatedList = [...prev, ...newFiles];
				console.log("Updated fileList:", updatedList);
				return updatedList;
			});

			setFileMetaData((prev) => {
				const newMetaData = newFiles.map(() => ({
					status: "pending" as UploadStatus,
					progress: 0,
				}));
				const updatedMetaData = [...prev, ...newMetaData];
				console.log("Updated fileMetaData:", updatedMetaData);
				return updatedMetaData;
			});

			// Start upload with the new files immediately
			uploadFiles(newFiles);
		},
		[validateFile, onError],
	);

	const uploadFiles = useCallback(
		async (files: FileListItem[]) => {
			console.log("uploadFiles called with:", files);
			setUploading(true);
			for (let i = 0; i < files.length; i++) {
				await uploadFile(files[i], i);
			}
			if (!error) {
				onComplete?.(
					files.map((file) => ({
						id: file.id,
						mimeType: file.file.type,
						fileName: file.file.name,
					})),
				);
			}
			setUploading(false);
			resetUpload();
		},
		[error, onComplete],
	);

	const uploadFile = useCallback(
		async (file: FileListItem, index: number) => {
			console.log(`uploadFile called for file:`, file);

			abortController.current = new AbortController();
			const { id, file: currentFile } = file;
			const chunks = sliceFileIntoChunks(currentFile, chunkSize);
			const totalBytes = currentFile.size;
			let bytesUploaded = 0;
			const fileType = currentFile.type;
			const fileName = currentFile.name;

			updateFileMetaData("uploading", 0, index);

			try {
				for (let i = 0; i < chunks.length; i++) {
					if (abortController.current?.signal.aborted) {
						throw new Error("Upload cancelled");
					}

					const chunk = chunks[i];
					const formData = new FormData();
					formData.append("file", chunk);
					formData.append("id", id);
					formData.append("index", i.toString());
					formData.append("totalChunks", chunks.length.toString());
					formData.append("fileType", fileType);
					formData.append("fileName", fileName);

					const response = await fetch(uploadUrl, {
						method: "POST",
						body: formData,
						signal: abortController.current.signal,
						credentials: "include",
					});

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}

					bytesUploaded += chunk.size;
					const currentProgress = calculateUploadProgress(
						bytesUploaded,
						totalBytes,
					);
					setProgress(currentProgress);
					updateFileMetaData("uploading", currentProgress, index);
				}

				updateFileMetaData("done", 100, index);
				setProgress(0);
			} catch (error) {
				console.error("Upload error:", error);
				updateFileMetaData("error", 0, index);
				onError?.(error as Error);
			}
		},
		[uploadUrl, chunkSize, onError],
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			e.preventDefault();
			const files = e.target.files;
			if (!files?.length) return;

			try {
				const validFiles = Array.from(files).filter((file) => {
					try {
						return validateFile(file);
					} catch (error) {
						onError?.(error as Error);
						return false;
					}
				});

				setFile(validFiles);
			} catch (error) {
				onError?.(error as Error);
			}
		},
		[validateFile, onError, setFile],
	);

	const resetUpload = useCallback(() => {
		console.log("resetUpload called");
		setUploading(false);
		setFileList([]);
		setFileMetaData([]);
		setProgress(0);
		abortController.current = undefined;
		setError(null);
	}, []);

	const updateFileMetaData = useCallback(
		(status: UploadStatus, progress: number, index: number) => {
			setFileMetaData((prev) =>
				prev.map((meta, i) => (i === index ? { status, progress } : meta)),
			);
		},
		[],
	);

	const startUpload = useCallback(async () => {
		console.log("startUpload called, fileList:", fileList);
		await uploadFiles(fileList);
	}, [fileList, uploadFiles]);

	const cancelUpload = useCallback(() => {
		if (abortController.current) {
			abortController.current.abort();
			resetUpload();
		}
	}, [resetUpload]);

	return {
		handleInputChange,
		progress,
		uploading,
		fileList,
		fileMetaData,
		cancelUpload,
		startUpload,
		resetUpload,
		error,
		
		setFileAndUpload,
	};
}

export function calculateUploadProgress(
	bytesUploaded: number,
	totalBytes: number,
): number {
	if (totalBytes === 0) return 0;
	if (bytesUploaded < 0 || totalBytes < 0) {
		throw new Error("Bytes cannot be negative");
	}
	const percentage = (bytesUploaded / totalBytes) * 100;
	return Math.round(percentage * 100) / 100;
}

export function sliceFileIntoChunks(file: File, chunkSize: number): Blob[] {
	if (!file || !file.size) {
		throw new Error("Invalid file");
	}
	if (chunkSize <= 0) {
		throw new Error("Chunk size must be positive");
	}

	const fileSize = file.size;
	const chunksCount = Math.ceil(fileSize / chunkSize);
	const chunks = [];

	for (let i = 0; i < chunksCount; i++) {
		const start = i * chunkSize;
		const end = Math.min(start + chunkSize, fileSize);
		const chunk = file.slice(start, end);
		chunks.push(chunk);
	}

	return chunks;
}

