import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";

interface UploadOptions {
	maxFileSize?: number;
	allowedFileTypes?: string[];
	endpoint?: string;
	fieldName?: string;
}

export function uploadFile(
	file: File,
	opts: UploadOptions = {},
): Promise<string> {
	const {
		maxFileSize = 50 * 1024 * 1024,
		allowedFileTypes = ["image/*", "video/*", "audio/*"],
		endpoint = "/api/image-upload",
		fieldName = "source",
	} = opts;

	return new Promise((resolve, reject) => {
		const uppy = new Uppy({
			autoProceed: false,
			restrictions: { maxFileSize, allowedFileTypes },
		}).use(XHRUpload, {
			endpoint,
			fieldName,
			formData: true,
			bundle: false,
		});

		const id = uppy.addFile({
			name: file.name,
			type: file.type,
			data: file,
			meta: { name: file.name, type: file.type },
		});

		if (!id) {
			uppy.destroy();
			reject(new Error("Could not add file to uploader."));
			return;
		}

		const destroySafely = () => {
			try {
				uppy.destroy();
			} catch {
				/* ignore */
			}
		};

		const onSuccess = (addedFile: unknown, response: unknown) => {
			const typedFile = addedFile as { id: string } | undefined;
			if (!typedFile || typedFile.id !== id) return;
			const typedResponse = response as {
				body?: { url?: string; image?: { url?: string } };
				uploadURL?: string;
				responseText?: string;
			};
			let url =
				typedResponse.body?.url ??
				typedResponse.body?.image?.url ??
				typedResponse.uploadURL;
			if (!url && typeof typedResponse.responseText === "string") {
				try {
					const parsed = JSON.parse(typedResponse.responseText) as {
						url?: string;
					};
					url = parsed.url;
				} catch {
					/* ignore */
				}
			}
			if (url) {
				resolve(url);
			} else {
				reject(new Error("Upload succeeded but no URL was returned."));
			}
			destroySafely();
		};

		const onError = (addedFile: unknown, err: unknown) => {
			const typedFile = addedFile as { id: string } | undefined;
			if (typedFile && typedFile.id !== id) return;
			reject(
				err instanceof Error ? err : new Error(String(err) || "Upload failed"),
			);
			destroySafely();
		};

		uppy.on("upload-success", onSuccess as never);
		uppy.on("upload-error", onError as never);
		uppy.on("error", (err: unknown) => {
			reject(err instanceof Error ? err : new Error(String(err)));
			destroySafely();
		});

		void uppy.upload().catch((err: unknown) => {
			reject(err instanceof Error ? err : new Error(String(err)));
			destroySafely();
		});
	});
}
