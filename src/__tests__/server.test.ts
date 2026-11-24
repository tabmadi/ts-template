import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createLogger } from "../log.ts";
import { type Server, startServer } from "../server.ts";

describe("routes", () => {
	let server: Server;
	let base: string;

	beforeAll(async () => {
		server = await startServer(
			0,
			createLogger("error", () => undefined),
		);
		base = `http://127.0.0.1:${server.port}`;
	});

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
