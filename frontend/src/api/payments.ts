import axiosInstance from '../lib/axiosInstance';
 
export const getPaymentsByClient = async (clientId: string) => {
  const res = await axiosInstance.get(`/payments/client/${clientId}`);
  return res.data;
};
 
export const getPaymentHistory = async () => {
  const res = await axiosInstance.get('/payments');
  return res.data;
};
 
export const recordPayment = async (data: { invoiceId: string; amount: number; method: string }) => {
  const res = await axiosInstance.post('/payments', data);
  return res.data;
};
 