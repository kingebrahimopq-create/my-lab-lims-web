import { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  X,
  Printer,
  Download,
} from 'lucide-react';
import { useTestStore } from '@/stores/testStore';
import { exportToPDF, exportToExcel, exportToCSV, exportToWord, printDocument } from '@/lib/exportUtils';
import type { TestResult, ComponentResult } from '@/types';

export default function Results() {
  const { results, updateResult } = useTestStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editingResult, setEditingResult] = useState<string | null>(null);
  const [resultValues, setResultValues] = useState<Record<string, string>>({});
  const [resultNotes, setResultNotes] = useState('');

  const filteredResults = results.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.patientName.includes(searchQuery) ||
      r.testName.includes(searchQuery) ||
      r.patientCode.includes(searchQuery);
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStartEditing = (result: TestResult) => {
    setEditingResult(result.id);
    const values: Record<string, string> = {};
    result.results.forEach((r) => {
      values[r.componentId] = r.value;
    });
    setResultValues(values);
    setResultNotes(result.notes || '');
  };

  const handleSaveResult = (result: TestResult) => {
    const updatedResults: ComponentResult[] = result.results.map((r) => {
      const newValue = resultValues[r.componentId] || r.value;
      return {
        ...r,
        value: newValue,
        isAbnormal: checkAbnormal(newValue, r.normalRange),
      };
    });

    updateResult(result.id, {
      results: updatedResults,
      notes: resultNotes,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    setEditingResult(null);
  };

  const checkAbnormal = (value: string, normalRange: string): boolean => {
    if (!value || !normalRange) return false;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    const range = normalRange.split('-').map((s) => parseFloat(s.trim()));
    if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
      return numValue < range[0] || numValue > range[1];
    }
    if (normalRange.includes('<') || normalRange.includes('>')) {
      const threshold = parseFloat(normalRange.replace(/[^0-9.]/g, ''));
      if (!isNaN(threshold)) {
        if (normalRange.includes('<')) return numValue >= threshold;
        if (normalRange.includes('>')) return numValue <= threshold;
      }
    }
    return false;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'معلق';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleExportResult = (result: TestResult, format: 'pdf' | 'excel' | 'csv' | 'word') => {
    const headers = ['المكون', 'القيمة', 'الوحدة', 'القيمة الطبيعية', 'الحالة'];
    const data = result.results.map((r) => [
      r.componentName,
      r.value || '-',
      r.unit,
      r.normalRange,
      r.isAbnormal ? 'غير طبيعي' : 'طبيعي',
    ]);
    const filename = `result_${result.patientCode}_${result.testName}`;

    switch (format) {
      case 'pdf':
        exportToPDF(`نتيجة التحليل - ${result.testName}`, headers, data, filename);
        break;
      case 'excel':
        exportToExcel(headers, data, filename);
        break;
      case 'csv':
        exportToCSV(headers, data, filename);
        break;
      case 'word':
        exportToWord(`نتيجة التحليل - ${result.testName}`, headers, data, filename);
        break;
    }
  };

  const handlePrintResult = (result: TestResult) => {
    const content = `
      <div style="margin-bottom: 20px;">
        <p><strong>المريض:</strong> ${result.patientName}</p>
        <p><strong>كود المريض:</strong> ${result.patientCode}</p>
        <p><strong>التحليل:</strong> ${result.testName}</p>
        <p><strong>التاريخ:</strong> ${new Date(result.createdAt).toLocaleDateString('ar-EG')}</p>
        ${result.notes ? `<p><strong>ملاحظات:</strong> ${result.notes}</p>` : ''}
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#2980b9;color:white">
            <th style="border:1px solid #ddd;padding:8px">المكون</th>
            <th style="border:1px solid #ddd;padding:8px">القيمة</th>
            <th style="border:1px solid #ddd;padding:8px">الوحدة</th>
            <th style="border:1px solid #ddd;padding:8px">القيمة الطبيعية</th>
            <th style="border:1px solid #ddd;padding:8px">الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${result.results
            .map(
              (r) => `
            <tr style="${r.isAbnormal ? 'background:#fff3cd' : ''}">
              <td style="border:1px solid #ddd;padding:8px">${r.componentName}</td>
              <td style="border:1px solid #ddd;padding:8px;font-weight:bold;color:${r.isAbnormal ? '#dc3545' : '#28a745'}">${r.value || '-'}</td>
              <td style="border:1px solid #ddd;padding:8px">${r.unit}</td>
              <td style="border:1px solid #ddd;padding:8px">${r.normalRange}</td>
              <td style="border:1px solid #ddd;padding:8px">${r.isAbnormal ? 'غير طبيعي' : 'طبيعي'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
    printDocument(`نتيجة التحليل - ${result.testName}`, content);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">نتائج التحاليل</h1>
            <p className="text-sm text-slate-500">{results.length} نتيجة مسجلة</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="البحث بالمريض أو التحليل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">جميع الحالات</option>
          <option value="pending">معلق</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center shadow-sm">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">لا توجد نتائج</h3>
          <p className="text-sm text-slate-400">لم يتم تسجيل أي نتائج بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <div
              key={result.id}
              className={`bg-white/70 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden ${
                result.status === 'pending' ? 'border-amber-200' : 'border-slate-200/60'
              }`}
            >
              {/* Result Header */}
              <div className="p-4 flex items-center gap-4">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-800">{result.testName}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusClass(result.status)}`}>
                      {getStatusText(result.status)}
                    </span>
                    {result.results.some((r) => r.isAbnormal) && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        قيم غير طبيعية
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {result.patientName} - {result.patientCode} | {new Date(result.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {result.status === 'pending' && (
                    <button
                      onClick={() => handleStartEditing(result)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                    >
                      إدخال النتيجة
                    </button>
                  )}
                  {result.status === 'completed' && (
                    <>
                      <button
                        onClick={() => handlePrintResult(result)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="طباعة"
                      >
                        <Printer className="w-4 h-4 text-slate-600" />
                      </button>
                      <div className="relative group">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="تصدير">
                          <Download className="w-4 h-4 text-slate-600" />
                        </button>
                        <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 hidden group-hover:flex flex-col gap-1 z-10 min-w-[120px]">
                          <button onClick={() => handleExportResult(result, 'pdf')} className="text-xs text-right px-3 py-2 hover:bg-slate-50 rounded-lg">تصدير PDF</button>
                          <button onClick={() => handleExportResult(result, 'excel')} className="text-xs text-right px-3 py-2 hover:bg-slate-50 rounded-lg">تصدير Excel</button>
                          <button onClick={() => handleExportResult(result, 'csv')} className="text-xs text-right px-3 py-2 hover:bg-slate-50 rounded-lg">تصدير CSV</button>
                          <button onClick={() => handleExportResult(result, 'word')} className="text-xs text-right px-3 py-2 hover:bg-slate-50 rounded-lg">تصدير Word</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Edit Form */}
              {editingResult === result.id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                  <div className="space-y-3">
                    {result.results.map((component) => (
                      <div key={component.componentId} className="flex items-center gap-3">
                        <label className="text-sm font-medium text-slate-700 w-32 shrink-0">
                          {component.componentName}
                        </label>
                        <input
                          type="text"
                          value={resultValues[component.componentId] || ''}
                          onChange={(e) =>
                            setResultValues({ ...resultValues, [component.componentId]: e.target.value })
                          }
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder={`القيمة (${component.unit})`}
                        />
                        <span className="text-xs text-slate-400 w-24 shrink-0">{component.normalRange}</span>
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
                      <textarea
                        value={resultNotes}
                        onChange={(e) => setResultNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveResult(result)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        حفظ النتيجة
                      </button>
                      <button
                        onClick={() => setEditingResult(null)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed Results Display */}
              {result.status === 'completed' && editingResult !== result.id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">المكون</th>
                          <th className="text-center py-2 px-3 text-xs font-medium text-slate-500">القيمة</th>
                          <th className="text-center py-2 px-3 text-xs font-medium text-slate-500">الوحدة</th>
                          <th className="text-center py-2 px-3 text-xs font-medium text-slate-500">القيمة الطبيعية</th>
                          <th className="text-center py-2 px-3 text-xs font-medium text-slate-500">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results.map((r) => (
                          <tr key={r.componentId} className={r.isAbnormal ? 'bg-red-50' : ''}>
                            <td className="py-2 px-3 text-sm text-slate-700">{r.componentName}</td>
                            <td className={`py-2 px-3 text-sm text-center font-bold ${r.isAbnormal ? 'text-red-600' : 'text-emerald-600'}`}>
                              {r.value || '-'}
                            </td>
                            <td className="py-2 px-3 text-sm text-center text-slate-500">{r.unit}</td>
                            <td className="py-2 px-3 text-sm text-center text-slate-500">{r.normalRange}</td>
                            <td className="py-2 px-3 text-center">
                              {r.isAbnormal ? (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">غير طبيعي</span>
                              ) : (
                                <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">طبيعي</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.notes && (
                    <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                      <strong>ملاحظات:</strong> {result.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
