export type BloggerStatus = 'recent' | 'disconnected'

export interface Blogger {
	name: string
	avatar: string
	url: string
	description: string
	stars: number
	status?: BloggerStatus
}

export function normalizeBlogger(blogger?: Partial<Blogger> | null): Blogger {
	const status = blogger?.status === 'recent' || blogger?.status === 'disconnected' ? blogger.status : 'recent'

	return {
		name: typeof blogger?.name === 'string' ? blogger.name : '',
		avatar: typeof blogger?.avatar === 'string' ? blogger.avatar : '',
		url: typeof blogger?.url === 'string' ? blogger.url : '',
		description: typeof blogger?.description === 'string' ? blogger.description : '',
		stars: typeof blogger?.stars === 'number' && Number.isFinite(blogger.stars) ? Math.min(5, Math.max(1, Math.round(blogger.stars))) : 3,
		status
	}
}

export function normalizeBloggerList(bloggers: unknown): Blogger[] {
	if (!Array.isArray(bloggers)) {
		return []
	}

	return bloggers.map(blogger => normalizeBlogger((blogger ?? {}) as Partial<Blogger>))
}
