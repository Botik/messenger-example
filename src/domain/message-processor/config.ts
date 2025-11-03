import { Config, Effect, Schema } from 'effect'

export class MessageProcessorConfig extends Effect.Service<MessageProcessorConfig>()('MessageProcessorConfig', {
	effect: Config.all({
		LOG_CHAT_ID: Config.number('LOG_CHAT_ID'),
		MESSENGER_GROUP: Config.string('MESSENGER_GROUP'),
		MESSENGER_STREAM: Config.string('MESSENGER_STREAM'),
	}),
}) {}
