import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Patient } from '@/types';

interface PatientState {
  patients: Patient[];
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  getPatientByCode: (code: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];
  getTodayPatients: () => Patient[];
  generatePatientCode: () => string;
}

let patientCounter = 1;

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: [],

      addPatient: (patient: Patient) => {
        set((state) => ({ patients: [...state.patients, patient] }));
      },

      updatePatient: (id: string, patient: Partial<Patient>) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, ...patient, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deletePatient: (id: string) => {
        set((state) => ({
          patients: state.patients.filter((p) => p.id !== id),
        }));
      },

      getPatientById: (id: string) => {
        return get().patients.find((p) => p.id === id);
      },

      getPatientByCode: (code: string) => {
        return get().patients.find((p) => p.code === code);
      },

      searchPatients: (query: string) => {
        const q = query.toLowerCase();
        return get().patients.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            p.code.toLowerCase().includes(q) ||
            (p.email && p.email.toLowerCase().includes(q))
        );
      },

      getTodayPatients: () => {
        const today = new Date().toDateString();
        return get().patients.filter(
          (p) => new Date(p.createdAt).toDateString() === today
        );
      },

      generatePatientCode: () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const counter = String(patientCounter++).padStart(4, '0');
        return `P${year}${month}${day}-${counter}`;
      },
    }),
    {
      name: 'patient-storage',
    }
  )
);
