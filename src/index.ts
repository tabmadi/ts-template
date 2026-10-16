import process from "node:process";
import { config } from "./config.ts";

const server = Bun.serve({
	port: config.port,
	routes: {
		"/health": {
			GET: () =>
				Response.json({
					status: "ok",
					timestamp: new Date().toISOString(),
					uptime: process.uptime(),
				}),
		},
	},
	fetch: () => new Response(null, { status: 404 }),
});

// biome-ignore lint/suspicious/noConsole: the sample has no logger, and one startup line does not need one
console.info(`Server running at http://localhost:${server.port}`);
