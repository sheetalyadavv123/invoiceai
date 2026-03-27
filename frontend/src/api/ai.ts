import axiosInstance from '../lib/axiosInstance';

export const getFinancialInsights = async () => {
  const res = await axiosInstance.get('/ai/insights'); // GET not POST
  return res.data;
};

export const generateInvoiceDescription = async (items: { description: string; quantity: number; price: number }[]) => {
  const res = await axiosInstance.post('/ai/description', { items }); // /description not /invoice-description
  return res.data;
};

export const sendReminder = async (invoiceId: string) => {
  const res = await axiosInstance.post('/ai/reminder', { invoiceId });
  return res.data;
};