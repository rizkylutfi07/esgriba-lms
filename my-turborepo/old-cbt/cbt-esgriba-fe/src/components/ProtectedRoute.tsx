import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  allowedRoles?: string | string[]
  redirectTo?: string
  children?: React.ReactNode
}

/**
 * ProtectedRoute - Wrapper untuk route yang memerlukan autentikasi
 * 
 * Usage:
 * <Route element={<ProtectedRoute allowedRoles="admin" />}>
 *   <Route path="/admin/dashboard" element={<AdminDashboard />} />
 * </Route>
 * 
 * Atau dengan multiple roles:
 * <Route element={<ProtectedRoute allowedRoles={["admin", "guru"]} />}>
 *   <Route path="/monitoring" element={<MonitorPage />} />
 * </Route>
 */
export function ProtectedRoute({ 
  allowedRoles, 
  redirectTo = '/login',
  children 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  // Check authentication
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />
  }

  // Check role authorization if specified
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    
    if (!roles.includes(user.role)) {
      // Redirect based on user role
      const roleRedirects: Record<string, string> = {
        admin: '/admin/dashboard',
        guru: '/guru/dashboard',
        siswa: '/siswa/dashboard',
      }
      
      return <Navigate to={roleRedirects[user.role] || '/unauthorized'} replace />
    }
  }

  // Render children or Outlet for nested routes
  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
