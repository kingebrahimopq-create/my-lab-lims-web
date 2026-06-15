import { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  X,
  Trash2,
} from 'lucide-react';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { usePatientStore } from '@/stores/patientStore';
import { useTestStore } from '@/stores/testStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import type { InvoiceTest, Invoice } from '@/types';

interface InvoiceFormData {
  patientId: string;
  selectedTests: string[];
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: string;
  paid: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
}

const emptyForm: InvoiceFormData = {
  patientId: '',
  selectedTests: [],
  discountType: 'none',
  discountValue: '0',
  paid: '0',
  paymentMethod: 'cash',
};

export default function Invoices() {
  const { invoices, addInvoice, deleteInvoice, generateInvoiceNumber, calculateTotals } = useInvoiceStore();
  const { patients, searchPatients } = usePatientStore();
  const { tests, addResult } = useTestStore();
  const { getCurrencySymbol } = useSettingsStore();
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');

  const filteredInvoices = searchQuery
    ? invoices.filter(
        (i) =>
          i.patientName.includes(searchQuery) ||
          i.invoiceNumber.includes(searchQuery) ||
          i.patientCode.includes(searchQuery)
      )
    : invoices;

  const selectedPatient = patients.find((p) => p.id === formData.patientId);

  const selectedTests = tests.filter((t) => formData.selectedTests.includes(t.id));
  const totals = calculateTotals(
    selectedTests.map((t) => ({ testId: t.id, testName: t.name, testPrice: t.price })),
    formData.discountType,
    parseFloat(formData.discountValue) || 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || formData.selectedTests.length === 0) return;

    const patient = patients.find((p) => p.id === formData.patientId);
    if (!patient) return;

    const invoiceTests: InvoiceTest[] = selectedTests.map((t) => ({
      testId: t.id,
      testName: t.name,
      testPrice: t.price,
    }));

    const paid = parseFloat(formData.paid) || 0;
    const now = new Date().toISOString();

    const newInvoice: Invoice = {
      id: `invoice-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      patientId: patient.id,
      patientName: patient.name,
      patientCode: patient.code,
      tests: invoiceTests,
      subtotal: totals.subtotal,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue) || 0,
      discountAmount: totals.discountAmount,
      total: totals.total,
      paid,
      remaining: Math.max(0, totals.total - paid),
      paymentStatus: paid >= totals.total ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
      paymentMethod: formData.paymentMethod,
      createdAt: now,
      updatedAt: now,
      createdBy: user?.name || 'System',
    };
    addInvoice(newInvoice);

    // Create test results entries
    selectedTests.forEach((test) => {
      const resultId = `result-${Date.now()}-${test.id}`;
      addResult({
        id: resultId,
        patientId: patient.id,
        testId: test.id,
        testName: test.name,
        patientName: patient.name,
        patientCode: patient.code,
        results: (test.components || []).map((comp) => ({
          componentId: comp.id,
          componentName: comp.name,
          unit: comp.unit,
          normalRange: comp.normalRange,
          value: '',
          isAbnormal: false,
        })),
        status: 'pending',
        createdAt: now,
      });
    });

    setFormData(emptyForm);
    setShowForm(false);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوع';
      case 'partial':
        return 'جزئي';
      case 'unpaid':
        return 'غير مدفوع';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700';
      case 'partial':
        return 'bg-amber-100 text-amber-700';
      case 'unpaid':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">إدارة الفواتير</h1>
            <p className="text-sm text-slate-500">{invoices.length} فاتورة مسجلة</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormData(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إنشاء فاتورة
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="البحث في الفواتير..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">إنشاء فاتورة جديدة</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اختيار المريض *</label>
                <input
                  type="text"
                  placeholder="البحث عن مريض..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-2"
                />
                {patientSearch && (
                  <div className="border border-slate-200 rounded-xl max-h-32 overflow-y-auto mb-2">
                    {searchPatients(patientSearch).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, patientId: p.id });
                          setPatientSearch(p.name);
                        }}
                        className="w-full text-right px-4 py-2 text-sm hover:bg-amber-50 transition-colors"
                      >
                        {p.name} - {p.phone}
                      </button>
                    ))}
                  </div>
                )}
                {selectedPatient && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{selectedPatient.name}</p>
                      <p className="text-xs text-slate-500">{selectedPatient.code} | {selectedPatient.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Test Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اختيار التحاليل *</label>
                <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                  {tests.filter((t) => t.isActive !== false).map((test) => (
                    <label
                      key={test.id}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedTests.includes(test.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, selectedTests: [...formData.selectedTests, test.id] });
                          } else {
                            setFormData({
                              ...formData,
                              selectedTests: formData.selectedTests.filter((id) => id !== test.id),
                            });
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{test.name}</p>
                        <p className="text-xs text-slate-400">{test.sampleType} | {test.duration}</p>
                      </div>
                      <span className="text-sm font-medium text-amber-700">{test.price.toLocaleString()} {getCurrencySymbol()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">نوع الخصم</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' | 'none' })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="none">بدون خصم</option>
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                {formData.discountType !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {formData.discountType === 'percentage' ? 'نسبة الخصم (%)' : 'مبلغ الخصم'}
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                    />
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ المدفوع</label>
                  <input
                    type="number"
                    value={formData.paid}
                    onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'cash' | 'card' | 'transfer' | 'other' })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="cash">نقدي</option>
                    <option value="card">بطاقة</option>
                    <option value="transfer">تحويل بنكي</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">المجموع الفرعي:</span>
                  <span className="font-medium">{totals.subtotal.toLocaleString()} {getCurrencySymbol()}</span>
                </div>
                {formData.discountType !== 'none' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">الخصم:</span>
                    <span className="font-medium text-red-600">-{totals.discountAmount.toLocaleString()} {getCurrencySymbol()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
                  <span>الإجمالي:</span>
                  <span className="text-amber-700">{totals.total.toLocaleString()} {getCurrencySymbol()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">المدفوع:</span>
                  <span className="font-medium text-emerald-600">{(parseFloat(formData.paid) || 0).toLocaleString()} {getCurrencySymbol()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">المتبقي:</span>
                  <span className="font-medium text-red-600">{Math.max(0, totals.total - (parseFloat(formData.paid) || 0)).toLocaleString()} {getCurrencySymbol()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  إنشاء الفاتورة
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">تأكيد الحذف</h3>
            <p className="text-sm text-slate-500 mb-6">هل أنت متأكد من حذف هذه الفاتورة؟</p>
            <div className="flex gap-3">
              <button
                onClick={() => { deleteInvoice(showDeleteConfirm); setShowDeleteConfirm(null); }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
              >
                حذف
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center shadow-sm">
          <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">لا توجد فواتير</h3>
          <p className="text-sm text-slate-400 mb-4">لم يتم إنشاء أي فواتير بعد</p>
          <button
            onClick={() => { setShowForm(true); setFormData(emptyForm); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إنشاء أول فاتورة
          </button>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200">
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">رقم الفاتورة</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">المريض</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">التحاليل</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">الإجمالي</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">المدفوع</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">الحالة</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">التاريخ</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-amber-50/50 transition-colors group">
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-slate-700">{invoice.patientName}</p>
                      <p className="text-xs text-slate-400">{invoice.patientCode}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {invoice.tests.length} تحليل
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-slate-700">
                      {invoice.total.toLocaleString()} {getCurrencySymbol()}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {invoice.paid.toLocaleString()} {getCurrencySymbol()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(invoice.paymentStatus)}`}>
                        {getStatusText(invoice.paymentStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(invoice.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setShowDeleteConfirm(invoice.id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
