import { describe, expect, it } from "bun:test";
import { type Config, ConfigError, DEFAULT_PORT, load } from "../config.ts";

// The environment variables have upper-case names, so the tests build them from pairs.
const env = (...pairs: [string, string][]): Record<string, string> =>
	Object.fromEntries(pairs);

describe("load", () => {
	const valid: [string, Record<string, string>, Config][] = [
		["defaults", env(), { port: DEFAULT_PORT, logLevel: "info" }],
		[
			"empty values take the defaults",
			env(["PORT", ""], ["LOG_LEVEL", ""]),
			{ port: DEFAULT_PORT, logLevel: "info" },
		],
		[
			"overrides",
			env(["PORT", "9000"], ["LOG_LEVEL", "DEBUG"]),
			{ port: 9000, logLevel: "debug" },
		],
	];

	it.each(valid)("reads %s", (_name, variables, expected) => {
		expect(load(variables)).toEqual(expected);
	});

	const invalid: [string, Record<string, string>, string][] = [
		["port is not a number", env(["PORT", "abc"]), "PORT"],
		["port is out of range", env(["PORT", "70000"]), "PORT"],
		["log level is unknown", env(["LOG_LEVEL", "loud"]), "LOG_LEVEL"],
	];

	it.each(invalid)("rejects when the %s", (_name, variables, name) => {
		expect(() => load(variables)).toThrow(ConfigError);
		expect(() => load(variables)).toThrow(name);
	});
});
