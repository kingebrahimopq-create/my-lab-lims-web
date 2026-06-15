import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Patient } from '@/types';

interface PatientState {
  patients: Patient[];
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatient: (id: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];
  generatePatientCode: () => string;
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: [],
      addPatient: (patient: Patient) => {
        set((state) => ({ patients: [...state.patients, patient] }));
      },
      updatePatient: (id: string, patient: Partial<Patient>) => {
        set((state) => ({
          patients: state.patients.map((p) => (p.id === id ? { ...p, ...patient } : p)),
        }));
      },
      deletePatient: (id: string) => {
        set((state) => ({ patients: state.patients.filter((p) => p.id !== id) }));
      },
      getPatient: (id: string) => {
        return get().patients.find((p) => p.id === id);
      },
      searchPatients: (query: string) => {
        const { patients } = get();
        const q = query.toLowerCase();
        return patients.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            p.code.toLowerCase().includes(q) ||
            (p.email && p.email.toLowerCase().includes(q)) ||
            (p.nationalId && p.nationalId.includes(q))
        );
      },
      generatePatientCode: () => {
        const patients = get().patients;
        const seq = String(patients.length + 1).padStart(4, '0');
        return `PAT-${seq}`;
      },
    }),
    { name: 'patient-storage' }
  )
);
