import { dual } from 'effect/Function'

export const enum ErrorTag {
	SEND_EMAIL = 'SEND_EMAIL',
	SEND_TELEGRAM_MESSAGE = 'SEND_TELEGRAM_MESSAGE',
	MESSAGE_IMPL = 'MESSAGE_IMPL',
	UNHANDLED_MESSAGE = 'UNHANDLED_MESSAGE',
	XACK = 'XACK',
	XREADGROUP = 'XREADGROUP',
	XDELCONSUMER = 'XDELCONSUMER',
	JSON_PARSE = 'JSON_PARSE',
	RENDER_ETA = 'RENDER_ETA',
	LOAD_TEMPLATE = 'LOAD_TEMPLATE',
	TIMEOUT = 'TIMEOUT',
	CREATE_MAIL_TRANSPORT = 'CREATE_MAIL_TRANSPORT',
	PUREGRAM_SEND_MESSAGE = 'PUREGRAM_SEND_MESSAGE',
}

interface TaggedError extends Error {
	readonly _tag: ErrorTag
}

export const taggedError = dual<
	<A = TaggedError>(tag: ErrorTag) => (err: any) => A,
	<A = TaggedError>(err: any, tag: ErrorTag) => A
>(2, <A = TaggedError>(err: any, tag: ErrorTag): A => ((err._tag = tag), err))

