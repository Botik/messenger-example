import { Config, Effect, Schema } from 'effect'

export class TelegramConfig extends Effect.Service<TelegramConfig>()('TelegramConfig', {
	effect: Config.all({
		TELEGRAM_BOT_TOKEN: Schema.Config('TELEGRAM_BOT_TOKEN', Schema.String).pipe(Config.redacted<string>),
	}),
}) {}
