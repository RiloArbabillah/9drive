import { Folder, MoreVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FolderItem } from '@/data/drive-data'

export function FolderGrid({ items, mobileTwoColumns = false }: { items: FolderItem[]; mobileTwoColumns?: boolean }) {
  return (
    <div className={cn('mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4', mobileTwoColumns && 'grid-cols-2')}>
      {items.map((folder) => (
        <Card key={folder.name} className="group relative flex min-h-48 flex-col items-center justify-center p-6 transition hover:-translate-y-1 hover:shadow-xl">
          <MoreVertical className="absolute right-5 top-5 h-5 w-5 text-slate-500" />
          <Folder className={cn('h-20 w-20 fill-current stroke-current transition group-hover:scale-110', folder.color)} />
          <h2 className="mt-5 text-center text-lg font-extrabold">{folder.name}</h2>
          <p className="mt-1 text-center text-sm text-slate-500">{folder.updated}</p>
        </Card>
      ))}
    </div>
  )
}
