export const SOCIAL_BUTTON_TYPES = [
	'github',
	'juejin',
	'email',
	'link',
	'x',
	'tg',
	'wechat',
	'facebook',
	'tiktok',
	'instagram',
	'weibo',
	'xiaohongshu',
	'zhihu',
	'bilibili',
	'qq'
] as const

export type SocialButtonType = (typeof SOCIAL_BUTTON_TYPES)[number]

interface SocialButtonLike {
	id?: string
	type: string
	label?: string
}

export function isSocialButtonType(value: string): value is SocialButtonType {
	return SOCIAL_BUTTON_TYPES.includes(value as SocialButtonType)
}

export function normalizeSocialButtonType(button: SocialButtonLike): SocialButtonType | null {
	if (isSocialButtonType(button.type)) {
		return button.type
	}

	if (button.type === 'custom') {
		if (button.id === 'qq' || button.label?.trim().toLowerCase() === 'qq') {
			return 'qq'
		}

		return 'link'
	}

	return null
}
