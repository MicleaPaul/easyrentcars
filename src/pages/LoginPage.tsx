import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';

export function LoginPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (adminUser) {
          navigate('/admin');
        } else {
          setError('You do not have admin access');
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center px-6 py-24">
      <div className="card-luxury p-8 sm:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo variant="header" alt="EasyRentCars Logo" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('login.title')}</h1>
          <p className="text-[#9AA0A6]">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
              {t('login.email')}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 pl-12 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                placeholder={t('login.emailPlaceholder')}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>

          <div>
            <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
              {t('login.password')}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 pl-12 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                placeholder={t('login.passwordPlaceholder')}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-base uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              t('login.loggingIn')
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {t('login.submit')}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-[#D4AF37] hover:text-[#F4D03F] transition-colors text-sm"
          >
            ← {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
