import { Download, Edit3, Eye, FolderInput, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FileItem } from '@/data/drive-data'

export function FileContextMenu({ x, y, file, onClose, onView, onDownload, onRename, onMove, onDelete }: { x: number; y: number; file: FileItem | null; onClose: () => void; onView: () => void; onDownload: () => void; onRename: () => void; onMove: () => void; onDelete: () => void }) {
  if (!file) return null

  return (
    <>
      <button className="fixed inset-0 z-40 cursor-default" aria-label="Close file menu" onClick={onClose} />
      <div className="fixed z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15" style={{ left: x, top: y }}>
        <p className="truncate px-3 py-2 text-xs font-bold text-slate-500">{file.name}</p>
        <Button variant="ghost" className="w-full justify-start" onClick={onView}><Eye className="h-4 w-4" />View</Button>
        <Button variant="ghost" className="w-full justify-start" onClick={onDownload}><Download className="h-4 w-4" />Download</Button>
        <Button variant="ghost" className="w-full justify-start" onClick={onRename}><Edit3 className="h-4 w-4" />Rename</Button>
        <Button variant="ghost" className="w-full justify-start" onClick={onMove}><FolderInput className="h-4 w-4" />Move to Folder</Button>
        <Button variant="danger" className="w-full justify-start" onClick={onDelete}><Trash2 className="h-4 w-4" />Delete</Button>
      </div>
    </>
  )
}
