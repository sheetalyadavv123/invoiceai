import { create } from 'zustand';
import type { Invoice } from '../types/Invoice';

interface InvoiceState {
  invoices: Invoice[];
  insights: string;
  lastFetched: number | null;
  setInvoices: (invoices: Invoice[]) => void;
  setInsights: (insights: string) => void;
  setLastFetched: (time: number) => void;
  clear: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  insights: '',
  lastFetched: null,
  setInvoices: (invoices) => set({ invoices }),
  setInsights: (insights) => set({ insights }),
  setLastFetched: (time) => set({ lastFetched: time }),
  clear: () => set({ invoices: [], insights: '', lastFetched: null }),
}));