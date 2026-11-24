import { defineConfig } from "vitest/config";

// Two workers keep the memory of the suite small, per ADR-0110.
export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
		maxWorkers: 2,
	},
});
