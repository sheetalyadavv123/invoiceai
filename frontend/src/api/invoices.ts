import axiosInstance from '../lib/axiosInstance';
import type { Invoice } from '../types/Invoice';

export const getInvoices = async () => {
  const res = await axiosInstance.get('/invoices');
  return res.data;
};

export const getInvoiceById = async (id: string) => {
  const res = await axiosInstance.get(`/invoices/${id}`);
  return res.data;
};

export const createInvoice = async (data: Partial<Invoice>) => {
  const res = await axiosInstance.post('/invoices', data);
  return res.data;
};

export const updateInvoice = async (id: string, data: Partial<Invoice>) => {
  const res = await axiosInstance.put(`/invoices/${id}`, data);
  return res.data;
};

export const deleteInvoice = async (id: string) => {
  const res = await axiosInstance.delete(`/invoices/${id}`);
  return res.data;
};