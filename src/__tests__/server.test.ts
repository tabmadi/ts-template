import { afterAll, describe, expect, it } from "bun:test";
import { createLogger } from "../log.ts";
import { startServer } from "../server.ts";

describe("routes", () => {
	const server = startServer(
		0,
		createLogger("error", () => undefined),
	);
	const base = `http://127.0.0.1:${server.port}`;

	afterAll(async () => {
		await server.stop();
	});

	it("answers 200 on GET /health", async () => {
		const response = await fetch(`${base}/health`);
		expect(response.status).toBe(200);
		expect(await response.text()).toBe('{"status":"ok"}');
	});

	it.each(["/missing", "/"])("answers 404 on %s", async (path) => {
		const response = await fetch(`${base}${path}`);
		expect(response.status).toBe(404);
	});
});
