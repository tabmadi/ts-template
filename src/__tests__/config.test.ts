import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import process from "node:process";

describe("Configuration Tests", () => {
	let originalEnv: NodeJS.ProcessEnv;

	beforeEach(() => {
		// Save the original environment
		originalEnv = { ...process.env };
	});

	afterEach(() => {
		// Restore original environment
		process.env = originalEnv;

		// Clear module cache to ensure fresh config loading
		delete require.cache[require.resolve("../config.ts")];
	});

	describe("Default Configuration", () => {
		it("should use default port 3000 when no PORT env var is set", async () => {
			process.env.PORT = undefined;

			const { config } = await import("../config.ts");

			expect(config.port).toBe(3000);
		});
	});

	describe("Environment Variable Configuration", () => {
		it("should use PORT environment variable when set", async () => {
			process.env.PORT = "8080";

			const { config } = await import("../config.ts");

			expect(config.port).toBe(8080);
		});
	});

	describe("Port Validation", () => {
		it("should validate port is within valid range", () => {
			process.env.PORT = "100000";

			expect(async () => {
				await import("../config.ts");
			}).toThrow();
		});
	});
});
