import { Hono } from "hono";
import type { Variables } from ".";

export const upload = new Hono<{ Variables: Variables }>()
	.post("/", async (c) => {
		try {
			const form = await c.req.formData();
			const file = form.get("file");
			const id = form.get("id")?.toString();
			const fileType = form.get("fileType")?.toString();
			const fileName = form.get("fileName")?.toString();

			if (!id) {
				return c.json({ error: "Missing id" }, 400);
			}

			if (!file || !(file instanceof File) || !fileType || !fileName) {
				return c.json({ error: "Missing or invalid file upload" }, 400);
			}
			console.log("File", file);
			console.log(fileType);
			console.log("name", fileName);

			const maxSize = 10 * 1024 * 1024; // 10MB limit

			if (file.size > maxSize) {
				return c.json({ error: "File too large. Max size is 10MB" }, 400);
			}

			// Create filename with original extension
			const filename = `${id}`;
			const originalExt = fileName.split(".").pop() || "";
			const bunfile = Bun.file(`uploads/${filename}.${originalExt}`, {
				type: fileType,
			});

			if (await bunfile.exists()) {
				const writer = bunfile.writer();
				writer.write(await file.arrayBuffer());
				await writer.end();
			} else {
				// Single write operation
				await Bun.write(bunfile, await file.arrayBuffer());
			}

			return c.json({
				message: "File uploaded successfully",
				filename,
				originalName: file.name,
				size: file.size,
				type: file.type,
			});
		} catch (error) {
			console.error("Upload error:", error);
			return c.json({ error: "Failed to upload file" }, 500);
		}
	})
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		
		const filename = `${id}`;
		const bunfile = Bun.file(`uploads/${filename}`);

		if (!(await bunfile.exists())) {
			return c.json({ error: "File not found" }, 404);
		}

		
		return new Response(bunfile.stream(), {
			headers: {
				"Content-Type": bunfile.type,
			},
		});
	});
