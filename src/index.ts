import { BunRuntime } from '@effect/platform-bun'
import { Effect, Layer, LogLevel, Logger } from 'effect'

import { AppLive } from 'app'

AppLive.pipe(
	Layer.launch,
	Effect.scoped,
	Logger.withMinimumLogLevel(LogLevel.Trace),
	BunRuntime.runMain({ disablePrettyLogger: true }),
)
