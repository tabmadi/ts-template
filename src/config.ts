import process from "node:process";

// Reads the configuration from the environment and checks it. No other module reads the environment.

export const DEFAULT_PORT = 8080;
const MAX_PORT = 65_535;

export const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface Config {
	port: number;
	logLevel: LogLevel;
}

// A configuration value that the app cannot start with.
export class ConfigError extends Error {
	constructor(name: string, rule: string, value: string) {
		super(`invalid configuration: ${name} must be ${rule}, not "${value}"`);
		this.name = "ConfigError";
	}
}

function isLogLevel(value: string): value is LogLevel {
	return (LOG_LEVELS as readonly string[]).includes(value);
}

// Reads the configuration from env. An unset or empty variable takes its default.
export function load(env: Record<string, string | undefined>): Config {
	let port = DEFAULT_PORT;
	const portValue = env.PORT ?? "";
	if (portValue !== "") {
		port = /^[0-9]+$/.test(portValue) ? Number(portValue) : 0;
		if (port < 1 || port > MAX_PORT) {
			throw new ConfigError(
				"PORT",
				`a number from 1 to ${MAX_PORT}`,
				portValue,
			);
		}
	}

	let logLevel: LogLevel = "info";
	const levelValue = env.LOG_LEVEL ?? "";
	if (levelValue !== "") {
		const level = levelValue.toLowerCase();
		if (!isLogLevel(level)) {
			throw new ConfigError(
				"LOG_LEVEL",
				"debug, info, warn, or error",
				levelValue,
			);
		}
		logLevel = level;
	}

	return { port, logLevel };
}

// Reads the configuration from the environment of the process.
export function fromEnv(): Config {
	return load(process.env);
}
