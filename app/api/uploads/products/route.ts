import { NextResponse } from 'next/server'
import { uploadImageBufferToCloudinary } from '@/lib/cloudinary'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const MAX_IMAGES = 3
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const files = formData.getAll('images')

  const imageFiles = files.filter((value): value is File => value instanceof File)

  if (imageFiles.length === 0) {
    return NextResponse.json({ error: 'At least one image is required' }, { status: 400 })
  }

  if (imageFiles.length > MAX_IMAGES) {
    return NextResponse.json(
      { error: `You can upload up to ${MAX_IMAGES} images` },
      { status: 400 }
    )
  }

  for (const file of imageFiles) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Only image files (jpeg, png, gif, webp) are allowed' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Each image must be 5MB or smaller' },
        { status: 400 }
      )
    }
  }

  try {
    const urls = await Promise.all(
      imageFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        return await uploadImageBufferToCloudinary(buffer, { folder: 'products' })
      })
    )

    return NextResponse.json({ urls }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
