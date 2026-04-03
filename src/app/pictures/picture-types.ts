export interface Picture {
	id: string
	uploadedAt: string
	description?: string
	images: string[]
}

type LegacyPicture = Partial<Picture> & {
	image?: string
	images?: unknown
}

function normalizePictureImages(picture?: LegacyPicture | null): string[] {
	const imageCandidates = Array.isArray(picture?.images)
		? picture.images
		: typeof picture?.image === 'string'
			? [picture.image]
			: []

	const uniqueImages = new Set<string>()

	for (const image of imageCandidates) {
		if (typeof image !== 'string') {
			continue
		}

		const normalizedImage = image.trim()
		if (normalizedImage) {
			uniqueImages.add(normalizedImage)
		}
	}

	return Array.from(uniqueImages)
}

export function normalizePicture(picture?: LegacyPicture | null, index = 0): Picture | null {
	const images = normalizePictureImages(picture)
	if (images.length === 0) {
		return null
	}

	const normalizedId = typeof picture?.id === 'string' && picture.id.trim().length > 0 ? picture.id : `picture-${index + 1}`
	const normalizedUploadedAt = typeof picture?.uploadedAt === 'string' ? picture.uploadedAt : ''
	const normalizedDescription = typeof picture?.description === 'string' ? picture.description.trim() : ''

	return {
		id: normalizedId,
		uploadedAt: normalizedUploadedAt,
		description: normalizedDescription || undefined,
		images
	}
}

export function normalizePictureList(pictures: unknown): Picture[] {
	if (!Array.isArray(pictures)) {
		return []
	}

	return pictures
		.map((picture, index) => normalizePicture((picture ?? {}) as LegacyPicture, index))
		.filter((picture): picture is Picture => picture !== null)
}
