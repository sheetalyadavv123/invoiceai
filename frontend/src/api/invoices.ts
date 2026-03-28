import axiosInstance from '../lib/axiosInstance';

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
  const { data } = await axiosInstance.get(`/invoices/public/${id}`);
  return data;
};

export const markAsPaid = async (id: string) => {
  const { data } = await axiosInstance.patch(`/invoices/public/${id}/mark-paid`);
  return data;
};

export const sendInvoiceReminder = async (id: string) => {
  const { data } = await axiosInstance.post(`/invoices/${id}/remind`);
  return data;
};