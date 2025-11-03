import { Duration, Effect, Runtime, Schedule, Stream } from 'effect'
import IORedis from 'ioredis'

import { ErrorTag, taggedError } from 'shared/utils/errors'

import { RedisConfig } from './config'

export type { StreamRecord, XreadgroupParams } from './types'

export class Redis extends Effect.Service<Redis>()('Redis', {
	effect: RedisConfig.pipe(
		Effect.tap(Effect.log),
		Effect.flatMap(cfg =>
			Effect.runtime().pipe(
				Effect.flatMap(runtime =>
					Effect.acquireRelease(
						Effect.try({
							try: () => new IORedis(cfg.REDIS_URL.toString()),
							catch: error => Effect.logError(error).pipe(Effect.andThen(Effect.fail(error))),
						}).pipe(
							Effect.tap(client => {
								client.on('error', err =>
									Effect.logError('Redis client error').pipe(
										Effect.annotateLogs({
											error: err.message,
											stack: err.stack,
										}),
										Runtime.runFork(runtime),
									),
								)
								client.on('connect', () => {
									Runtime.runFork(runtime, Effect.logInfo('Redis client connected'))
								})
								client.on('reconnecting', () => Runtime.runFork(runtime)(Effect.logWarning('Redis reconnecting...')))
							}),
						),
						client => Effect.promise(() => client.quit()),
					),
				),
			),
		),
		Effect.map(client => ({
			getIORedis: Effect.sync(() => client),
			xack: (stream: string, group: string, id: string) =>
				Effect.tryPromise({
					try: () => client.xack(stream, group, id),
					catch: taggedError(ErrorTag.XACK),
				}).pipe(
					Effect.withSpan('redis_xnack'),
					Effect.annotateSpans({
						stream,
						group,
						id,
					}),
				),
			xreadgroup: <T>(params: XreadgroupParams) =>
				Effect.sync(() => {
					const args = ['GROUP', params.group, params.consumer]

					params.count && args.push('COUNT', '' + params.count)
					params.block && args.push('BLOCK', '' + params.block)
					params.noAck && args.push('NOACK')
					args.push('STREAMS', ...params.streams)
					args.push(...params.ids)

					return args as Parameters<typeof client.xreadgroup>
				}).pipe(
					Stream.flatMap(args =>
						Effect.tryPromise({
							try: () => client.xreadgroup(...args) as Promise<[string, T[] | null][] | null>,
							catch: taggedError(ErrorTag.XREADGROUP),
						}).pipe(
							Effect.tapError(e =>
								Effect.logError('Redis xreadgroup error').pipe(
									Effect.annotateLogs({
										message: e.message,
										stack: e.stack,
									}),
								),
							),
							Effect.retry(
								Schedule.union(Schedule.fibonacci(Duration.millis(100)), Schedule.spaced(Duration.seconds(10))),
							),
							Effect.withSpan('redis_xreadgroup'),
							Effect.annotateSpans({
								steam: params.stream,
								group: params.group,
								consumer: params.consumer,
							}),
							Stream.repeatEffect,
							Stream.ensuring(
								Effect.logDebug('Ensuring stream').pipe(
									Effect.annotateLogs({
										steam: params.stream,
										group: params.group,
										consumer: params.consumer,
									}),
									Effect.flatMap(() =>
										Effect.tryPromise({
											try: () => client.xgroup('DELCONSUMER', params.stream, params.group, params.consumer),
											catch: taggedError(ErrorTag.XDELCONSUMER),
										}),
									),
									Effect.catchAll(
										e => (
											Effect.logFatal('Error del consumer ' + params.consumer).pipe(Effect.annotateLogs(e as any)),
											Effect.void
										),
									),
									Effect.ignore,
								),
							),
						),
					),
				),
		})),
	),
	dependencies: [RedisConfig.Default],
}) {}
