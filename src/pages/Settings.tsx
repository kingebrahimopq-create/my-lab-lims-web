import { useState } from 'react';
import {
  Settings as SettingsIcon, Building2, DollarSign, Bell, Cloud, Shield,
  Users, UserPlus, Trash2, Plus, Edit2, CheckCircle, Eye, EyeOff,
  GripVertical, AlertTriangle, Lock, Key,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { googleDriveService } from '@/lib/googleDrive';
import { ROLE_LABELS } from '@/types';
import type { UserRole } from '@/types';

const tabs = [
  { icon: Building2, label: 'إعدادات المعمل', id: 'lab' },
  { icon: DollarSign, label: 'العملة', id: 'currency' },
  { icon: Users, label: 'الأعضاء', id: 'members' },
  { icon: UserPlus, label: 'الملاك', id: 'owners' },
  { icon: Eye, label: 'الصفحات', id: 'pages' },
  { icon: Cloud, label: 'Google Drive', id: 'drive' },
  { icon: Bell, label: 'الإشعارات', id: 'notifications' },
  { icon: Shield, label: 'الخصوصية', id: 'privacy' },
  { icon: Trash2, label: 'البيانات', id: 'data' },
];

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'مدير' },
  { value: 'receptionist', label: 'موظف استقبال' },
  { value: 'technician', label: 'فني مختبر' },
  { value: 'doctor', label: 'طبيب' },
  { value: 'doctorAssistant', label: 'مساعد طبيب' },
];

const emptyMemberForm = { name: '', email: '', phone: '', role: 'receptionist', customRole: '', status: 'active', username: '', password: '' };
const emptyOwnerForm = { name: '', email: '', phone: '', role: 'co', username: '', password: '' };

