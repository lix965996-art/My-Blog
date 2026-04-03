'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import initialList from './list.json'
import { RandomLayout } from './components/random-layout'
import UploadDialog from './components/upload-dialog'
import { pushPictures } from './services/push-pictures'
import { normalizePictureList, type Picture } from './picture-types'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import type { ImageItem } from '../projects/components/image-upload-dialog'

export default function Page() {
	const normalizedInitialPictures = normalizePictureList(initialList)
	const [pictures, setPictures] = useState<Picture[]>(normalizedInitialPictures)
	const [originalPictures, setOriginalPictures] = useState<Picture[]>(normalizedInitialPictures)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
	const [imageItems, setImageItems] = useState<Map<string, ImageItem>>(new Map())
	const keyInputRef = useRef<HTMLInputElement>(null)
	const router = useRouter()

	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUploadSubmit = ({ images, description }: { images: ImageItem[]; description: string }) => {
		if (images.length === 0) {
			toast.error('请至少选择一张图片')
			return
		}

		const pictureId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
		const imageUrls = images.map(imageItem => (imageItem.type === 'url' ? imageItem.url : imageItem.previewUrl))
		const newPicture: Picture = {
			id: pictureId,
			uploadedAt: new Date().toISOString(),
			description: description.trim() || undefined,
			images: imageUrls
		}

		const nextImageItems = new Map(imageItems)
		images.forEach((imageItem, index) => {
			if (imageItem.type === 'file') {
				nextImageItems.set(`${pictureId}::${index}`, imageItem)
			}
		})

		setPictures(prev => [...prev, newPicture])
		setImageItems(nextImageItems)
		setIsUploadDialogOpen(false)
	}

	const handleDeleteSingleImage = (pictureId: string, imageIndex: number | 'single') => {
		setPictures(prev =>
			prev
				.map(picture => {
					if (picture.id !== pictureId) {
						return picture
					}

					if (imageIndex === 'single') {
						return null
					}

					const images = picture.images.filter((_, idx) => idx !== imageIndex)
					if (images.length === 0) {
						return null
					}

					return {
						...picture,
						images
					}
				})
				.filter((picture): picture is Picture => picture !== null)
		)

		setImageItems(prev => {
			const next = new Map(prev)
			if (imageIndex === 'single') {
				for (const key of next.keys()) {
					if (key.startsWith(`${pictureId}::`)) {
						next.delete(key)
					}
				}
				return next
			}

			next.delete(`${pictureId}::${imageIndex}`)

			const keysToUpdate: Array<{ oldKey: string; newKey: string }> = []
			for (const key of next.keys()) {
				if (!key.startsWith(`${pictureId}::`)) {
					continue
				}

				const [, indexStr] = key.split('::')
				const oldIndex = Number(indexStr)
				if (!Number.isNaN(oldIndex) && oldIndex > imageIndex) {
					keysToUpdate.push({
						oldKey: key,
						newKey: `${pictureId}::${oldIndex - 1}`
					})
				}
			}

			for (const { oldKey, newKey } of keysToUpdate) {
				const value = next.get(oldKey)
				if (value) {
					next.set(newKey, value)
					next.delete(oldKey)
				}
			}

			return next
		})
	}

	const handleDeleteGroup = (picture: Picture) => {
		if (!confirm('确定要删除这一组图片吗？')) {
			return
		}

		setPictures(prev => prev.filter(item => item.id !== picture.id))
		setImageItems(prev => {
			const next = new Map(prev)
			for (const key of next.keys()) {
				if (key.startsWith(`${picture.id}::`)) {
					next.delete(key)
				}
			}
			return next
		})
	}

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			await setPrivateKey(text)
			await handleSave()
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
			return
		}

		void handleSave()
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushPictures({
				pictures,
				imageItems
			})

			setOriginalPictures(pictures)
			setImageItems(new Map())
			setIsEditMode(false)
			toast.success('保存成功')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setPictures(originalPictures)
		setImageItems(new Map())
		setIsEditMode(false)
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isEditMode && (event.ctrlKey || event.metaKey) && event.key === ',') {
				event.preventDefault()
				setIsEditMode(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async event => {
					const file = event.target.files?.[0]
					if (file) await handleChoosePrivateKey(file)
					if (event.currentTarget) event.currentTarget.value = ''
				}}
			/>

			<RandomLayout pictures={pictures} isEditMode={isEditMode} onDeleteSingle={handleDeleteSingleImage} onDeleteGroup={handleDeleteGroup} />

			{pictures.length === 0 && (
				<div className='text-secondary flex min-h-screen items-center justify-center px-6 text-center text-sm'>
					还没有上传图片，点击右上角“编辑”后即可开始上传。
				</div>
			)}

			<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='absolute top-4 right-6 flex gap-3 max-sm:hidden'>
				{isEditMode ? (
					<>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => router.push('/image-toolbox')}
							className='rounded-xl border bg-blue-50 px-4 py-2 text-sm text-blue-700'>
							压缩工具
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsUploadDialogOpen(true)}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							上传
						</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveClick} disabled={isSaving} className='brand-btn px-6'>
							{isSaving ? '保存中...' : buttonText}
						</motion.button>
					</>
				) : (
					!hideEditButton && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsEditMode(true)}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>
							编辑
						</motion.button>
					)
				)}
			</motion.div>

			{isUploadDialogOpen && <UploadDialog onClose={() => setIsUploadDialogOpen(false)} onSubmit={handleUploadSubmit} />}
		</>
	)
}
