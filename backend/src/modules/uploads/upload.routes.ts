import Busboy from 'busboy'
import { Router } from 'express'
import { google } from 'googleapis'
import { env } from '../../config/env.js'
import { prisma } from '../../config/prisma.js'
import { requireAuth, type AuthRequest } from '../../middleware/auth.middleware.js'
import { getAuthedGoogleClient, syncGoogleQuota } from '../google/google.service.js'

export const uploadRouter = Router()
uploadRouter.use(requireAuth)

async function selectAccount(userId: string, sizeBytes: bigint) {
  const accounts = await prisma.connectedAccount.findMany({
    where: { userId, provider: 'google_drive', status: 'connected' },
    include: { storageAccount: true },
  })

  const stale = accounts.filter((account) => !account.storageAccount?.lastSyncedAt || account.storageAccount.lastSyncedAt.getTime() < Date.now() - 5 * 60_000)
  for (const account of stale) await syncGoogleQuota(account.id)

  const fresh = await prisma.connectedAccount.findMany({
    where: { userId, provider: 'google_drive', status: 'connected' },
    include: { storageAccount: true },
  })

  return fresh
    .filter((account) => account.storageAccount?.availableBytes !== null && account.storageAccount?.availableBytes !== undefined && account.storageAccount.availableBytes >= sizeBytes)
    .sort((a, b) => Number((b.storageAccount?.availableBytes ?? 0n) - (a.storageAccount?.availableBytes ?? 0n)))[0]
}

uploadRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const contentType = req.headers['content-type']
    if (!contentType?.includes('multipart/form-data')) return res.status(400).json({ code: 'UPLOAD_INVALID_CONTENT_TYPE', message: 'multipart/form-data required.' })

    const busboy = Busboy({ headers: req.headers, limits: { files: 1, fileSize: env.MAX_UPLOAD_BYTES } })
    const fields: { sizeBytes?: bigint; fileName?: string; mimeType?: string; folderId?: string } = {}
    let responded = false
    let fileSeen = false

    const fail = async (status: number, code: string, message: string) => {
      if (responded) return
      responded = true
      req.unpipe(busboy)
      req.resume()
      return res.status(status).json({ code, message })
    }

    busboy.on('field', (name, value) => {
      if (name === 'sizeBytes') fields.sizeBytes = BigInt(value)
      if (name === 'fileName') fields.fileName = value
      if (name === 'mimeType') fields.mimeType = value
      if (name === 'folderId') fields.folderId = value
    })

    busboy.on('file', async (_name, fileStream, info) => {
      fileSeen = true
      try {
        const sizeBytes = fields.sizeBytes
        const fileName = fields.fileName || info.filename
        const mimeType = fields.mimeType || info.mimeType || 'application/octet-stream'
        if (!sizeBytes || sizeBytes <= 0n) return fail(400, 'UPLOAD_SIZE_REQUIRED', 'sizeBytes field must be sent before file field.')
        if (sizeBytes > BigInt(env.MAX_UPLOAD_BYTES)) return fail(413, 'UPLOAD_TOO_LARGE', 'File exceeds max upload size.')

        const account = await selectAccount(req.user!.id, sizeBytes)
        if (!account) return fail(409, 'NO_ACCOUNT_WITH_ENOUGH_SPACE', 'No connected Google Drive account has enough space for this upload.')
        const folderId = fields.folderId || null
        if (folderId) await prisma.folder.findFirstOrThrow({ where: { id: folderId, userId: req.user!.id, deletedAt: null } })

        const session = await prisma.uploadSession.create({ data: { userId: req.user!.id, targetConnectedAccountId: account.id, fileName, mimeType, sizeBytes, status: 'uploading' } })
        const auth = await getAuthedGoogleClient(account)
        const drive = google.drive({ version: 'v3', auth })

        let streamedBytes = 0n
        fileStream.on('data', (chunk: Buffer) => {
          streamedBytes += BigInt(chunk.length)
        })

        const uploaded = await drive.files.create({
          requestBody: { name: fileName },
          media: { mimeType, body: fileStream },
          fields: 'id,name,mimeType,size',
        })

        if (streamedBytes !== sizeBytes) {
          await prisma.uploadSession.update({ where: { id: session.id }, data: { status: 'failed', errorMessage: 'Streamed byte count did not match declared size.' } })
          return fail(400, 'UPLOAD_SIZE_MISMATCH', 'Streamed byte count did not match declared size.')
        }

        const file = await prisma.file.create({
          data: {
            userId: req.user!.id,
            connectedAccountId: account.id,
            folderId,
            provider: 'google_drive',
            providerFileId: uploaded.data.id ?? '',
            name: uploaded.data.name ?? fileName,
            mimeType: uploaded.data.mimeType ?? mimeType,
            sizeBytes,
          },
        })
        await prisma.uploadSession.update({ where: { id: session.id }, data: { status: 'completed', completedAt: new Date() } })
        await syncGoogleQuota(account.id)

        if (!responded) {
          responded = true
          return res.status(201).json({ file: { ...file, sizeBytes: file.sizeBytes.toString() } })
        }
      } catch (error) {
        return next(error)
      }
    })

    busboy.on('finish', () => {
      if (!responded && !fileSeen) return fail(400, 'UPLOAD_FILE_REQUIRED', 'file field required.')
    })

    req.pipe(busboy)
  } catch (error) {
    return next(error)
  }
})
