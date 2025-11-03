import { Config, Effect } from 'effect'

export class RedisConfig extends Effect.Service<RedisConfig>()('RedisConfig', {
	effect: Config.all({
		REDIS_URL: Config.url('DRAGONFLY_URL'),
	}),
}) {}
