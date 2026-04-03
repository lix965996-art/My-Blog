'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import {
	clearAllAuthCache,
	clearPemFromCache,
	getAuthToken as getToken,
	getPemFromCache,
	hasAuth as checkAuth,
	registerPrivateKeyResolver,
	savePemToCache
} from '@/lib/auth'
import { registerUnauthorizedHandler } from '@/lib/github-client'
import { useConfigStore } from '@/app/(home)/stores/config-store'

interface AuthStore {
	isAuth: boolean
	privateKey: string | null
	setPrivateKey: (key: string) => Promise<void>
	clearAuth: () => void
	refreshAuthState: () => Promise<void>
	getAuthToken: () => Promise<string>
}

async function resolveCachedPrivateKey(currentKey: string | null): Promise<string | null> {
	const normalizedCurrentKey = currentKey?.trim()
	if (normalizedCurrentKey) {
		return normalizedCurrentKey
	}

	const cachedPrivateKey = (await getPemFromCache())?.trim()
	return cachedPrivateKey || null
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuth: false,
	privateKey: null,

	setPrivateKey: async (key: string) => {
		const normalizedKey = key.trim()
		if (!normalizedKey) {
			throw new Error('Private key is empty')
		}

		set({ isAuth: true, privateKey: normalizedKey })

		const { siteContent } = useConfigStore.getState()
		if (siteContent?.isCachePem) {
			await savePemToCache(normalizedKey)
		} else {
			clearPemFromCache()
		}
	},

	clearAuth: () => {
		clearAllAuthCache()
		set({ isAuth: false, privateKey: null })
	},

	refreshAuthState: async () => {
		const privateKey = await resolveCachedPrivateKey(get().privateKey)
		const isAuth = privateKey !== null || (await checkAuth())
		set({ isAuth, privateKey })
	},

	getAuthToken: async () => {
		const privateKey = await resolveCachedPrivateKey(get().privateKey)
		if (privateKey && privateKey !== get().privateKey) {
			set({ privateKey })
		}

		const token = await getToken()
		await get().refreshAuthState()
		return token
	}
}))

registerPrivateKeyResolver(async () => resolveCachedPrivateKey(useAuthStore.getState().privateKey))
registerUnauthorizedHandler(() => {
	useAuthStore.getState().clearAuth()
})

let authBootstrapPromise: Promise<void> | null = null

export async function bootstrapAuthStore(): Promise<void> {
	if (authBootstrapPromise) {
		await authBootstrapPromise
		return
	}

	authBootstrapPromise = useAuthStore.getState().refreshAuthState()

	try {
		await authBootstrapPromise
	} finally {
		authBootstrapPromise = null
	}
}

export function useAuthBootstrap(): void {
	useEffect(() => {
		void bootstrapAuthStore()
	}, [])
}
