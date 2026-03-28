import axiosInstance from '../lib/axiosInstance';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getInvoices = async () => {
  const { data } = await axiosInstance.get('/invoices');
  return data;
};

export const getInvoiceById = async (id: string) => {
  const { data } = await axiosInstance.get(`/invoices/${id}`);
  return data;
};

export const createInvoice = async (invoiceData: object) => {
  const { data } = await axiosInstance.post('/invoices', invoiceData);
  return data;
};

export const updateInvoice = async (id: string, invoiceData: object) => {
  const { data } = await axiosInstance.put(`/invoices/${id}`, invoiceData);
  return data;
};

export const deleteInvoice = async (id: string) => {
  const { data } = await axiosInstance.delete(`/invoices/${id}`);
  return data;
};

export const getPublicInvoice = async (id: string) => {
  const response = await fetch(`${BASE_URL}/invoices/public/${id}`);
  if (!response.ok) throw new Error('Invoice not found');
  return response.json();
};

export const markAsPaid = async (id: string) => {
  const response = await fetch(`${BASE_URL}/invoices/public/${id}/mark-paid`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to mark as paid');
  return response.json();
};

export const sendInvoiceReminder = async (id: string) => {
  const { data } = await axiosInstance.post(`/invoices/${id}/remind`);
  return data;
};