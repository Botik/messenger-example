import { Effect, Redacted } from 'effect'
import { undefined } from 'effect/Match'
import { Telegram } from 'puregram'
import type { SendMessageParams } from 'puregram/methods'

import { ErrorTag, taggedError } from 'shared/utils/errors'

import { TelegramConfig } from './config'

export class Puregram extends Effect.Service<Puregram>()('Puregram', {
	effect: TelegramConfig.pipe(
		Effect.map(cfg => Telegram.fromToken(Redacted.value(cfg.TELEGRAM_BOT_TOKEN))),
		Effect.map(tg => ({
			api: {
				sendMessage: (params: SendMessageParams) =>
					Effect.tryPromise({
						try: () => tg.api.sendMessage(params),
						catch: taggedError(ErrorTag.PUREGRAM_SEND_MESSAGE),
					}).pipe(
						Effect.tap(() => Effect.log('TG SendMessage')),
						Effect.tapError(e =>
							Effect.logError('TG SendMessage error').pipe(
								Effect.annotateLogs({
									message: e.message,
									stack: e.stack,
								}),
							),
						),
						Effect.annotateLogs({
							...params,
							text: undefined,
						}),
						Effect.withSpan('puregram_send_message'),
						Effect.annotateSpans({
							...params,
							text: undefined,
						}),
					),
			},
		})),
	),
	dependencies: [TelegramConfig.Default],
}) {}
