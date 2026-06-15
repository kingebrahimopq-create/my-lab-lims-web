import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Test, TestCategory, TestResult } from '@/types';

interface TestState {
  tests: Test[];
  categories: TestCategory[];
  results: TestResult[];
  addTest: (test: Test) => void;
  updateTest: (id: string, test: Partial<Test>) => void;
  deleteTest: (id: string) => void;
  addCategory: (category: TestCategory) => void;
  updateCategory: (id: string, category: Partial<TestCategory>) => void;
  deleteCategory: (id: string) => void;
  addResult: (result: TestResult) => void;
  updateResult: (id: string, result: Partial<TestResult>) => void;
  getTestById: (id: string) => Test | undefined;
  getTestsByCategory: (categoryId: string) => Test[];
  searchTests: (query: string) => Test[];
  getTodayTests: () => TestResult[];
  getPendingResults: () => TestResult[];
  getResultsByPatient: (patientId: string) => TestResult[];
  generateTestCode: () => string;
}

let testCounter = 1;

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      tests: [],
      categories: [
        { id: 'cat-blood', name: 'تحاليل الدم', nameEn: 'Blood Tests', createdAt: new Date().toISOString() },
        { id: 'cat-urine', name: 'تحاليل البول', nameEn: 'Urine Tests', createdAt: new Date().toISOString() },
        { id: 'cat-hormone', name: 'تحاليل الهرمونات', nameEn: 'Hormone Tests', createdAt: new Date().toISOString() },
        { id: 'cat-liver', name: 'تحاليل الكبد', nameEn: 'Liver Tests', createdAt: new Date().toISOString() },
        { id: 'cat-kidney', name: 'تحاليل الكلى', nameEn: 'Kidney Tests', createdAt: new Date().toISOString() },
        { id: 'cat-lipid', name: 'تحاليل الدهون', nameEn: 'Lipid Tests', createdAt: new Date().toISOString() },
        { id: 'cat-diabetes', name: 'تحاليل السكر', nameEn: 'Diabetes Tests', createdAt: new Date().toISOString() },
        { id: 'cat-micro', name: 'تحاليل الميكروبيولوجي', nameEn: 'Microbiology Tests', createdAt: new Date().toISOString() },
        { id: 'cat-immune', name: 'تحاليل المناعة', nameEn: 'Immunology Tests', createdAt: new Date().toISOString() },
        { id: 'cat-other', name: 'تحاليل أخرى', nameEn: 'Other Tests', createdAt: new Date().toISOString() },
      ],
      results: [],

      addTest: (test: Test) => {
        set((state) => ({ tests: [...state.tests, test] }));
      },

      updateTest: (id: string, test: Partial<Test>) => {
        set((state) => ({
          tests: state.tests.map((t) =>
            t.id === id ? { ...t, ...test, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTest: (id: string) => {
        set((state) => ({
          tests: state.tests.filter((t) => t.id !== id),
        }));
      },

      addCategory: (category: TestCategory) => {
        set((state) => ({ categories: [...state.categories, category] }));
      },

      updateCategory: (id: string, category: Partial<TestCategory>) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        }));
      },

      deleteCategory: (id: string) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      addResult: (result: TestResult) => {
        set((state) => ({ results: [...state.results, result] }));
      },

      updateResult: (id: string, result: Partial<TestResult>) => {
        set((state) => ({
          results: state.results.map((r) =>
            r.id === id ? { ...r, ...result } : r
          ),
        }));
      },

      getTestById: (id: string) => {
        return get().tests.find((t) => t.id === id);
      },

      getTestsByCategory: (categoryId: string) => {
        return get().tests.filter((t) => t.categoryId === categoryId);
      },

      searchTests: (query: string) => {
        const q = query.toLowerCase();
        return get().tests.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.code.toLowerCase().includes(q) ||
            (t.nameEn && t.nameEn.toLowerCase().includes(q))
        );
      },

      getTodayTests: () => {
        const today = new Date().toDateString();
        return get().results.filter(
          (r) => new Date(r.createdAt).toDateString() === today
        );
      },

      getPendingResults: () => {
        return get().results.filter((r) => r.status === 'pending');
      },

      getResultsByPatient: (patientId: string) => {
        return get().results.filter((r) => r.patientId === patientId);
      },

      generateTestCode: () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const counter = String(testCounter++).padStart(4, '0');
        return `T${year}${month}${day}-${counter}`;
      },
    }),
    {
      name: 'test-storage',
    }
  )
);