export default function Settings() {
  const [activeTab, setActiveTab] = useState('lab');
  const { labSettings, updateLabSettings, notificationSettings, updateNotificationSettings, syncSettings, updateSyncSettings, pageSettings, updatePageSettings, resetAllData } = useSettingsStore();
  const { members, owners, addMember, updateMember, deleteMember, addOwner, updateOwner, deleteOwner } = useAuthStore();
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [ownerForm, setOwnerForm] = useState(emptyOwnerForm);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editingOwner, setEditingOwner] = useState<string | null>(null);
  const [driveConnecting, setDriveConnecting] = useState(false);
  const [showMemberPwd, setShowMemberPwd] = useState(false);
  const [showOwnerPwd, setShowOwnerPwd] = useState(false);

  const handleSaveMember = () => {
    if (!memberForm.name || !memberForm.email || !memberForm.username) return;
    if (editingMember) {
      updateMember(editingMember, {
        name: memberForm.name, email: memberForm.email,
        phone: memberForm.phone || undefined,
        role: memberForm.role as UserRole,
        customRole: memberForm.customRole || undefined,
        status: memberForm.status as 'active' | 'inactive',
        username: memberForm.username,
        ...(memberForm.password ? { password: memberForm.password } : {}),
      });
      setEditingMember(null);
    } else {
      if (!memberForm.password) return;
      addMember({
        id: `member-${Date.now()}`, name: memberForm.name, email: memberForm.email,
        phone: memberForm.phone || undefined, role: memberForm.role as UserRole,
        customRole: memberForm.customRole || undefined,
        status: memberForm.status as 'active' | 'inactive',
        username: memberForm.username, password: memberForm.password,
        permissions: [], createdAt: new Date().toISOString(),
      });
    }
    setMemberForm(emptyMemberForm);
    setShowMemberForm(false);
  };

  const handleSaveOwner = () => {
    if (!ownerForm.name || !ownerForm.email) return;
    if (editingOwner) {
      updateOwner(editingOwner, {
        name: ownerForm.name, email: ownerForm.email,
        phone: ownerForm.phone || undefined, role: ownerForm.role as 'co' | 'primary',
        username: ownerForm.username || undefined,
        ...(ownerForm.password ? { password: ownerForm.password } : {}),
      });
      setEditingOwner(null);
    } else {
      addOwner({
        id: `owner-${Date.now()}`, name: ownerForm.name, email: ownerForm.email,
        phone: ownerForm.phone || undefined, role: ownerForm.role as 'co' | 'primary',
        username: ownerForm.username || undefined, password: ownerForm.password || undefined,
        createdAt: new Date().toISOString(),
      });
    }
    setOwnerForm(emptyOwnerForm);
    setShowOwnerForm(false);
  };

  const handleConnectDrive = async () => {
    setDriveConnecting(true);
    try {
      const success = await googleDriveService.signIn();
      if (success) updateSyncSettings({ googleDriveConnected: true, googleDriveEnabled: true });
    } finally { setDriveConnecting(false); }
  };

  const handleDisconnectDrive = async () => {
    await googleDriveService.signOut();
    updateSyncSettings({ googleDriveConnected: false, googleDriveEnabled: false });
  };

  const handleBackup = async () => {
    const data = {
      patients: localStorage.getItem('patient-storage'),
      tests: localStorage.getItem('test-storage'),
      invoices: localStorage.getItem('invoice-storage'),
      auth: localStorage.getItem('auth-storage'),
      settings: localStorage.getItem('settings-storage'),
    };
    const success = await googleDriveService.backupData(data);
    if (success) { updateSyncSettings({ lastSync: new Date().toISOString() }); alert('تم النسخ الاحتياطي بنجاح'); }
    else { alert('فشل النسخ الاحتياطي'); }
  };

  const handleReset = () => { resetAllData(); setShowResetConfirm(false); window.location.reload(); };

  const inputCls = 'px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none';
  const pgSettings = pageSettings as unknown as Record<string, boolean>;
  const ntSettings = notificationSettings as unknown as Record<string, boolean>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-200">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div><h1 className="text-xl font-bold text-slate-800">الإعدادات</h1><p className="text-sm text-slate-500">تخصيص وتكوين النظام</p></div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200' : 'bg-white/70 text-slate-600 hover:bg-white border border-slate-200'}`}>
            <tab.icon className="w-4 h-4" /><span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'lab' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">إعدادات المعمل</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">اسم المعمل</label><input type="text" value={labSettings.labName} onChange={(e) => updateLabSettings({ labName: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">الهاتف</label><input type="text" value={labSettings.labPhone} onChange={(e) => updateLabSettings({ labPhone: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label><input type="email" value={labSettings.labEmail} onChange={(e) => updateLabSettings({ labEmail: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">الرقم الضريبي</label><input type="text" value={labSettings.taxNumber || ''} onChange={(e) => updateLabSettings({ taxNumber: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label><textarea value={labSettings.labAddress} onChange={(e) => updateLabSettings({ labAddress: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} /></div>
          </div>
        </div>
      )}

      {activeTab === 'currency' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">إعدادات العملة</h3>
          <div className="space-y-3">
            {[{code:'egp' as const,name:'الجنيه المصري',symbol:'ج.م'},{code:'usd' as const,name:'الدولار الأمريكي',symbol:'$'},{code:'eur' as const,name:'اليورو',symbol:'€'},{code:'gbp' as const,name:'الجنيه الإسترليني',symbol:'£'}].map((c) => (
              <label key={c.code} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${labSettings.currency === c.code ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="currency" checked={labSettings.currency === c.code} onChange={() => updateLabSettings({ currency: c.code })} className="w-4 h-4 text-blue-600" />
                <div className="flex-1"><p className="text-sm font-medium text-slate-700">{c.name}</p><p className="text-xs text-slate-500">{c.symbol}</p></div>
                {labSettings.currency === c.code && <CheckCircle className="w-5 h-5 text-blue-600" />}
              </label>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">إدارة الأعضاء</h3>
            <button onClick={() => { setShowMemberForm(true); setEditingMember(null); setMemberForm(emptyMemberForm); }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />إضافة عضو
            </button>
          </div>
          {showMemberForm && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
              <p className="text-sm font-semibold text-slate-700">{editingMember ? 'تعديل عضو' : 'إضافة عضو جديد'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className={inputCls} type="text" placeholder="الاسم *" value={memberForm.name} onChange={(e) => setMemberForm({...memberForm,name:e.target.value})} />
                <input className={inputCls} type="email" placeholder="البريد الإلكتروني *" value={memberForm.email} onChange={(e) => setMemberForm({...memberForm,email:e.target.value})} />
                <input className={inputCls} type="tel" placeholder="الهاتف" value={memberForm.phone} onChange={(e) => setMemberForm({...memberForm,phone:e.target.value})} />
                <select className={inputCls} value={memberForm.role} onChange={(e) => setMemberForm({...memberForm,role:e.target.value})}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <input className={`${inputCls} sm:col-span-2`} type="text" placeholder="دور مخصص (اختياري)" value={memberForm.customRole} onChange={(e) => setMemberForm({...memberForm,customRole:e.target.value})} />
                <div className="relative">
                  <Key className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input className={`w-full pr-8 pl-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`} type="text" placeholder="اسم المستخدم *" dir="ltr" value={memberForm.username} onChange={(e) => setMemberForm({...memberForm,username:e.target.value})} />
                </div>
                <div className="relative">
                  <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input className={`w-full pr-8 pl-8 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`} type={showMemberPwd ? 'text' : 'password'} placeholder={editingMember ? 'كلمة المرور (فارغة = لا تغيير)' : 'كلمة المرور *'} dir="ltr" value={memberForm.password} onChange={(e) => setMemberForm({...memberForm,password:e.target.value})} />
                  <button type="button" onClick={() => setShowMemberPwd(!showMemberPwd)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">{showMemberPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                </div>
                <select className={inputCls} value={memberForm.status} onChange={(e) => setMemberForm({...memberForm,status:e.target.value})}>
                  <option value="active">نشط</option><option value="inactive">غير نشط</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveMember} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">حفظ</button>
                <button onClick={() => setShowMemberForm(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">إلغاء</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">لا يوجد أعضاء — أضف أعضاء لمنحهم صلاحية الدخول</p>
            ) : members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${member.status === 'active' ? 'bg-blue-500' : 'bg-slate-400'}`}>{member.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {member.name}
                      {member.customRole && <span className="mr-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">{member.customRole}</span>}
                    </p>
                    <p className="text-xs text-slate-500">{ROLE_LABELS[member.role]} | {member.username || member.email}{member.status === 'inactive' && <span className="mr-1 text-red-500"> (غير نشط)</span>}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingMember(member.id); setMemberForm({name:member.name,email:member.email,phone:member.phone||'',role:member.role,customRole:member.customRole||'',status:member.status,username:member.username||'',password:''}); setShowMemberForm(true); }} className="p-1.5 hover:bg-blue-100 rounded-lg"><Edit2 className="w-4 h-4 text-blue-600" /></button>
                  <button onClick={() => setShowDeleteConfirm(`member-${member.id}`)} className="p-1.5 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'owners' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">إدارة الملاك</h3>
            <button onClick={() => { setShowOwnerForm(true); setEditingOwner(null); setOwnerForm(emptyOwnerForm); }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />إضافة مالك
            </button>
          </div>
          {showOwnerForm && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
              <p className="text-sm font-semibold text-slate-700">{editingOwner ? 'تعديل مالك' : 'إضافة مالك جديد'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className={inputCls} type="text" placeholder="الاسم *" value={ownerForm.name} onChange={(e) => setOwnerForm({...ownerForm,name:e.target.value})} />
                <input className={inputCls} type="email" placeholder="البريد الإلكتروني *" value={ownerForm.email} onChange={(e) => setOwnerForm({...ownerForm,email:e.target.value})} />
                <input className={inputCls} type="tel" placeholder="الهاتف" value={ownerForm.phone} onChange={(e) => setOwnerForm({...ownerForm,phone:e.target.value})} />
                <select className={inputCls} value={ownerForm.role} onChange={(e) => setOwnerForm({...ownerForm,role:e.target.value})}>
                  <option value="co">شريك</option><option value="primary">مالك رئيسي</option>
                </select>
                <div className="relative">
                  <Key className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input className="w-full pr-8 pl-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" type="text" placeholder="اسم المستخدم" dir="ltr" value={ownerForm.username} onChange={(e) => setOwnerForm({...ownerForm,username:e.target.value})} />
                </div>
                <div className="relative">
                  <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input className="w-full pr-8 pl-8 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" type={showOwnerPwd ? 'text' : 'password'} placeholder={editingOwner ? 'كلمة المرور (فارغة = لا تغيير)' : 'كلمة المرور'} dir="ltr" value={ownerForm.password} onChange={(e) => setOwnerForm({...ownerForm,password:e.target.value})} />
                  <button type="button" onClick={() => setShowOwnerPwd(!showOwnerPwd)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">{showOwnerPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveOwner} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">حفظ</button>
                <button onClick={() => setShowOwnerForm(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">إلغاء</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {owners.map((owner) => (
              <div key={owner.id} className={`flex items-center justify-between p-3 rounded-xl ${owner.role === 'primary' ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${owner.role === 'primary' ? 'bg-amber-500' : 'bg-blue-500'}`}>{owner.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{owner.name}{owner.role === 'primary' && <span className="mr-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">مالك رئيسي</span>}</p>
                    <p className="text-xs text-slate-500">{owner.email}{owner.username ? ` | ${owner.username}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingOwner(owner.id); setOwnerForm({name:owner.name,email:owner.email,phone:owner.phone||'',role:owner.role,username:owner.username||'',password:''}); setShowOwnerForm(true); }} className="p-1.5 hover:bg-blue-100 rounded-lg"><Edit2 className="w-4 h-4 text-blue-600" /></button>
                  {owner.role !== 'primary' && <button onClick={() => setShowDeleteConfirm(`owner-${owner.id}`)} className="p-1.5 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">تخصيص الصفحات</h3>
          <div className="space-y-3">
            {[{key:'dashboard',label:'لوحة التحكم'},{key:'patients',label:'المرضى'},{key:'tests',label:'التحاليل'},{key:'results',label:'النتائج'},{key:'invoices',label:'الفواتير'},{key:'reports',label:'التقارير'},{key:'settings',label:'الإعدادات'}].map((page) => (
              <div key={page.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3"><GripVertical className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{page.label}</span></div>
                <button onClick={() => { const key = page.key as keyof typeof pageSettings; updatePageSettings({ [key]: !pageSettings[key] }); }} className={`p-2 rounded-lg transition-colors ${pgSettings[page.key] ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                  {pgSettings[page.key] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'drive' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">مزامنة Google Drive</h3>
          <div className={`p-4 rounded-xl border ${syncSettings.googleDriveConnected ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${syncSettings.googleDriveConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}><Cloud className="w-5 h-5 text-white" /></div>
                <div><p className="text-sm font-medium text-slate-700">{syncSettings.googleDriveConnected ? 'متصل بـ Google Drive' : 'غير متصل'}</p>{syncSettings.lastSync && <p className="text-xs text-slate-500">آخر مزامنة: {new Date(syncSettings.lastSync).toLocaleString('ar-EG')}</p>}</div>
              </div>
              {syncSettings.googleDriveConnected ? (
                <button onClick={handleDisconnectDrive} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">فصل</button>
              ) : (
                <button onClick={handleConnectDrive} disabled={driveConnecting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">{driveConnecting ? 'جاري الاتصال...' : 'ربط'}</button>
              )}
            </div>
          </div>
          {syncSettings.googleDriveConnected && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تكرار المزامنة</label>
                <select value={syncSettings.syncFrequency} onChange={(e) => updateSyncSettings({ syncFrequency: e.target.value as 'daily'|'weekly'|'manual' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="manual">يدوي</option><option value="daily">يومي</option><option value="weekly">أسبوعي</option>
                </select>
              </div>
              <button onClick={handleBackup} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">نسخ احتياطي الآن</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">إعدادات الإشعارات</h3>
          <div className="space-y-3">
            {[{key:'enabled',label:'تفعيل الإشعارات',desc:'تمكين الإشعارات العامة'},{key:'testReady',label:'جاهزية التحليل',desc:'إشعار عند اكتمال نتيجة تحليل'},{key:'newPatient',label:'مريض جديد',desc:'إشعار عند تسجيل مريض جديد'},{key:'payment',label:'الدفع',desc:'إشعار عند تسجيل دفعة'}].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div><p className="text-sm font-medium text-slate-700">{item.label}</p><p className="text-xs text-slate-500">{item.desc}</p></div>
                <button onClick={() => { const key = item.key as keyof typeof notificationSettings; updateNotificationSettings({ [key]: !ntSettings[item.key] }); }} className={`relative w-12 h-6 rounded-full transition-colors ${ntSettings[item.key] ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ntSettings[item.key] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">حماية خصوصية الملكية</h3>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"><div className="flex items-start gap-3"><Shield className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-blue-800">حماية البيانات</p><p className="text-xs text-blue-600 mt-1">يتم تخزين جميع البيانات محلياً في متصفحك. لا يتم إرسال أي بيانات إلى خوادم خارجية باستثناء المزامنة الاختيارية مع Google Drive.</p></div></div></div>
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl"><div className="flex items-start gap-3"><Key className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-amber-800">بيانات الدخول الافتراضية</p><p className="text-xs text-amber-600 mt-1">اسم المستخدم: <span className="font-mono font-bold">admin</span> — كلمة المرور: <span className="font-mono font-bold">Admin@1234</span><br/>يُنصح بتغيير كلمة المرور فور أول دخول من إعدادات الملاك.</p></div></div></div>
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl"><div className="flex items-start gap-3"><CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-emerald-800">التحكم في الوصول</p><p className="text-xs text-emerald-600 mt-1">يمكن للمالك فقط إدارة الأعضاء والملاك وإعدادات الدخول. يتم التحقق من الصلاحيات لكل إجراء.</p></div></div></div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">إدارة البيانات</h3>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl"><div className="flex items-start gap-3"><AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-red-800">مسح جميع البيانات</p><p className="text-xs text-red-600 mt-1">سيؤدي هذا الإجراء إلى حذف جميع البيانات بشكل نهائي. لا يمكن التراجع.</p><button onClick={() => setShowResetConfirm(true)} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">مسح جميع البيانات</button></div></div></div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4"><Trash2 className="w-7 h-7 text-red-600" /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">تأكيد الحذف</h3>
            <p className="text-sm text-slate-500 mb-6">هل أنت متأكد من هذا الإجراء؟</p>
            <div className="flex gap-3">
              <button onClick={() => { const parts = showDeleteConfirm.split('-'); const type = parts[0]; const id = parts.slice(1).join('-'); if(type==='member') deleteMember(id); else if(type==='owner') deleteOwner(id); setShowDeleteConfirm(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">حذف</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4"><AlertTriangle className="w-7 h-7 text-red-600" /></div>
            <h3 className="text-lg font-bold text-red-800 mb-2">تأكيد مسح جميع البيانات</h3>
            <p className="text-sm text-slate-500 mb-6">سيؤدي هذا إلى حذف جميع المرضى والتحاليل والفواتير والإعدادات بشكل نهائي.</p>
            <div className="flex gap-3">
              <button onClick={handleReset} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">نعم، مسح الكل</button>
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
