export interface Patient {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  age: number;
  gender: 'male' | 'female';
  nationalId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCategory {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  createdAt: string;
}

export interface Test {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  categoryId: string;
  price: number;
  description: string;
  components: TestComponent[];
  sampleType: string;
  duration: string;
  preparation?: string;
  method?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestComponent {
  id: string;
  name: string;
  nameEn?: string;
  unit: string;
  normalRange: string;
  normalRangeMin?: number;
  normalRangeMax?: number;
}

export interface TestResult {
  id: string;
  patientId: string;
  testId: string;
  testName: string;
  patientName: string;
  patientCode: string;
  results: ComponentResult[];
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  technicianName?: string;
  verifiedBy?: string;
}

export interface ComponentResult {
  componentId: string;
  componentName: string;
  unit: string;
  normalRange: string;
  value: string;
  isAbnormal: boolean;
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
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface InvoiceTest {
  testId: string;
  testName: string;
  testPrice: number;
  resultId?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  customRole?: string;
  status: 'active' | 'inactive';
  permissions: string[];
  username: string;
  password: string;
  createdAt: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'primary' | 'co';
  googleId?: string;
  username?: string;
  password?: string;
  createdAt: string;
}

export interface LabSettings {
  labName: string;
  labAddress: string;
  labPhone: string;
  labEmail: string;
  labLogo?: string;
  taxNumber?: string;
  commercialRecord?: string;
  currency: 'egp' | 'usd' | 'eur' | 'gbp';
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
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
  syncFrequency: 'daily' | 'weekly' | 'manual';
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

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
}

export type CurrencyCode = 'egp' | 'usd' | 'eur' | 'gbp';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number;
}

export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  scope: string;
  folderId?: string;
}

export type UserRole = 'owner' | 'admin' | 'receptionist' | 'technician' | 'doctor' | 'doctorAssistant';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  customRole?: string;
  isOwner: boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'مالك',
  admin: 'مدير',
  receptionist: 'موظف استقبال',
  technician: 'فني مختبر',
  doctor: 'طبيب',
  doctorAssistant: 'مساعد طبيب',
};
