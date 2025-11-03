import { Cause, Effect, FiberId, HashMap, Layer, List, Logger, Match } from 'effect'
import pino from 'pino'

import { LoggerConfig } from './config'

const makeLogger = LoggerConfig.pipe(
	Effect.map(cfg =>
		pino({
			level: cfg.LOG_LEVEL.label.toLowerCase(),
			formatters: {
				level: level => ({ level }),
			},
		}),
	),
	Effect.map(pinoInstance =>
		Logger.make(log => {
			const logObj: Record<string, unknown> = {
				...Object.fromEntries(HashMap.toEntries(log.annotations)),
				spans: List.toArray(log.spans),
				fiberId: FiberId.threadName(log.fiberId),
				msg: log.message,
			}

			Cause.isEmpty(log.cause) || (logObj.cause = log.cause)
			Match.value(log.logLevel).pipe(
				Match.tag('Info', () => pinoInstance.info(logObj)),
				Match.tag('Debug', () => pinoInstance.debug(logObj)),
				Match.tag('Error', () => pinoInstance.error(logObj)),
				Match.tag('Fatal', () => pinoInstance.fatal(logObj)),
				Match.tag('Warning', () => pinoInstance.warn(logObj)),
				Match.tag('Trace', () => pinoInstance.trace(logObj)),
				Match.tag('All', () => pinoInstance.info(logObj)),
				Match.tag('None', () => {}),
				Match.exhaustive,
			)
		}),
	),
)

export const LoggerLayer = Logger.replaceEffect(Logger.defaultLogger, makeLogger).pipe(
	Layer.provide(LoggerConfig.Default),
)
