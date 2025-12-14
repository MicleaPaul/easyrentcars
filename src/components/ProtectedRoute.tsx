import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        setIsAdmin(!!adminUser);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center">
        <div className="text-[#D4AF37] text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
