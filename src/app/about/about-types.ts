export interface AboutData {
	title: string
	description: string
	content: string
}

export function normalizeAboutData(data?: Partial<AboutData> | null): AboutData {
	return {
		title: typeof data?.title === 'string' ? data.title : '',
		description: typeof data?.description === 'string' ? data.description : '',
		content: typeof data?.content === 'string' ? data.content : ''
	}
}
