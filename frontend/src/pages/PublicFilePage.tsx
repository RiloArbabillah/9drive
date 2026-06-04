import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, FileArchive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { API_URL, apiFetch, formatBytes, formatDate } from '@/lib/api'

type PublicFile = { name: string; mimeType: string; sizeBytes: string; createdAt: string }

function previewKind(mimeType: string) {
  if (mimeType.startsWith('image/') || mimeType === 'application/vnd.google-apps.drawing') return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf' || mimeType === 'application/vnd.google-apps.document' || mimeType === 'application/vnd.google-apps.presentation') return 'document'
  return null
}

export function PublicFilePage() {
  const { token } = useParams()
  const [file, setFile] = useState<PublicFile | null>(null)
  const previewUrl = `${API_URL}/public/files/${token}/preview`
  const downloadUrl = `${API_URL}/public/files/${token}/download`
  const kind = file ? previewKind(file.mimeType) : null

  useEffect(() => {
    apiFetch<{ file: PublicFile }>(`/public/files/${token}`, { skipAuth: true }).then((data) => setFile(data.file)).catch(() => setFile(null))
  }, [token])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <Card className="w-full max-w-2xl p-6">
        {file ? <>
          <div className="flex items-start gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white"><FileArchive className="h-7 w-7" /></div><div className="min-w-0 flex-1"><h1 className="truncate text-2xl font-extrabold">{file.name}</h1><p className="mt-1 text-sm text-slate-500">{formatBytes(file.sizeBytes)} • Uploaded {formatDate(file.createdAt)}</p></div></div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {kind === 'image' ? <img src={previewUrl} alt={file.name} className="max-h-[60vh] w-full object-contain" /> : null}
            {kind === 'video' ? <video src={previewUrl} controls className="max-h-[60vh] w-full" /> : null}
            {kind === 'document' ? <iframe src={previewUrl} title={file.name} className="h-[60vh] w-full" /> : null}
            {!kind ? <div className="p-8 text-center text-sm text-slate-500">Preview not available for this file type.</div> : null}
          </div>
          <a href={downloadUrl} download><Button className="mt-6 w-full"><Download className="h-4 w-4" />Download</Button></a>
        </> : <p className="text-center text-sm text-slate-500">Shared file not found.</p>}
      </Card>
    </main>
  )
}
