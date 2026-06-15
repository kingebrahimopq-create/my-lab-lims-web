import { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import { usePatientStore } from '@/stores/patientStore';
import { useTestStore } from '@/stores/testStore';
import { useInvoiceStore } from '@/stores/invoiceStore';
import type { Patient } from '@/types';

interface PatientFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  age: string;
  gender: 'male' | 'female';
  notes: string;
}

const emptyForm: PatientFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  age: '',
  gender: 'male',
  notes: '',
};

export default function Patients() {
  const { patients, addPatient, updatePatient, deletePatient, searchPatients, generatePatientCode } = usePatientStore();
  const { results } = useTestStore();
  const { invoices } = useInvoiceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PatientFormData>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredPatients = searchQuery ? searchPatients(searchQuery) : patients;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const now = new Date().toISOString();
    if (editingId) {
      updatePatient(editingId, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        notes: formData.notes || undefined,
      });
      setEditingId(null);
    } else {
      const newPatient: Patient = {
        id: `patient-${Date.now()}`,
        code: generatePatientCode(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        notes: formData.notes || undefined,
        createdAt: now,
        updatedAt: now,
      };
      addPatient(newPatient);
    }
    setFormData(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (patient: Patient) => {
    setFormData({
      name: patient.name,
      phone: patient.phone,
      email: patient.email || '',
      address: patient.address || '',
      age: String(patient.age),
      gender: patient.gender,
      notes: patient.notes || '',
    });
    setEditingId(patient.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deletePatient(id);
    setShowDeleteConfirm(null);
  };

  const getPatientTests = (patientId: string) => {
    return results.filter((r) => r.patientId === patientId);
  };

  const getPatientInvoices = (patientId: string) => {
    return invoices.filter((i) => i.patientId === patientId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">إدارة المرضى</h1>
            <p className="text-sm text-slate-500">{patients.length} مريض مسجل</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إضافة مريض
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="البحث بالاسم، الهاتف، أو الكود..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'تعديل مريض' : 'إضافة مريض جديد'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">الاسم *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="اسم المريض الكامل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">العمر</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="العمر بالسنوات"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">النوع</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="عنوان المريض"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="أي ملاحظات إضافية..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {editingId ? 'تحديث' : 'إضافة'}
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
            <p className="text-sm text-slate-500 mb-6">هل أنت متأكد من حذف هذا المريض؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
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

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center shadow-sm">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">لا يوجد مرضى</h3>
          <p className="text-sm text-slate-400 mb-4">لم يتم تسجيل أي مرضى بعد</p>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة أول مريض
          </button>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200">
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">الكود</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">الاسم</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">الهاتف</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">العمر/النوع</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">التحاليل</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">الفواتير</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                        {patient.code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{patient.name}</p>
                          <p className="text-[10px] text-slate-400">{new Date(patient.createdAt).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{patient.phone}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {patient.age > 0 ? `${patient.age} سنة` : '-'} / {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        {getPatientTests(patient.id).length}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                        {getPatientInvoices(patient.id).length}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(patient.id)}
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
