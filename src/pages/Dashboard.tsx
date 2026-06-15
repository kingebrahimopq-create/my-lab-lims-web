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
      trend: '+12% اليوم',
      trendColor: 'text-emerald-600 bg-emerald-50 border border-emerald-100',
      path: '/patients',
    },
    {
      title: 'تحاليل اليوم',
      value: todayTests.length,
      icon: FlaskConical,
      trend: '+8% اليوم',
      trendColor: 'text-emerald-600 bg-emerald-50 border border-emerald-100',
      path: '/tests',
    },
    {
      title: 'إيرادات اليوم',
      value: `${todayRevenue.toLocaleString()} ${getCurrencySymbol()}`,
      icon: Receipt,
      trend: '+15% اليوم',
      trendColor: 'text-blue-600 bg-blue-50 border border-blue-100',
      path: '/invoices',
    },
    {
      title: 'نتائج معلقة',
      value: pendingResults.length,
      icon: Clock,
      trend: pendingResults.length > 0 ? 'تحتاج اهتمام' : 'لا يوجد',
      trendColor: pendingResults.length > 0 ? 'text-amber-600 bg-amber-50 border border-amber-100' : 'text-slate-500 bg-slate-50 border border-slate-100',
      path: '/results',
    },
  ];

  const quickActions = [
    { label: 'إضافة مريض', icon: UserPlus, path: '/patients' },
    { label: 'إضافة تحليل', icon: TestTube, path: '/tests' },
    { label: 'إنشاء فاتورة', icon: FilePlus, path: '/invoices' },
    { label: 'التقارير', icon: BarChart3, path: '/reports' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            مرحباً، {user?.name || 'صاحب المعمل'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">نظرة عامة على المعمل</p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200">
          {new Date().toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={() => navigate(stat.path)}
            className="text-right bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-150 group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex items-end justify-between w-full">
              <span className="text-2xl font-bold font-mono text-slate-800">{stat.value}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${stat.trendColor}`}>
                {stat.trend}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-50 pb-3">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 border border-slate-250 group"
            >
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm group-hover:border-blue-200 transition-colors">
                <action.icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700 transition-colors">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">آخر المرضى</h3>
            <button onClick={() => navigate('/patients')} className="text-xs font-bold text-blue-600 hover:underline">
              عرض الكل
            </button>
          </div>
          {patients.slice(-5).reverse().length === 0 ? (
            <div className="text-center py-8 text-slate-400 flex-1 flex flex-col justify-center items-center">
              <Users className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-xs font-medium">لا يوجد مرضى بعد</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {patients.slice(-5).reverse().map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => navigate('/patients')}
                  className="flex items-center gap-3 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer first:pt-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{patient.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 font-bold tracking-tight">{patient.code}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-450">
                    {new Date(patient.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Results */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">نتائج معلقة</h3>
            <button onClick={() => navigate('/results')} className="text-xs font-bold text-blue-600 hover:underline">
              عرض الكل
            </button>
          </div>
          {pendingResults.length === 0 ? (
            <div className="text-center py-8 text-slate-400 flex-1 flex flex-col justify-center items-center">
              <Activity className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-xs font-medium">لا توجد نتائج معلقة</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {pendingResults.slice(0, 5).map((result) => (
                <div
                  key={result.id}
                  onClick={() => navigate('/results')}
                  className="flex items-center gap-3 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer first:pt-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{result.testName}</p>
                    <p className="text-[10px] font-medium text-slate-400">{result.patientName} - {result.patientCode}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded">معلق</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-amber-50 pb-3">
            <h3 className="text-xs font-bold text-amber-800 flex items-center gap-2 tracking-wider">
              <Receipt className="w-4 h-4 text-amber-600" />
              فواتير بانتظار الدفع
            </h3>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full">{pendingPayments.length} فاتورة</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPayments.slice(0, 3).map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => navigate('/invoices')}
                className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-amber-50/30 border border-slate-200/60 rounded-xl cursor-pointer hover:border-amber-200 transition-all duration-150"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{invoice.patientName}</p>
                  <p className="text-[10px] font-mono font-medium text-slate-400">{invoice.invoiceNumber}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-amber-700 font-mono">
                    {invoice.remaining.toLocaleString()} {getCurrencySymbol()}
                  </p>
                  <p className="text-[9px] font-bold text-amber-500 uppercase">متبقي</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
