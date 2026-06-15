import { useState } from 'react';
import {
  FlaskConical,
  Search,
  Plus,
  X,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Tag,
  TestTube,
} from 'lucide-react';
import { useTestStore } from '@/stores/testStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Test, TestComponent } from '@/types';

interface TestFormData {
  name: string;
  nameEn: string;
  categoryId: string;
  price: string;
  description: string;
  sampleType: string;
  duration: string;
  preparation: string;
  method: string;
  components: TestComponent[];
}

const emptyForm: TestFormData = {
  name: '',
  nameEn: '',
  categoryId: '',
  price: '',
  description: '',
  sampleType: 'دم',
  duration: '24 ساعة',
  preparation: '',
  method: '',
  components: [],
};

export default function Tests() {
  const { tests, categories, addTest, updateTest, deleteTest, addCategory, searchTests, generateTestCode } = useTestStore();
  const { getCurrencySymbol } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestFormData>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [newComponent, setNewComponent] = useState({ name: '', unit: '', normalRange: '' });

  const filteredTests = searchQuery
    ? searchTests(searchQuery)
    : selectedCategory
    ? tests.filter((t) => t.categoryId === selectedCategory)
    : tests;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.price) return;

    const now = new Date().toISOString();
    if (editingId) {
      updateTest(editingId, {
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        sampleType: formData.sampleType,
        duration: formData.duration,
        preparation: formData.preparation || undefined,
        method: formData.method || undefined,
        components: formData.components,
      });
      setEditingId(null);
    } else {
      const newTest: Test = {
        id: `test-${Date.now()}`,
        code: generateTestCode(),
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        sampleType: formData.sampleType,
        duration: formData.duration,
        preparation: formData.preparation || undefined,
        method: formData.method || undefined,
        components: formData.components,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      addTest(newTest);
    }
    setFormData(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (test: Test) => {
    setFormData({
      name: test.name,
      nameEn: test.nameEn || '',
      categoryId: test.categoryId,
      price: String(test.price),
      description: test.description,
      sampleType: test.sampleType,
      duration: test.duration,
      preparation: test.preparation || '',
      method: test.method || '',
      components: test.components || [],
    });
    setEditingId(test.id);
    setShowForm(true);
  };

  const addComponent = () => {
    if (!newComponent.name || !newComponent.unit) return;
    const component: TestComponent = {
      id: `comp-${Date.now()}`,
      name: newComponent.name,
      unit: newComponent.unit,
      normalRange: newComponent.normalRange,
    };
    setFormData({ ...formData, components: [...formData.components, component] });
    setNewComponent({ name: '', unit: '', normalRange: '' });
  };

  const removeComponent = (id: string) => {
    setFormData({ ...formData, components: formData.components.filter((c) => c.id !== id) });
  };

  const handleAddCategory = () => {
    if (!newCategoryName) return;
    addCategory({
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      createdAt: new Date().toISOString(),
    });
    setNewCategoryName('');
    setShowCategoryForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">إدارة التحاليل</h1>
            <p className="text-sm text-slate-500">{tests.length} تحليل مسجل</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-sm"
          >
            <Tag className="w-4 h-4" />
            فئة جديدة
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            إضافة تحليل
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="البحث في التحاليل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">جميع الفئات</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">إضافة فئة جديدة</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="اسم الفئة"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddCategory}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
              >
                إضافة
              </button>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'تعديل تحليل' : 'إضافة تحليل جديد'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">اسم التحليل *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: تعداد الدم الكامل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الإنجليزي</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: Complete Blood Count"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الفئة *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">السعر *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">نوع العينة</label>
                  <input
                    type="text"
                    value={formData.sampleType}
                    onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">مدة التحليل</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">الوصف الكتابي</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows={3}
                    placeholder="وصف مفصل لما يتضمنه التحليل ومعناه والغرض منه..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">التحضير المطلوب</label>
                  <textarea
                    value={formData.preparation}
                    onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows={2}
                    placeholder="مثال: صيام 12 ساعة..."
                  />
                </div>
              </div>

              {/* Components Section */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">مكونات التحليل</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="اسم المكون"
                    value={newComponent.name}
                    onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="الوحدة"
                    value={newComponent.unit}
                    onChange={(e) => setNewComponent({ ...newComponent, unit: e.target.value })}
                    className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="القيمة الطبيعية"
                    value={newComponent.normalRange}
                    onChange={(e) => setNewComponent({ ...newComponent, normalRange: e.target.value })}
                    className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={addComponent}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.components.length > 0 && (
                  <div className="space-y-2">
                    {formData.components.map((comp) => (
                      <div key={comp.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                        <div className="flex gap-4 text-sm">
                          <span className="font-medium">{comp.name}</span>
                          <span className="text-slate-500">{comp.unit}</span>
                          <span className="text-slate-500">{comp.normalRange}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeComponent(comp.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
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
            <p className="text-sm text-slate-500 mb-6">هل أنت متأكد من حذف هذا التحليل؟</p>
            <div className="flex gap-3">
              <button
                onClick={() => { deleteTest(showDeleteConfirm); setShowDeleteConfirm(null); }}
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

      {/* Tests List */}
      {filteredTests.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center shadow-sm">
          <FlaskConical className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">لا يوجد تحاليل</h3>
          <p className="text-sm text-slate-400 mb-4">لم يتم إضافة أي تحاليل بعد</p>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة أول تحليل
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
            >
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
                  <TestTube className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">{test.name}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {categories.find((c) => c.id === test.categoryId)?.name || test.categoryId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{test.description || 'لا يوجد وصف'}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className="text-sm font-bold text-emerald-700">{test.price.toLocaleString()} {getCurrencySymbol()}</p>
                  <p className="text-[10px] text-slate-400">{test.sampleType} | {test.duration}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(test); }}
                    className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(test.id); }}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                  {expandedTest === test.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTest === test.id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                  {test.description && (
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-slate-500 mb-1">الوصف الكتابي</h4>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">{test.description}</p>
                    </div>
                  )}
                  {test.preparation && (
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-slate-500 mb-1">التحضير المطلوب</h4>
                      <p className="text-sm text-slate-700 bg-amber-50 p-3 rounded-xl">{test.preparation}</p>
                    </div>
                  )}
                  {test.method && (
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-slate-500 mb-1">طريقة التحليل</h4>
                      <p className="text-sm text-slate-700">{test.method}</p>
                    </div>
                  )}
                  {test.components && test.components.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 mb-2">مكونات التحليل</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {test.components.map((comp) => (
                          <div key={comp.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                            <span className="text-sm text-slate-700">{comp.name}</span>
                            <span className="text-xs text-slate-500">{comp.unit} | {comp.normalRange}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
