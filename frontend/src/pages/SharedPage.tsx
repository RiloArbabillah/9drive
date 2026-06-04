import { Clock, Users, UserCheck } from 'lucide-react'
import { FileTable } from '@/components/drive/FileTable'
import { FolderGrid } from '@/components/drive/FolderGrid'
import { MetricCard } from '@/components/drive/MetricCard'
import { PageHeader } from '@/components/drive/PageHeader'
import { sharedFiles, sharedFolders } from '@/data/drive-data'

export function SharedPage() {
  return (
    <>
      <PageHeader title="Shared With Me" description="Files and folders shared by teammates." />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard label="Shared Items" value="12" icon={Users} />
        <MetricCard label="Team Members" value="5" icon={UserCheck} />
        <MetricCard label="Pending Reviews" value="3" icon={Clock} />
      </div>
      <FolderGrid items={sharedFolders} />
      <FileTable files={sharedFiles} mode="shared" />
    </>
  )
}
