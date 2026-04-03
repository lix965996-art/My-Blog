export interface Project {
	name: string
	year: number
	description: string
	image: string
	url: string
	tags: string[]
	github?: string
	npm?: string
}

export function normalizeProject(project?: Partial<Project> | null): Project {
	return {
		name: typeof project?.name === 'string' ? project.name : '',
		year: typeof project?.year === 'number' && Number.isFinite(project.year) ? project.year : new Date().getFullYear(),
		description: typeof project?.description === 'string' ? project.description : '',
		image: typeof project?.image === 'string' ? project.image : '',
		url: typeof project?.url === 'string' ? project.url : '',
		tags: Array.isArray(project?.tags)
			? project.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).map(tag => tag.trim())
			: [],
		github: typeof project?.github === 'string' && project.github.trim().length > 0 ? project.github : undefined,
		npm: typeof project?.npm === 'string' && project.npm.trim().length > 0 ? project.npm : undefined
	}
}

export function normalizeProjectList(projects: unknown): Project[] {
	if (!Array.isArray(projects)) {
		return []
	}

	return projects.map(project => normalizeProject((project ?? {}) as Partial<Project>))
}
