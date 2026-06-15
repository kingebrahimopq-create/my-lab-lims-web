import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Invoice, InvoiceTest } from '@/types';

interface Totals {
  subtotal: number;
  discountAmount: number;
  total: number;
}

interface InvoiceState {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
  getTodayRevenue: () => number;
  getMonthRevenue: () => number;
  generateInvoiceNumber: () => string;
  calculateTotals: (tests: InvoiceTest[], discountType: 'percentage' | 'fixed' | 'none', discountValue: number) => Totals;
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [],
      addInvoice: (invoice: Invoice) => {
        set((state) => ({ invoices: [...state.invoices, invoice] }));
      },
      updateInvoice: (id: string, invoice: Partial<Invoice>) => {
        set((state) => ({
          invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...invoice } : i)),
        }));
      },
      deleteInvoice: (id: string) => {
        set((state) => ({ invoices: state.invoices.filter((i) => i.id !== id) }));
      },
      getInvoice: (id: string) => {
        return get().invoices.find((i) => i.id === id);
      },
      getTodayRevenue: () => {
        const today = new Date().toDateString();
        return get()
          .invoices.filter(
            (i) => new Date(i.createdAt).toDateString() === today && i.paymentStatus !== 'unpaid'
          )
          .reduce((sum, i) => sum + i.paid, 0);
      },
      getMonthRevenue: () => {
        const now = new Date();
        return get()
          .invoices.filter((i) => {
            const d = new Date(i.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && i.paymentStatus !== 'unpaid';
          })
          .reduce((sum, i) => sum + i.paid, 0);
      },
      generateInvoiceNumber: () => {
        const invoices = get().invoices;
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const todayInvoices = invoices.filter(
          (i) => new Date(i.createdAt).toDateString() === today.toDateString()
        );
        const seq = String(todayInvoices.length + 1).padStart(3, '0');
        return `INV-${dateStr}-${seq}`;
      },
      calculateTotals: (tests: InvoiceTest[], discountType: 'percentage' | 'fixed' | 'none', discountValue: number): Totals => {
        const subtotal = tests.reduce((sum, t) => sum + t.testPrice, 0);
        let discountAmount = 0;
        if (discountType === 'percentage') {
          discountAmount = (subtotal * discountValue) / 100;
        } else if (discountType === 'fixed') {
          discountAmount = Math.min(discountValue, subtotal);
        }
        return {
          subtotal,
          discountAmount,
          total: Math.max(0, subtotal - discountAmount),
        };
      },
    }),
    { name: 'invoice-storage' }
  )
);
