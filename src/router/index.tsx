import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import RoleSelect from '../pages/auth/RoleSelect'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import SyndicDashboard from '../pages/syndic/Dashboard'
import SyndicUnits from '../pages/syndic/Units'
import SyndicTasks from '../pages/syndic/Tasks'
import SyndicFinance from '../pages/syndic/Finance'
import SyndicAnnouncements from '../pages/syndic/Announcements'
import SyndicVotes from '../pages/syndic/Votes'
import SyndicContacts from '../pages/syndic/Contacts'
import ResidentDashboard from '../pages/resident/Dashboard'
import ResidentProperties from '../pages/resident/Properties'
import ResidentLedger from '../pages/resident/Ledger'
import ResidentSupport from '../pages/resident/Support'
import ResidentAnnouncements from '../pages/resident/Announcements'
import ResidentVotes from '../pages/resident/Votes'
import ResidentMessages from '../pages/resident/Messages'
import GardienDashboard from '../pages/gardien/Dashboard'
import GardienTasks from '../pages/gardien/Tasks'
import GardienFinance from '../pages/gardien/Finance'
import GardienMenu from '../pages/gardien/Menu'
import GardienMessages from '../pages/gardien/Messages'
import ChatThread from '../pages/shared/ChatThread'
import DashboardLayout from '../components/layout/DashboardLayout'

function RoleGuard({
  allowed,
  children,
}: {
  allowed: 'syndic' | 'resident' | 'gardien'
  children: React.ReactNode
}) {
  const { isAuthenticated, role, isLoading } = useAuthStore()
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-on-surface-variant">Loading…</div>
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (role !== allowed) {
    const redirect = role === 'syndic' ? '/syndic' : role === 'resident' ? '/resident' : '/gardien'
    return <Navigate to={redirect} replace />
  }
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<RoleSelect />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/register/:role" element={<Register />} />

      {/* Syndic */}
      <Route path="/syndic" element={<RoleGuard allowed="syndic"><DashboardLayout role="syndic" /></RoleGuard>}>
        <Route index element={<SyndicDashboard />} />
        <Route path="units" element={<SyndicUnits />} />
        <Route path="tasks" element={<SyndicTasks />} />
        <Route path="finance" element={<SyndicFinance />} />
        <Route path="announcements" element={<SyndicAnnouncements />} />
        <Route path="votes" element={<SyndicVotes />} />
        <Route path="contacts" element={<SyndicContacts />} />
        <Route path="chat/:partnerId" element={<ChatThread />} />
      </Route>

      {/* Resident */}
      <Route path="/resident" element={<RoleGuard allowed="resident"><DashboardLayout role="resident" /></RoleGuard>}>
        <Route index element={<ResidentDashboard />} />
        <Route path="properties" element={<ResidentProperties />} />
        <Route path="ledger" element={<ResidentLedger />} />
        <Route path="support" element={<ResidentSupport />} />
        <Route path="announcements" element={<ResidentAnnouncements />} />
        <Route path="votes" element={<ResidentVotes />} />
        <Route path="messages" element={<ResidentMessages />} />
        <Route path="chat/:partnerId" element={<ChatThread />} />
      </Route>

      {/* Gardien */}
      <Route path="/gardien" element={<RoleGuard allowed="gardien"><DashboardLayout role="gardien" /></RoleGuard>}>
        <Route index element={<GardienDashboard />} />
        <Route path="tasks" element={<GardienTasks />} />
        <Route path="finance" element={<GardienFinance />} />
        <Route path="menu" element={<GardienMenu />} />
        <Route path="messages" element={<GardienMessages />} />
        <Route path="chat/:partnerId" element={<ChatThread />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
