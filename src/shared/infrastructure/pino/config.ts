import { Config, Effect, LogLevel } from 'effect'

export class LoggerConfig extends Effect.Service<LoggerConfig>()('LoggersConfig', {
	effect: Config.all({
		LOG_LEVEL: Config.logLevel('LOG_LEVEL').pipe(Config.withDefault(LogLevel.Info)),
	}),
}) {}
