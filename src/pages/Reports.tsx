import { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Receipt,
  TrendingUp,
  Users,
  FlaskConical,
} from 'lucide-react';
import { usePatientStore } from '@/stores/patientStore';
import { useTestStore } from '@/stores/testStore';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { exportToPDF, exportToExcel, exportToCSV, exportToWord, printDocument } from '@/lib/exportUtils';

export default function Reports() {
  const { patients } = usePatientStore();
  const { results } = useTestStore();
  const { invoices } = useInvoiceStore();
  const { getCurrencySymbol } = useSettingsStore();

  const [reportType, setReportType] = useState('daily');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  toDate.setHours(23, 59, 59);

  const filteredInvoices = invoices.filter((i) => {
    const d = new Date(i.createdAt);
    return d >= fromDate && d <= toDate;
  });

  const filteredResults = results.filter((r) => {
    const d = new Date(r.createdAt);
    return d >= fromDate && d <= toDate;
  });

  const filteredPatients = patients.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= fromDate && d <= toDate;
  });

  const totalRevenue = filteredInvoices.reduce((sum, i) => sum + i.paid, 0);
  const totalDiscounts = filteredInvoices.reduce((sum, i) => sum + i.discountAmount, 0);
  const totalPending = filteredInvoices.reduce((sum, i) => sum + i.remaining, 0);
  const completedResults = filteredResults.filter((r) => r.status === 'completed').length;
  const pendingResults = filteredResults.filter((r) => r.status === 'pending').length;

  const statsCards = [
    {
      title: 'الإيرادات',
      value: `${totalRevenue.toLocaleString()} ${getCurrencySymbol()}`,
      icon: Receipt,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'الخصومات',
      value: `${totalDiscounts.toLocaleString()} ${getCurrencySymbol()}`,
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'المرضى الجدد',
      value: String(filteredPatients.length),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'التحاليل',
      value: String(filteredResults.length),
      icon: FlaskConical,
      color: 'from-amber-500 to-amber-600',
    },
  ];

  const generateReport = (format: 'pdf' | 'excel' | 'csv' | 'word') => {
    const periodText = `من ${new Date(dateFrom).toLocaleDateString('ar-EG')} إلى ${new Date(dateTo).toLocaleDateString('ar-EG')}`;
    const headers = ['البيان', 'القيمة'];
    const data = [
      ['الإيرادات', `${totalRevenue.toLocaleString()} ${getCurrencySymbol()}`],
      ['الخصومات', `${totalDiscounts.toLocaleString()} ${getCurrencySymbol()}`],
      ['المبالغ المعلقة', `${totalPending.toLocaleString()} ${getCurrencySymbol()}`],
      ['المرضى الجدد', String(filteredPatients.length)],
      ['إجمالي التحاليل', String(filteredResults.length)],
      ['التحاليل المكتملة', String(completedResults)],
      ['التحاليل المعلقة', String(pendingResults)],
      ['عدد الفواتير', String(filteredInvoices.length)],
    ];
    const filename = `report_${dateFrom}_${dateTo}`;

    switch (format) {
      case 'pdf':
        exportToPDF(`تقرير ${getReportTypeName()} - ${periodText}`, headers, data, filename);
        break;
      case 'excel':
        exportToExcel(headers, data, filename);
        break;
      case 'csv':
        exportToCSV(headers, data, filename);
        break;
      case 'word':
        exportToWord(`تقرير ${getReportTypeName()}`, headers, data, filename);
        break;
    }
  };

  const printReport = () => {
    const periodText = `من ${new Date(dateFrom).toLocaleDateString('ar-EG')} إلى ${new Date(dateTo).toLocaleDateString('ar-EG')}`;
    const content = `
      <table style="width:100%;border-collapse:collapse;margin-top:20px">
        <thead><tr style="background:#2980b9;color:white">
          <th style="border:1px solid #ddd;padding:10px;text-align:right">البيان</th>
          <th style="border:1px solid #ddd;padding:10px;text-align:center">القيمة</th>
        </tr></thead>
        <tbody>
          <tr><td style="border:1px solid #ddd;padding:8px">الإيرادات</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${totalRevenue.toLocaleString()} ${getCurrencySymbol()}</td></tr>
          <tr style="background:#f5f5f5"><td style="border:1px solid #ddd;padding:8px">الخصومات</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${totalDiscounts.toLocaleString()} ${getCurrencySymbol()}</td></tr>
          <tr><td style="border:1px solid #ddd;padding:8px">المبالغ المعلقة</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${totalPending.toLocaleString()} ${getCurrencySymbol()}</td></tr>
          <tr style="background:#f5f5f5"><td style="border:1px solid #ddd;padding:8px">المرضى الجدد</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${filteredPatients.length}</td></tr>
          <tr><td style="border:1px solid #ddd;padding:8px">إجمالي التحاليل</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${filteredResults.length}</td></tr>
          <tr style="background:#f5f5f5"><td style="border:1px solid #ddd;padding:8px">التحاليل المكتملة</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${completedResults}</td></tr>
          <tr><td style="border:1px solid #ddd;padding:8px">التحاليل المعلقة</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${pendingResults}</td></tr>
          <tr style="background:#f5f5f5"><td style="border:1px solid #ddd;padding:8px">عدد الفواتير</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${filteredInvoices.length}</td></tr>
        </tbody>
      </table>
    `;
    printDocument(`تقرير ${getReportTypeName()} - ${periodText}`, content);
  };

  const getReportTypeName = () => {
    switch (reportType) {
      case 'daily':
        return 'يومي';
      case 'weekly':
        return 'أسبوعي';
      case 'monthly':
        return 'شهري';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">التقارير</h1>
            <p className="text-sm text-slate-500">تقارير وإحصائيات المعمل</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-sm"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium">
              <Download className="w-4 h-4" />
              تصدير
            </button>
            <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 hidden group-hover:flex flex-col gap-1 z-10 min-w-[130px]">
              <button onClick={() => generateReport('pdf')} className="text-xs text-right px-3 py-2 hover:bg-slate-50 rounded-lg">تصدير PDF</button>
              <button onClick={() => generateReport('excel')} className="text-xs text-right px-3 py-2 hover:bg-slate-50 rounded-lg">تصدير Excel</button>
              <button onClick={() => generateReport('csv')} className="text-xs text-right px-3 py-2 hover:bg-slate-50 rounded-lg">تصدير CSV</button>
              <button onClick={() => generateReport('word')} className="text-xs text-right px-3 py-2 hover:bg-slate-50 rounded-lg">تصدير Word</button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="daily">تقرير يومي</option>
            <option value="weekly">تقرير أسبوعي</option>
            <option value="monthly">تقرير شهري</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">ملخص التقرير</h3>
          <p className="text-sm text-slate-500">
            من {new Date(dateFrom).toLocaleDateString('ar-EG')} إلى {new Date(dateTo).toLocaleDateString('ar-EG')}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-sm text-slate-600">الإيرادات</td>
                <td className="py-3 px-4 text-sm font-bold text-emerald-700 text-left">
                  {totalRevenue.toLocaleString()} {getCurrencySymbol()}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-sm text-slate-600">الخصومات</td>
                <td className="py-3 px-4 text-sm font-bold text-red-700 text-left">
                  {totalDiscounts.toLocaleString()} {getCurrencySymbol()}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-sm text-slate-600">المبالغ المعلقة</td>
                <td className="py-3 px-4 text-sm font-bold text-amber-700 text-left">
                  {totalPending.toLocaleString()} {getCurrencySymbol()}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-sm text-slate-600">المرضى الجدد</td>
                <td className="py-3 px-4 text-sm font-bold text-blue-700 text-left">
                  {filteredPatients.length}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-sm text-slate-600">إجمالي التحاليل</td>
                <td className="py-3 px-4 text-sm font-bold text-purple-700 text-left">
                  {filteredResults.length}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-sm text-slate-600">التحاليل المكتملة</td>
                <td className="py-3 px-4 text-sm font-bold text-emerald-700 text-left">
                  {completedResults}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-sm text-slate-600">التحاليل المعلقة</td>
                <td className="py-3 px-4 text-sm font-bold text-amber-700 text-left">
                  {pendingResults}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 text-sm text-slate-600">عدد الفواتير</td>
                <td className="py-3 px-4 text-sm font-bold text-slate-800 text-left">
                  {filteredInvoices.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">الفواتير في الفترة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">رقم الفاتورة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">المريض</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">الإجمالي</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">المدفوع</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">الحالة</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.slice(0, 10).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-xs font-mono text-slate-600">{invoice.invoiceNumber}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{invoice.patientName}</td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-700">
                    {invoice.total.toLocaleString()} {getCurrencySymbol()}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {invoice.paid.toLocaleString()} {getCurrencySymbol()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      invoice.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      invoice.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {invoice.paymentStatus === 'paid' ? 'مدفوع' :
                       invoice.paymentStatus === 'partial' ? 'جزئي' : 'غير مدفوع'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">
                    {new Date(invoice.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
