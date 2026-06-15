export type UserRole = 'owner' | 'admin' | 'receptionist' | 'technician' | 'doctor' | 'doctorAssistant';

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'صاحب المعمل',
  admin: 'مدير النظام',
  receptionist: 'موظف استقبال',
  technician: 'فني المختبر',
  doctor: 'الطبيب المعتمد',
  doctorAssistant: 'مساعد الطبيب'
};

export interface Patient {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  age: number;
  gender: 'male' | 'female';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  nationalId?: string;
  nameEn?: string;
  birthDate?: string;
  bloodType?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientId?: string;
  patientCode?: string;
  date: string;
  time: string;
  type: string;
  testType: string;
  status: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface TestParameter {
  name: string;
  nameAr: string;
  unit: string;
  minNormal: number;
  maxNormal: number;
  value?: string;
  isAbnormal?: boolean;
}

export interface LabTest {
  id: string;
  qrToken: string;
  barcode: string;
  sampleStatus: string;
  patientName: string;
  patientPhone: string;
  patientCode: string;
  testName: string;
  testCode: string;
  price: number;
  createdAt: string;
  requestDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  titleAr?: string;
  testType?: string;
  parameters: TestParameter[];
  cost?: number;
  paidAmount?: number;
  patientId?: string;
  titleEn?: string;
  patientNameEn?: string;
}

export interface DoctorSettings {
  labNameAr: string;
  labNameEn: string;
  clinicName: string;
  labPhone: string;
  doctorName: string;
  doctorLicense: string;
  receptionUsername: string;
  receptionPassword: string;
  doctorEmail: string;
  doctorPasscode: string;
  receptionPermissions: string[];
  allowBiometricBypass: boolean;
  enableTechnicianPlatform: boolean;
  enableAndroidSimulator: boolean;
  canUploadWithFiles: boolean;
  canUploadWithImages: boolean;
  canUploadWithTyping: boolean;
  customTestPricing: Record<string, number>;
  enableGoogleDriveBackup: boolean;
  googleDriveToken: string;
  googleDriveBackupInterval: string;
  enableElectronicPrinter: boolean;
  allowResultCopying: boolean;
  printerConnectionType: string;
  printerIpAddress: string;
  currency: string;
  barcodeLocation: string;
  thermalWidth: string;
}

export interface AppComplaint {
  id: string;
  name: string;
  phone: string;
  category: string;
  details: string;
  testId?: string;
  date: string;
  status: string;
  adminReply?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number;
}

export interface InvoiceTest {
  testId: string;
  testName: string;
  testPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  tests: InvoiceTest[];
  subtotal: number;
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  discountAmount: number;
  total: number;
  paid: number;
  remaining: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isOwner: boolean;
  customRole?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  customRole?: string;
  username?: string;
  password?: string;
  status: 'active' | 'inactive';
  phone?: string;
  permissions?: string[];
  createdAt?: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  role: 'primary' | string;
  password?: string;
  createdAt: string;
  phone?: string;
  username?: string;
}

export interface TestComponent {
  id: string;
  name: string;
  unit: string;
  normalRange: string;
}

export interface Test {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  categoryId: string;
  price: number;
  description?: string;
  sampleType?: string;
  duration?: string;
  preparation?: string;
  method?: string;
  components: TestComponent[];
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface TestCategory {
  id: string;
  name: string;
  nameEn?: string;
  createdAt: string;
}

export interface ComponentResult {
  componentId: string;
  componentName: string;
  unit: string;
  normalRange: string;
  value: string;
  isAbnormal: boolean;
}

export interface TestResult {
  id: string;
  patientId: string;
  testId: string;
  testName: string;
  patientName: string;
  patientCode: string;
  results: ComponentResult[];
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  notes?: string;
  testCode?: string;
}

export interface LabSettings {
  labName: string;
  labAddress: string;
  labPhone: string;
  labEmail: string;
  currency: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
  taxNumber?: string;
  labNameAr?: string;
  labNameEn?: string;
  clinicName?: string;
  doctorName?: string;
  doctorLicense?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  testReady: boolean;
  newPatient: boolean;
  payment: boolean;
  browserNotifications: boolean;
  soundNotifications: boolean;
}

export interface SyncSettings {
  googleDriveEnabled: boolean;
  googleDriveConnected: boolean;
  autoSync: boolean;
  syncFrequency: 'manual' | string;
  lastSync?: string;
}

export interface PageSettings {
  dashboard: boolean;
  patients: boolean;
  tests: boolean;
  results: boolean;
  invoices: boolean;
  reports: boolean;
  settings: boolean;
  order: string[];
}
