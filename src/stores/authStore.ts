import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, UserRole, Member, Owner } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  members: Member[];
  owners: Owner[];
  login: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  addMember: (member: Member) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addOwner: (owner: Owner) => void;
  updateOwner: (id: string, owner: Partial<Owner>) => void;
  deleteOwner: (id: string) => void;
  hasPermission: (permission: string) => boolean;
  getDefaultOwner: () => Owner | null;
}

const DEFAULT_OWNER: Owner = {
  id: 'owner-default',
  name: 'صاحب المعمل',
  email: 'mhm763517@gmail.com',
  role: 'primary',
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      members: [],
      owners: [DEFAULT_OWNER],

      login: (user: AuthUser) => {
        set({ user, isAuthenticated: true });
        localStorage.setItem('auth_user', JSON.stringify(user));
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('auth_user');
        localStorage.removeItem('google_token');
        localStorage.removeItem('auth_state');
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      addMember: (member: Member) => {
        set((state) => ({ members: [...state.members, member] }));
      },

      updateMember: (id: string, member: Partial<Member>) => {
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...member } : m)),
        }));
      },

      deleteMember: (id: string) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }));
      },

      addOwner: (owner: Owner) => {
        set((state) => ({ owners: [...state.owners, owner] }));
      },

      updateOwner: (id: string, owner: Partial<Owner>) => {
        set((state) => ({
          owners: state.owners.map((o) => (o.id === id ? { ...o, ...owner } : o)),
        }));
      },

      deleteOwner: (id: string) => {
        set((state) => ({
          owners: state.owners.filter((o) => o.id !== id),
        }));
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.isOwner || user.role === 'admin') return true;
        const rolePermissions: Record<UserRole, string[]> = {
          owner: ['*'],
          admin: ['*'],
          receptionist: ['patients.view', 'patients.create', 'invoices.view', 'invoices.create', 'results.view'],
          technician: ['tests.view', 'tests.create', 'results.view', 'results.create', 'results.edit'],
          doctor: ['patients.view', 'tests.view', 'results.view', 'results.create', 'results.edit'],
        };
        const permissions = rolePermissions[user.role] || [];
        return permissions.includes('*') || permissions.includes(permission);
      },

      getDefaultOwner: () => {
        const { owners } = get();
        return owners.find((o) => o.role === 'primary') || owners[0] || null;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ members: state.members, owners: state.owners }),
    }
  )
);
