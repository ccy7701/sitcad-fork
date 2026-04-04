
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-6"
        style={{ background: 'linear-gradient(160deg, #ACFCD9 0%, #ffffff 65%, #FFF5F9 80%, #FFFDE7 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative flex items-center justify-center w-28 h-28">
            <Loader2 className="absolute inset-0 w-full h-full text-[#3090A0] animate-spin opacity-80" />
            <img src="/logo/logo.png" alt="SabahSprout" className="w-16 h-16 object-contain" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard based on actual role
    const roleRedirects = {
      teacher: '/teacher/dashboard',
      parent: '/parent/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
