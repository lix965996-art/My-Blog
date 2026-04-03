export interface Share {
	name: string
	logo: string
	url: string
	description: string
	tags: string[]
	stars: number
}

export function normalizeShare(share?: Partial<Share> | null): Share {
	return {
		name: typeof share?.name === 'string' ? share.name : '',
		logo: typeof share?.logo === 'string' ? share.logo : '',
		url: typeof share?.url === 'string' ? share.url : '',
		description: typeof share?.description === 'string' ? share.description : '',
		tags: Array.isArray(share?.tags)
			? share.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).map(tag => tag.trim())
			: [],
		stars: typeof share?.stars === 'number' && Number.isFinite(share.stars) ? Math.min(5, Math.max(1, Math.round(share.stars))) : 3
	}
}

export function normalizeShareList(shares: unknown): Share[] {
	if (!Array.isArray(shares)) {
		return []
	}

	return shares.map(share => normalizeShare((share ?? {}) as Partial<Share>))
}
