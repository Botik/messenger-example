import { MessageProcessor } from 'domain/message-processor'
import { Effect, Layer } from 'effect'

import { LoggerLayer } from 'shared/infrastructure/pino'

class App extends Effect.Service<App>()('App', {
	effect: MessageProcessor.pipe(
		Effect.flatMap(mp => mp.start()),
		Effect.fork,
		Effect.map(() => ({})),
	),
	dependencies: [MessageProcessor.Default],
}) {}

export const AppLive = App.Default.pipe(Layer.provide(LoggerLayer))
