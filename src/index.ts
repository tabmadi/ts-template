import process from "node:process";
import { type Config, ConfigError, fromEnv } from "./config.ts";
import { createLogger } from "./log.ts";
import { startServer } from "./server.ts";

// The entry point. It reads the configuration, starts the server, and stops it on a signal.

function readConfig(): Config {
	try {
		return fromEnv();
	} catch (error) {
		if (error instanceof ConfigError) {
			process.stderr.write(`${error.message}\n`);
			process.exit(1);
		}
		throw error;
	}
}

const config = readConfig();
const logger = createLogger(config.logLevel);
const server = await startServer(config.port, logger);
logger.info("listening", { port: server.port });

for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.on(signal, async () => {
		await server.stop();
		logger.info("stopped");
		process.exit(0);
	});
}
