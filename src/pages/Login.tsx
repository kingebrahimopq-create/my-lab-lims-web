import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loginWithCredentials, members, owners } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // Handle Supabase OAuth callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const email = session.user.email || '';
        const OWNER_EMAIL = 'mhm763517@gmail.com';

        if (email === OWNER_EMAIL) {
          const ownerRecord = owners.find((o) => o.email === OWNER_EMAIL);
          const authUser = {
            id: ownerRecord?.id || 'owner-default',
            email,
            name: session.user.user_metadata?.full_name || ownerRecord?.name || 'صاحب المعمل',
            picture: session.user.user_metadata?.avatar_url,
            role: 'owner' as const,
            isOwner: true,
          };
          login(authUser);
          navigate('/');
          return;
        }

        const matchedMember = members.find(
          (m) => m.email === email && m.status === 'active'
        );
        if (matchedMember) {
          const authUser = {
            id: matchedMember.id,
            email,
            name: session.user.user_metadata?.full_name || matchedMember.name,
            picture: session.user.user_metadata?.avatar_url,
            role: matchedMember.role,
            customRole: matchedMember.customRole,
            isOwner: false,
          };
          login(authUser);
          navigate('/');
          return;
        }

        // User not found in the system
        await supabase.auth.signOut();
        setError('هذا الحساب غير مصرح له بالدخول. تواصل مع مدير المعمل لإضافة حسابك.');
        setIsGoogleLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, owners]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (authError) {
        setError('حدث خطأ أثناء تسجيل الدخول بجوجل: ' + authError.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول بجوجل. يرجى المحاولة مرة أخرى.');
      setIsGoogleLoading(false);
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const user = loginWithCredentials(username.trim(), password);
      if (user) {
        navigate('/');
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600 flex items-center justify-center shadow-sm mb-3">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">MyLab LIMS</h1>
          <p className="text-xs text-slate-400 mt-1">نظام إدارة المختبرات الطبية المتكامل</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleStaffLogin} className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  dir="ltr"
                  autoComplete="username"
                  placeholder="mhm763517@gmail.com"
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  autoComplete="current-password"
                  placeholder="admin123"
                  className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-2 bg-white text-slate-400 font-semibold uppercase">أو</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-3 border border-slate-200 shadow-sm"
          >
            {isGoogleLoading ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isGoogleLoading ? 'جاري الاتصال...' : 'تسجيل الدخول بحساب جوجل'}
          </button>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-blue-700 text-[10px] text-center leading-relaxed">
              <strong>للدخول كمدير:</strong> البريد: mhm763517@gmail.com | كلمة المرور: admin123
            </p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[11px] mt-6">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} MyLab LIMS
        </p>
      </div>
    </div>
  );
}
