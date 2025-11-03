import { Schema } from 'effect'

import { templates } from 'shared/assets/templates'

import { MessageType } from './types'

export const MessageEmailSchema = Schema.Struct({
	messengerType: Schema.Literal(MessageType.EMAIL_NODEMAILER),
	message: Schema.Struct({
		from: Schema.optional(Schema.String),
		to: Schema.NonEmptyString,
		subject: Schema.NonEmptyString.pipe(Schema.minLength(1), Schema.maxLength(255)),
		template: Schema.Literal(...Object.keys(templates)),
		data: Schema.Object,
	}),
	timestamp: Schema.DateFromString,
})

export type MessageEmailSchema = typeof MessageEmailSchema.Type
