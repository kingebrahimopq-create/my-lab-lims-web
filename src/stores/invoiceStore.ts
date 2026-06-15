import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Invoice, InvoiceTest } from '@/types';

interface InvoiceState {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  getInvoicesByPatient: (patientId: string) => Invoice[];
  getTodayInvoices: () => Invoice[];
  getTodayRevenue: () => number;
  getPendingPayments: () => Invoice[];
  generateInvoiceNumber: () => string;
  calculateTotals: (tests: InvoiceTest[], discountType: 'percentage' | 'fixed' | 'none', discountValue: number) => { subtotal: number; discountAmount: number; total: number };
}

let invoiceCounter = 1;

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [],

      addInvoice: (invoice: Invoice) => {
        set((state) => ({ invoices: [...state.invoices, invoice] }));
      },

      updateInvoice: (id: string, invoice: Partial<Invoice>) => {
        set((state) => ({
          invoices: state.invoices.map((i) =>
            i.id === id ? { ...i, ...invoice, updatedAt: new Date().toISOString() } : i
          ),
        }));
      },

      deleteInvoice: (id: string) => {
        set((state) => ({
          invoices: state.invoices.filter((i) => i.id !== id),
        }));
      },

      getInvoiceById: (id: string) => {
        return get().invoices.find((i) => i.id === id);
      },

      getInvoicesByPatient: (patientId: string) => {
        return get().invoices.filter((i) => i.patientId === patientId);
      },

      getTodayInvoices: () => {
        const today = new Date().toDateString();
        return get().invoices.filter(
          (i) => new Date(i.createdAt).toDateString() === today
        );
      },

      getTodayRevenue: () => {
        const today = new Date().toDateString();
        return get()
          .invoices.filter((i) => new Date(i.createdAt).toDateString() === today)
          .reduce((sum, i) => sum + i.paid, 0);
      },

      getPendingPayments: () => {
        return get().invoices.filter(
          (i) => i.paymentStatus === 'unpaid' || i.paymentStatus === 'partial'
        );
      },

      generateInvoiceNumber: () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const counter = String(invoiceCounter++).padStart(4, '0');
        return `INV-${year}${month}${day}-${counter}`;
      },

      calculateTotals: (tests: InvoiceTest[], discountType: 'percentage' | 'fixed' | 'none', discountValue: number) => {
        const subtotal = tests.reduce((sum, t) => sum + t.testPrice, 0);
        let discountAmount = 0;
        if (discountType === 'percentage') {
          discountAmount = subtotal * (discountValue / 100);
        } else if (discountType === 'fixed') {
          discountAmount = discountValue;
        }
        const total = Math.max(0, subtotal - discountAmount);
        return { subtotal, discountAmount, total };
      },
    }),
    {
      name: 'invoice-storage',
    }
  )
);
