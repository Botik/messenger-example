import { Schema } from 'effect'
import { ParseMode } from 'puregram'

import { MessageType } from './types'

export const MessageTelegramSchema = Schema.Struct({
	messengerType: Schema.Literal(MessageType.TELEGRAM_NODEMAILER),
	message: Schema.Struct({
		message: Schema.NonEmptyString,
		parseMode: Schema.Enums(ParseMode),
	}),
	timestamp: Schema.DateFromString,
})

export type MessageTelegramSchema = Schema.Schema.Type<typeof MessageTelegramSchema>
