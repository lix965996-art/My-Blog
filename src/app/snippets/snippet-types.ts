export function normalizeSnippets(snippets: unknown): string[] {
	if (!Array.isArray(snippets)) {
		return []
	}

	return snippets
		.filter((item): item is string => typeof item === 'string')
		.map(item => item.trim())
		.filter(Boolean)
}
