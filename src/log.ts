import process from "node:process";
import { LOG_LEVELS, type LogLevel } from "./config.ts";

// Writes one JSON object per line, with the time, the level, the message, and the fields.

export type Fields = Record<string, unknown>;
export type Logger = Record<LogLevel, (msg: string, fields?: Fields) => void>;

export function createLogger(
	level: LogLevel,
	write: (line: string) => void = (line) => {
		process.stdout.write(line);
	},
): Logger {
	const threshold = LOG_LEVELS.indexOf(level);
	const entry =
		(entryLevel: LogLevel) =>
		(msg: string, fields: Fields = {}): void => {
			if (LOG_LEVELS.indexOf(entryLevel) < threshold) {
				return;
			}
			const time = new Date().toISOString();
			write(
				`${JSON.stringify({ time, level: entryLevel.toUpperCase(), msg, ...fields })}\n`,
			);
		};
	return {
		debug: entry("debug"),
		info: entry("info"),
		warn: entry("warn"),
		error: entry("error"),
	};
}
