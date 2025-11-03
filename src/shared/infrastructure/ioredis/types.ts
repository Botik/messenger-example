export type StreamRecord = [eventid: string, [type: 'event', data: jsonStr]]

export type XreadgroupParams = {
	group: string
	consumer: string
	stream: string
	count?: number
	block?: number
	noAck?: boolean
	streams: string[]
	ids: string[]
}
