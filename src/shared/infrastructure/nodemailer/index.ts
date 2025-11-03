import { Effect, Redacted } from 'effect'
import { createTransport } from 'nodemailer'

import { ErrorTag, taggedError } from 'shared/utils/errors'

import { NodeMailerConfig } from './config'

export class NodeMailer extends Effect.Service<NodeMailer>()('NodeMailer', {
	effect: NodeMailerConfig.pipe(
		Effect.flatMap(cfg =>
			Effect.try({
				try: () =>
					createTransport(
						{
							host: cfg.NODEMAILER_HOST,
							port: cfg.NODEMAILER_PORT,
							secure: cfg.NODEMAILER_SECURE,
							auth: {
								user: cfg.NODEMAILER_AUTH_USER,
								pass: Redacted.value(cfg.NODEMAILER_AUTH_PASS),
							},
						},
						{
							from: cfg.NODEMAILER_FROM,
						},
					),
				catch: taggedError(ErrorTag.CREATE_MAIL_TRANSPORT),
			}).pipe(
				Effect.map(transport => ({
					getTransport: Effect.sync(() => transport),
					sendMail: (to: string, subject: string, html: string) =>
						Effect.tryPromise({
							try: () =>
								transport.sendMail({
									from: cfg.NODEMAILER_FROM,
									to,
									subject,
									html,
								}),
							catch: taggedError(ErrorTag.SEND_EMAIL),
						}).pipe(Effect.withSpan('send_email'), Effect.annotateSpans({ to, subject })),
				})),
			),
		),
	),
	dependencies: [NodeMailerConfig.Default],
}) {}
