import { Outlet } from 'react-router-dom'
import TopAppBar from './TopAppBar'
import BottomNav from './BottomNav'
import AssistantLauncher from '../assistant/AssistantLauncher'

type Role = 'syndic' | 'resident' | 'gardien'

export default function DashboardLayout({ role }: { role: Role }) {
  return (
    <div className="bg-background text-on-surface font-body min-h-screen">
      {/* Background organic blobs */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-primary-container/5 rounded-bl-full blur-[120px]" />
      <div className="fixed bottom-0 left-0 -z-10 w-1/4 h-1/3 bg-tertiary-container/5 rounded-tr-full blur-[100px]" />
      <TopAppBar />
      <main className="pt-20 pb-32">
        <Outlet />
      </main>
      <BottomNav role={role} />
      <AssistantLauncher role={role} />
    </div>
  )
}
