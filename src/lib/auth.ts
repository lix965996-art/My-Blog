import { createInstallationToken, getInstallationId, signAppJwt } from './github-client'
import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'sonner'
import { decrypt, encrypt } from './aes256-util'

const GITHUB_TOKEN_CACHE_KEY = 'github_token'
const GITHUB_PEM_CACHE_KEY = 'p_info'

type PrivateKeyResolver = () => string | null | undefined | Promise<string | null | undefined>

let resolvePrivateKey: PrivateKeyResolver | null = null

function getTokenFromCache(): string | null {
	if (typeof sessionStorage === 'undefined') return null
	try {
		return sessionStorage.getItem(GITHUB_TOKEN_CACHE_KEY)
	} catch {
		return null
	}
}

function saveTokenToCache(token: string): void {
	if (typeof sessionStorage === 'undefined') return
	try {
		sessionStorage.setItem(GITHUB_TOKEN_CACHE_KEY, token)
	} catch (error) {
		console.error('Failed to save token to cache:', error)
	}
}

function clearTokenCache(): void {
	if (typeof sessionStorage === 'undefined') return
	try {
		sessionStorage.removeItem(GITHUB_TOKEN_CACHE_KEY)
	} catch (error) {
		console.error('Failed to clear token cache:', error)
	}
}

export async function getPemFromCache(): Promise<string | null> {
	if (typeof sessionStorage === 'undefined') return null
	try {
		const encryptedPem = sessionStorage.getItem(GITHUB_PEM_CACHE_KEY)
		if (!encryptedPem) return null
		return await decrypt(encryptedPem, GITHUB_CONFIG.ENCRYPT_KEY)
	} catch {
		return null
	}
}

export async function savePemToCache(pem: string): Promise<void> {
	if (typeof sessionStorage === 'undefined') return
	try {
		const encryptedPem = await encrypt(pem, GITHUB_CONFIG.ENCRYPT_KEY)
		sessionStorage.setItem(GITHUB_PEM_CACHE_KEY, encryptedPem)
	} catch (error) {
		console.error('Failed to save pem to cache:', error)
	}
}

export function clearPemFromCache(): void {
	if (typeof sessionStorage === 'undefined') return
	try {
		sessionStorage.removeItem(GITHUB_PEM_CACHE_KEY)
	} catch (error) {
		console.error('Failed to clear pem cache:', error)
	}
}

export function clearAllAuthCache(): void {
	clearTokenCache()
	clearPemFromCache()
}

export function registerPrivateKeyResolver(resolver: PrivateKeyResolver): void {
	resolvePrivateKey = resolver
}

export async function hasAuth(): Promise<boolean> {
	return !!getTokenFromCache() || !!(await getPemFromCache())
}

async function getPrivateKey(): Promise<string | null> {
	const privateKeyFromResolver = (await resolvePrivateKey?.())?.trim()
	if (privateKeyFromResolver) {
		return privateKeyFromResolver
	}

	const privateKeyFromCache = (await getPemFromCache())?.trim()
	return privateKeyFromCache || null
}

export async function getAuthToken(): Promise<string> {
	const cachedToken = getTokenFromCache()
	if (cachedToken) {
		toast.info('浣跨敤缂撳瓨鐨勪护鐗?..')
		return cachedToken
	}

	const privateKey = await getPrivateKey()
	if (!privateKey) {
		throw new Error('闇€瑕佸厛璁剧疆绉侀挜銆傝浣跨敤 useAuth().setPrivateKey()')
	}

	toast.info('姝ｅ湪绛惧彂 JWT...')
	const jwt = signAppJwt(GITHUB_CONFIG.APP_ID, privateKey)

	toast.info('姝ｅ湪鑾峰彇瀹夎淇℃伅...')
	const installationId = await getInstallationId(jwt, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO)

	toast.info('姝ｅ湪鍒涘缓瀹夎浠ょ墝...')
	const token = await createInstallationToken(jwt, installationId)

	saveTokenToCache(token)

	return token
}
