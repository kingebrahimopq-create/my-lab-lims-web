import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FlaskConical, Shield, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: '313164369951-4f3a3sde194h9hnsskbg0jvdl8l2shk.apps.googleusercontent.com',
          callback: handleGoogleResponse,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button')!,
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'pill',
          }
        );
      }
    };

    const timeout = setTimeout(initializeGoogle, 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleGoogleResponse = (response: any) => {
    setIsLoading(true);
    setError('');

    try {
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));

      const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        picture: payload.picture,
        role: payload.email === 'mhm763517@gmail.com' ? 'owner' as const : 'admin' as const,
        isOwner: payload.email === 'mhm763517@gmail.com',
      };

      localStorage.setItem('google_token', credential);
      localStorage.setItem('auth_state', JSON.stringify(user));
      login(user);
      navigate('/');
    } catch (err) {
      setError('حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    const demoUser = {
      id: 'demo-owner',
      email: 'mhm763517@gmail.com',
      name: 'صاحب المعمل',
      picture: undefined,
      role: 'owner' as const,
      isOwner: true,
    };
    localStorage.setItem('auth_state', JSON.stringify(demoUser));
    login(demoUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4">
            <FlaskConical className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MyLab LIMS</h1>
          <p className="text-slate-400">نظام إدارة المختبرات الطبية المتكامل</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white text-center mb-6">تسجيل الدخول</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <div className="mb-4">
            <div id="google-signin-button" className="w-full flex justify-center"></div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-slate-400">أو</span>
            </div>
          </div>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50"
          >
            <UserCheck className="w-5 h-5" />
            <span>{isLoading ? 'جاري تسجيل الدخول...' : 'الدخول كمالك (وضع العرض)'}</span>
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm font-medium">حماية خصوصية الملكية</p>
                <p className="text-blue-400/70 text-xs mt-1">
                  يتم حماية جميع البيانات بشكل آمن. فقط المالك المصرح له يمكنه الوصول إلى الإعدادات والأعضاء.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} MyLab LIMS
        </p>
      </div>
    </div>
  );
}
