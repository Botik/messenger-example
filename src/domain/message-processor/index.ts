import { Effect, Match, Stream } from 'effect'

import { Eta } from 'shared/infrastructure/eta'
import { Redis } from 'shared/infrastructure/ioredis'
import { StreamRecord } from 'shared/infrastructure/ioredis/types'
import { NodeMailer } from 'shared/infrastructure/nodemailer'
import { Puregram } from 'shared/infrastructure/puregram'
import { ErrorTag, taggedError } from 'shared/utils/errors'

import { MessageProcessorConfig } from './config'
import { MessageDataSchema, decodeMessageDataSchema } from './schemes/MessageData'
import { MessageEmailSchema } from './schemes/MessageEmail'
import { MessageTelegramSchema } from './schemes/MessageTelegram'
import { MessageType } from './schemes/types'

export class MessageProcessor extends Effect.Service<MessageProcessor>()('MessageProcessor', {
	effect: Effect.all([Eta, MessageProcessorConfig, NodeMailer, Puregram, Redis]).pipe(
		Effect.map(deps => ({
			start: () =>
				Effect.Do.pipe(
					Effect.bind('eta', () => Effect.succeed(deps[0])),
					Effect.bind('mailer', () => Effect.succeed(deps[2])),
					Effect.bind('telegram', () => Effect.succeed(deps[3])),
					Effect.bind('redis', () => Effect.succeed(deps[4])),
					Effect.bind('group', () => Effect.succeed(deps[1].MESSENGER_GROUP)),
					Effect.bind('stream', () => Effect.succeed(deps[1].MESSENGER_STREAM)),
					Effect.bind('chatId', () => Effect.succeed(deps[1].LOG_CHAT_ID)),
					Effect.bind('consumer', () => Effect.succeed(Bun.randomUUIDv7())),
					Effect.bind('emailMessageProcess', ({ eta, mailer }) =>
						Effect.succeed((msg: MessageEmailSchema) =>
							eta
								.renderTemplate(msg.message.data, msg.message.template as any)
								.pipe(Effect.flatMap(html => mailer.sendMail(msg.message.to, msg.message.subject, html))),
						),
					),
					Effect.bind('telegramMessageProcess', ({ telegram, chatId }) =>
						Effect.succeed((msg: MessageTelegramSchema) =>
							telegram.api.sendMessage({
								chat_id: chatId,
								text: msg.message.message,
								parse_mode: msg.message.parseMode,
							}),
						),
					),
					Effect.bind('smsMessageProcess', () =>
						Effect.succeed(() =>
							Effect.fail(taggedError(new Error('SMS message handle not implemented'), ErrorTag.MESSAGE_IMPL)),
						),
					),
					Effect.bind(
						'messageProcess',
						({ emailMessageProcess, group, redis, smsMessageProcess, stream, telegramMessageProcess }) =>
							Effect.succeed(({ record, msg }: { record: StreamRecord; msg: MessageDataSchema }) =>
								Match.value(msg)
									.pipe(
										Match.when({ messengerType: MessageType.TELEGRAM_NODEMAILER }, telegramMessageProcess),
										Match.when({ messengerType: MessageType.SMS_NODEMAILER }, smsMessageProcess),
										Match.when({ messengerType: MessageType.EMAIL_NODEMAILER }, emailMessageProcess),
										Match.orElse(() =>
											Effect.fail(taggedError(new Error('Unhandled message'), ErrorTag.UNHANDLED_MESSAGE)),
										),
									)
									.pipe(
										Effect.flatMap(() => redis.xack(stream, group, record[0])),
										Effect.withSpan('process_message'),
										Effect.annotateSpans({
											record: record[0],
											messageType: msg.messengerType,
										}),
									),
							),
					),
					Effect.flatMap(({ consumer, group, messageProcess, redis, stream }) =>
						redis
							.xreadgroup<StreamRecord>({
								group,
								consumer,
								count: 1,
								block: 1e3,
								stream,
								streams: [stream],
								ids: ['>'],
							})
							.pipe(
								Stream.filter(Boolean),
								Stream.tap(stream => Effect.logDebug('Take ' + (0 | (stream?.[0][1]?.length as number)) + ' messages')),
								Stream.mapEffect(stream =>
									Stream.fromIterable(stream?.[0][1] || []).pipe(
										Stream.mapEffect(record =>
											Effect.try({
												try: () => JSON.parse(record[1][1]),
												catch: taggedError(ErrorTag.JSON_PARSE),
											}).pipe(Effect.map(msg => ({ record, msg }))),
										),
										Stream.mapEffect(({ record, msg }) =>
											decodeMessageDataSchema(msg).pipe(
												Effect.map(msg => ({
													record,
													msg,
												})),
											),
										),
										Stream.tap(obj =>
											Effect.log('Processing message').pipe(
												Effect.annotateLogs({
													type: obj.msg.messengerType,
												}),
											),
										),
										Stream.mapEffect(messageProcess),
										Stream.catchAll((e: any) =>
											Effect.logError('Stream processing error').pipe(
												Effect.annotateLogs({
													msg: e.message,
													stack: e.stack,
												}),
											),
										),
										Stream.runDrain,
									),
								),
								Stream.runDrain,
							),
					),
				),
		})),
	),
	dependencies: [Eta.Default, NodeMailer.Default, Puregram.Default, Redis.Default, MessageProcessorConfig.Default],
}) {}
