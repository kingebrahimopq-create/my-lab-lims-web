import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LabSettings, NotificationSettings, SyncSettings, PageSettings } from '@/types';

interface SettingsState {
  labSettings: LabSettings;
  notificationSettings: NotificationSettings;
  syncSettings: SyncSettings;
  pageSettings: PageSettings;
  updateLabSettings: (settings: Partial<LabSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateSyncSettings: (settings: Partial<SyncSettings>) => void;
  updatePageSettings: (settings: Partial<PageSettings>) => void;
  getCurrencySymbol: () => string;
  getCurrencyName: () => string;
  resetAllData: () => void;
}

const defaultLabSettings: LabSettings = {
  labName: 'MyLab',
  labAddress: '',
  labPhone: '',
  labEmail: '',
  currency: 'egp',
  language: 'ar',
  theme: 'light',
};

const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  testReady: true,
  newPatient: true,
  payment: true,
  browserNotifications: false,
  soundNotifications: true,
};

const defaultSyncSettings: SyncSettings = {
  googleDriveEnabled: false,
  googleDriveConnected: false,
  autoSync: false,
  syncFrequency: 'manual',
};

const defaultPageSettings: PageSettings = {
  dashboard: true,
  patients: true,
  tests: true,
  results: true,
  invoices: true,
  reports: true,
  settings: true,
  order: ['dashboard', 'patients', 'tests', 'results', 'invoices', 'reports', 'settings'],
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      labSettings: defaultLabSettings,
      notificationSettings: defaultNotificationSettings,
      syncSettings: defaultSyncSettings,
      pageSettings: defaultPageSettings,

      updateLabSettings: (settings: Partial<LabSettings>) => {
        set((state) => ({
          labSettings: { ...state.labSettings, ...settings },
        }));
      },

      updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        }));
      },

      updateSyncSettings: (settings: Partial<SyncSettings>) => {
        set((state) => ({
          syncSettings: { ...state.syncSettings, ...settings },
        }));
      },

      updatePageSettings: (settings: Partial<PageSettings>) => {
        set((state) => ({
          pageSettings: { ...state.pageSettings, ...settings },
        }));
      },

      getCurrencySymbol: () => {
        const symbols: Record<string, string> = {
          egp: 'ج.م',
          usd: '$',
          eur: '€',
          gbp: '£',
        };
        return symbols[get().labSettings.currency] || 'ج.م';
      },

      getCurrencyName: () => {
        const names: Record<string, string> = {
          egp: 'الجنيه المصري',
          usd: 'الدولار الأمريكي',
          eur: 'اليورو',
          gbp: 'الجنيه الإسترليني',
        };
        return names[get().labSettings.currency] || 'الجنيه المصري';
      },

      resetAllData: () => {
        set({
          labSettings: defaultLabSettings,
          notificationSettings: defaultNotificationSettings,
          syncSettings: defaultSyncSettings,
          pageSettings: defaultPageSettings,
        });
        localStorage.clear();
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);
