import { Config, Effect, Schema } from 'effect'

export class NodeMailerConfig extends Effect.Service<NodeMailerConfig>()('NodeMailerConfig', {
	effect: Config.all({
		NODEMAILER_FROM: Schema.Config('NODEMAILER_FROM', Schema.String),
		NODEMAILER_HOST: Schema.Config('NODEMAILER_HOST', Schema.String),
		NODEMAILER_PORT: Config.number('NODEMAILER_PORT').pipe(Config.withDefault(587)),
		NODEMAILER_SECURE: Config.boolean('NODEMAILER_SECURE').pipe(Config.withDefault(true)),
		NODEMAILER_AUTH_USER: Schema.Config('NODEMAILER_AUTH_USER', Schema.String),
		NODEMAILER_AUTH_PASS: Schema.Config('NODEMAILER_AUTH_PASS', Schema.String).pipe(Config.redacted),
	}),
}) {}
