import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { Logger } from "./log.ts";

// The HTTP routes of the app: GET /health, and 404 to every other path.

export interface Server {
	port: number;
	stop(): Promise<void>;
}

export async function startServer(
	port: number,
	logger: Logger,
): Promise<Server> {
	const server = createServer((request, response) => {
		const path = new URL(request.url ?? "/", "http://localhost").pathname;
		if (request.method === "GET" && path === "/health") {
			response.writeHead(200, { "content-type": "application/json" });
			response.end(JSON.stringify({ status: "ok" }));
		} else {
			response.writeHead(404);
			response.end();
		}
		logger.debug("request", {
			method: request.method,
			path,
			status: response.statusCode,
		});
	});
	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, resolve);
	});
	return {
		port: (server.address() as AddressInfo).port,
		// The server stops accepting connections, and the open requests finish.
		stop: () =>
			new Promise<void>((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve()));
				server.closeIdleConnections();
			}),
	};
}
