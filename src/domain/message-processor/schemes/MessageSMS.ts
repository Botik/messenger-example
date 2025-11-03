import { Schema } from 'effect'

import { MessageType } from './types'

export const MessageSMSSchema = Schema.Struct({
	messengerType: Schema.Literal(MessageType.SMS_NODEMAILER),
	message: Schema.Struct({}),
	timestamp: Schema.DateFromString,
})
