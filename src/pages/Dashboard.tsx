import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Users,
  Receipt,
  Clock,
  UserPlus,
  TestTube,
  FilePlus,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { usePatientStore } from '@/stores/patientStore';
import { useTestStore } from '@/stores/testStore';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { patients } = usePatientStore();
  const { results } = useTestStore();
  const { invoices } = useInvoiceStore();
  const { getCurrencySymbol } = useSettingsStore();
  const { user } = useAuthStore();

  const today = new Date().toDateString();
  const todayPatients = patients.filter((p) => new Date(p.createdAt).toDateString() === today);
  const todayTests = results.filter((r) => new Date(r.createdAt).toDateString() === today);
  const todayRevenue = invoices
    .filter((i) => new Date(i.createdAt).toDateString() === today)
    .reduce((sum, i) => sum + i.paid, 0);
  const pendingResults = results.filter((r) => r.status === 'pending');
  const pendingPayments = invoices.filter(
    (i) => i.paymentStatus === 'unpaid' || i.paymentStatus === 'partial'
  );

  const stats = [
    {
      title: 'مرضى اليوم',
      value: todayPatients.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-200',
      trend: '+12%',
      trendUp: true,
      path: '/patients',
    },
    {
      title: 'تحاليل اليوم',
      value: todayTests.length,
      icon: FlaskConical,
      color: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-200',
      trend: '+8%',
      trendUp: true,
      path: '/tests',
    },
    {
      title: 'إيرادات اليوم',
      value: `${todayRevenue.toLocaleString()} ${getCurrencySymbol()}`,
      icon: Receipt,
      color: 'from-amber-500 to-amber-600',
      shadow: 'shadow-amber-200',
      trend: '+15%',
      trendUp: true,
      path: '/invoices',
    },
    {
      title: 'نتائج معلقة',
      value: pendingResults.length,
      icon: Clock,
      color: 'from-red-500 to-red-600',
      shadow: 'shadow-red-200',
      trend: pendingResults.length > 0 ? 'تحتاج اهتمام' : 'لا يوجد',
      trendUp: false,
      path: '/results',
    },
  ];

  const quickActions = [
    { label: 'إضافة مريض', icon: UserPlus, path: '/patients', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'إضافة تحليل', icon: TestTube, path: '/tests', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { label: 'إنشاء فاتورة', icon: FilePlus, path: '/invoices', color: 'bg-amber-500 hover:bg-amber-600' },
    { label: 'التقارير', icon: BarChart3, path: '/reports', color: 'bg-purple-500 hover:bg-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            مرحباً، {user?.name || 'صاحب المعمل'}
          </h1>
          <p className="text-slate-500 mt-1">نظرة عامة على المعمل</p>
        </div>
        <div className="text-sm text-slate-400 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200">
          {new Date().toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={() => navigate(stat.path)}
            className="text-right bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} shadow-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{stat.trend}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.title}</p>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white p-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
            >
              <action.icon className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">آخر المرضى</h3>
            <button onClick={() => navigate('/patients')} className="text-sm text-blue-600 hover:text-blue-700">
              عرض الكل
            </button>
          </div>
          {patients.slice(-5).reverse().length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>لا يوجد مرضى بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.slice(-5).reverse().map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => navigate('/patients')}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{patient.name}</p>
                    <p className="text-xs text-slate-400">{patient.code}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(patient.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Results */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">نتائج معلقة</h3>
            <button onClick={() => navigate('/results')} className="text-sm text-blue-600 hover:text-blue-700">
              عرض الكل
            </button>
          </div>
          {pendingResults.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>لا توجد نتائج معلقة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingResults.slice(0, 5).map((result) => (
                <div
                  key={result.id}
                  onClick={() => navigate('/results')}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border-r-2 border-amber-400"
                >
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{result.testName}</p>
                    <p className="text-xs text-slate-400">{result.patientName} - {result.patientCode}</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">معلق</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              فواتير بانتظار الدفع
            </h3>
            <span className="text-sm text-amber-600">{pendingPayments.length} فاتورة</span>
          </div>
          <div className="space-y-2">
            {pendingPayments.slice(0, 3).map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => navigate('/invoices')}
                className="flex items-center justify-between p-3 bg-white/70 rounded-xl cursor-pointer hover:bg-white transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{invoice.patientName}</p>
                  <p className="text-xs text-slate-400">{invoice.invoiceNumber}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-amber-700">
                    {invoice.remaining.toLocaleString()} {getCurrencySymbol()}
                  </p>
                  <p className="text-xs text-amber-500">متبقي</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
