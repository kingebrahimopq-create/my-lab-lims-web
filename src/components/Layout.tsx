import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTestStore } from '@/stores/testStore';

export default function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const { labSettings, pageSettings } = useSettingsStore();
  const pendingResults = useTestStore((s) => s.results.filter((r) => r.status === 'pending'));

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('dashboard'), visible: pageSettings.dashboard },
    { path: '/patients', icon: Users, label: t('patients'), visible: pageSettings.patients },
    { path: '/tests', icon: FlaskConical, label: t('tests'), visible: pageSettings.tests },
    { path: '/results', icon: FileText, label: t('results'), visible: pageSettings.results },
    { path: '/invoices', icon: Receipt, label: t('invoices'), visible: pageSettings.invoices },
    { path: '/reports', icon: BarChart3, label: t('reports'), visible: pageSettings.reports },
    { path: '/settings', icon: Settings, label: t('settings'), visible: pageSettings.settings },
  ].filter((item) => item.visible !== false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const user = useAuthStore((s) => s.user);
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <h1 className="font-bold text-lg text-slate-800">{labSettings?.labName || 'MyLab LIMS'}</h1>
        <div className="relative">
          <Bell className="w-5 h-5 text-slate-600" />
          {pendingResults.length > 0 && (
            <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {pendingResults.length}
            </span>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 h-full bg-white border-slate-200 z-40 transition-all duration-300 ease-in-out flex flex-col shrink-0 overflow-hidden
          ${i18n.language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'}
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          ${mobileMenuOpen ? 'translate-x-0' : i18n.language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`p-4 border-b border-slate-100 flex items-center gap-3 ${!sidebarOpen && 'lg:justify-center'}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="overflow-hidden">
              <h2 className="font-semibold text-slate-800 text-sm whitespace-nowrap tracking-tight">{labSettings?.labName || 'MyLab LIMS'}</h2>
              <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                {i18n.language === 'ar' ? 'نظام إدارة المختبرات الطبية' : 'Clinical Laboratory System'}
              </p>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-slate-100 ${!sidebarOpen && 'lg:hidden'}`}>
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'مستخدم'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-150
                  ${active
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  } ${!sidebarOpen && 'lg:justify-center'}`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                {(sidebarOpen || mobileMenuOpen) && <span className="truncate">{item.label}</span>}
                {item.path === '/results' && pendingResults.length > 0 && (
                  <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-200/50 text-blue-800' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {pendingResults.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-100 bg-white shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-all
              ${!sidebarOpen && 'lg:justify-center'}`}
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-400" />
            {(sidebarOpen || mobileMenuOpen) && <span>{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Toggle Sidebar Button (Desktop) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex fixed top-4 z-30 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm hover:shadow-md transition-all duration-300"
        style={{ 
          right: i18n.language === 'ar' ? (sidebarOpen ? '240px' : '64px') : 'auto',
          left: i18n.language !== 'ar' ? (sidebarOpen ? '240px' : '64px') : 'auto'
        }}
      >
        <ChevronLeft className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${!sidebarOpen && 'rotate-180'}`} />
      </button>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 min-h-screen pt-16 lg:pt-0 flex flex-col
          ${sidebarOpen 
            ? (i18n.language === 'ar' ? 'lg:mr-64 lg:ml-0' : 'lg:ml-64 lg:mr-0') 
            : (i18n.language === 'ar' ? 'lg:mr-20 lg:ml-0' : 'lg:ml-20 lg:mr-0')
          }`}
      >
        {/* Top Header Navigation (Desktop LIMS header) */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-6 shrink-0 sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider font-mono">
                MyLab LIMS v2.4.0
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                {i18n.language === 'ar' ? 'النظام متصل سحابياً' : 'System Online'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">{user?.name || 'مستخدم'}</p>
                <p className="text-[9px] text-slate-400 font-medium">
                  {user?.role === 'owner' ? (i18n.language === 'ar' ? 'مدير معمل رئيسي' : 'Senior Lab Manager') : (user?.role === 'receptionist' ? (i18n.language === 'ar' ? 'ممرض استقبال' : 'Senior Receptionist') : (i18n.language === 'ar' ? 'أخصائي تحاليل' : 'Clinical Pathologist'))}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 border border-white text-blue-700 flex items-center justify-center text-xs font-bold shadow-sm">
                {user?.name?.charAt(0) || '?'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 flex-1 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
