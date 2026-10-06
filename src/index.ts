import { config } from "./config.js";

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

// biome-ignore lint/suspicious/noConsole: it's just an example we don't want to add a logger for it
console.info(`Server running at http://localhost:${server.port}`);
