import axiosInstance from '../lib/axiosInstance';

export const getFinancialInsights = async () => {
  const res = await axiosInstance.post('/ai/insights');
  return res.data;
};

export const generateInvoiceDescription = async (items: { description: string; quantity: number; price: number }[]) => {
  const res = await axiosInstance.post('/ai/invoice-description', { items });
  return res.data;
};

export const generatePaymentReminder = async (invoiceId: string) => {
  const res = await axiosInstance.post('/ai/reminder', { invoiceId });
  return res.data;
};