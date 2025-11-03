import type Ajv from 'ajv'

import messageDataSchema from './MessageDataSchema.json' with { type: 'json' }
import messageEmailSchema from './MessageEmail.json' with { type: 'json' }
import messageSMSSchema from './MessageSMS.json' with { type: 'json' }
import messageTelegramSchema from './MessageTelegram.json' with { type: 'json' }

export const loadSchenes = (ajv: Ajv) =>
	ajv.addSchema([messageEmailSchema, messageSMSSchema, messageDataSchema, messageTelegramSchema])
