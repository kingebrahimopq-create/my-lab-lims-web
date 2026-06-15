import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FlaskConical, Shield, User, Lock, Eye, EyeOff, TestTube } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';

type LoginTab = 'staff' | 'patient';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loginWithCredentials } = useAuthStore();
  const { patients } = usePatientStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<LoginTab>('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [patientCode, setPatientCode] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
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
          { theme: 'outline', size: 'large', width: '100%', text: 'signin_with', shape: 'pill' }
        );
      }
    };
    const timeout = setTimeout(initializeGoogle, 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleGoogleResponse = (response: { credential: string }) => {
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
    } catch {
      setError('حدث خطأ في تسجيل الدخول بجوجل.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('يرجى إدخال اسم المستخدم وكلمة المرور'); return; }
    setIsLoading(true);
    setError('');
    try {
      const user = loginWithCredentials(username.trim(), password);
      if (user) { navigate('/'); }
      else { setError('اسم المستخدم أو كلمة المرور غير صحيحة'); }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientCode.trim() || !patientPhone.trim()) { setError('يرجى إدخال كود المريض ورقم الهاتف'); return; }
    setIsLoading(true);
    setError('');
    try {
      const patient = patients.find(
        (p) => p.code.toLowerCase() === patientCode.trim().toLowerCase() && p.phone === patientPhone.trim()
      );
      if (patient) {
        const patientUser = {
          id: `patient-${patient.id}`,
          email: patient.email || `${patient.code}@patient.local`,
          name: patient.name,
          role: 'receptionist' as const,
          isOwner: false,
        };
        localStorage.setItem('auth_state', JSON.stringify(patientUser));
        localStorage.setItem('patient_session', JSON.stringify({ patientId: patient.id, code: patient.code }));
        login(patientUser);
        navigate('/results');
      } else {
        setError('كود المريض أو رقم الهاتف غير صحيح');
      }
    } catch {
      setError('حدث خطأ أثناء التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4">
            <FlaskConical className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MyLab LIMS</h1>
          <p className="text-slate-400">نظام إدارة المختبرات الطبية المتكامل</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="flex rounded-xl bg-white/5 p-1 mb-6 gap-1">
            <button
              onClick={() => { setActiveTab('staff'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'staff' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <User className="w-4 h-4" />موظفو المعمل
            </button>
            <button
              onClick={() => { setActiveTab('patient'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'patient' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <TestTube className="w-4 h-4" />متابعة تحاليلي
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">{error}</div>
          )}

          {activeTab === 'staff' ? (
            <>
              <form onSubmit={handleStaffLogin} className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">اسم المستخدم أو البريد الإلكتروني</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" dir="ltr" autoComplete="username"
                      className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" autoComplete="current-password"
                      className="w-full pr-10 pl-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-500/30">
                  {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
              </form>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
                <div className="relative flex justify-center text-xs"><span className="px-3 bg-transparent text-slate-500">أو الدخول بجوجل</span></div>
              </div>
              <div id="google-signin-button" className="w-full flex justify-center"></div>
              <div className="mt-5 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-blue-400/80 text-xs">
                    <span className="font-semibold text-blue-300">بيانات الدخول الافتراضية: </span>
                    المستخدم: <span className="font-mono text-white/70">admin</span> — كلمة المرور: <span className="font-mono text-white/70">Admin@1234</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handlePatientLogin} className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-300 text-xs text-center">أدخل كود المريض ورقم هاتفك لمتابعة نتائج تحاليلك</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">كود المريض</label>
                <div className="relative">
                  <TestTube className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={patientCode} onChange={(e) => setPatientCode(e.target.value)} placeholder="P-0001" dir="ltr"
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">رقم الهاتف</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="01012345678" dir="ltr"
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-500/30">
                {isLoading ? 'جاري التحقق...' : 'عرض نتائجي'}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-slate-500 text-sm mt-6">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} MyLab LIMS
        </p>
      </div>
    </div>
  );
}
