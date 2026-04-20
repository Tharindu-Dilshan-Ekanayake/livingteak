import { v2 as cloudinary } from 'cloudinary'

let isConfigured = false

function ensureConfigured() {
  if (isConfigured) return

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary environment variables')
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  isConfigured = true
}

export async function uploadImageBufferToCloudinary(
  buffer: Buffer,
  {
    folder,
    publicId,
  }: {
    folder: string
    publicId?: string
  }
) {
  ensureConfigured()

  return await new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }
        if (!result?.secure_url) {
          reject(new Error('Cloudinary upload failed'))
          return
        }
        resolve(result.secure_url)
      }
    )

    uploadStream.end(buffer)
  })
}
