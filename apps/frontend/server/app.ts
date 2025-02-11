import { createRequestHandler } from "react-router";
import { createMiddleware } from "hono/factory";
import { type Serve } from "bun";

const rr7 = createRequestHandler(
	//@ts-ignore
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	port: 3000,
	async fetch(request) {
		let { pathname } = new URL(request.url);
		let file = Bun.file(`build/client${pathname}`);
		if (await file.exists()) return new Response(file);
		// Only if a file doesn't exists we send the request to the Remix request handler
		return rr7(request);
	},
} satisfies Serve;

export const frontend = createMiddleware(async (c, next) => {
	let { pathname } = new URL(c.req.raw.url);
	let file = Bun.file(`build/client${pathname}`);
	if (await file.exists()) return new Response(file);
	// Only if a file doesn't exists we send the request to the Remix request handler
	const res = await rr7(c.req.raw);
	if (!res.ok) {
		next();
	}
	return res;
});
