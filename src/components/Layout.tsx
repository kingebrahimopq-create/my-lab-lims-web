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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
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
        className={`fixed top-0 right-0 h-full bg-white/90 backdrop-blur-xl border-l border-slate-200 z-40 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`p-4 border-b border-slate-100 flex items-center gap-3 ${!sidebarOpen && 'lg:justify-center'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="overflow-hidden">
              <h2 className="font-bold text-slate-800 text-sm whitespace-nowrap">{labSettings?.labName || 'MyLab LIMS'}</h2>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">نظام إدارة المختبرات</p>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-slate-100 ${!sidebarOpen && 'lg:hidden'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.name || 'مستخدم'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                } ${!sidebarOpen && 'lg:justify-center'}`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {(sidebarOpen || mobileMenuOpen) && <span className="truncate">{item.label}</span>}
              {item.path === '/results' && pendingResults.length > 0 && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${isActive(item.path) ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}>
                  {pendingResults.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 right-0 left-0 p-3 border-t border-slate-100 bg-white/90 backdrop-blur-xl">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all
              ${!sidebarOpen && 'lg:justify-center'}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span>{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Toggle Sidebar Button (Desktop) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex fixed top-4 z-30 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
        style={{ right: sidebarOpen ? '250px' : '66px' }}
      >
        <ChevronLeft className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${!sidebarOpen && 'rotate-180'}`} />
      </button>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 min-h-screen pt-16 lg:pt-0
          ${sidebarOpen ? 'lg:mr-64' : 'lg:mr-20'}`}
      >
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
