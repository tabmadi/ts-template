import type { Logger } from "./log.ts";

// The HTTP routes of the app: GET /health, and 404 to every other path.

export function startServer(
	port: number,
	logger: Logger,
): Bun.Server<undefined> {
	return Bun.serve({
		port,
		fetch(request) {
			const path = new URL(request.url).pathname;
			const response =
				request.method === "GET" && path === "/health"
					? Response.json({ status: "ok" })
					: new Response(null, { status: 404 });
			logger.debug("request", {
				method: request.method,
				path,
				status: response.status,
			});
			return response;
		},
	});
}
