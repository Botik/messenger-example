import { Schema } from 'effect'

import { MessageEmailSchema } from './MessageEmail'
import { MessageSMSSchema } from './MessageSMS'
import { MessageTelegramSchema } from './MessageTelegram'

export const MessageDataSchema = Schema.Union(MessageEmailSchema, MessageSMSSchema, MessageTelegramSchema)

export type MessageDataSchema = Schema.Schema.Type<typeof MessageDataSchema>

export const decodeMessageDataSchema = Schema.decodeUnknown(MessageDataSchema)
