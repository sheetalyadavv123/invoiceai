import axiosInstance from '../lib/axiosInstance';

export const getClients = async () => {
  const res = await axiosInstance.get('/clients');
  return res.data;
};

export const getClientById = async (id: string) => {
  const res = await axiosInstance.get(`/clients/${id}`);
  return res.data;
};

export const createClient = async (data: { name: string; email: string; phone: string }) => {
  const res = await axiosInstance.post('/clients', data);
  return res.data;
};

export const updateClient = async (id: string, data: Partial<{ name: string; email: string; phone: string }>) => {
  const res = await axiosInstance.put(`/clients/${id}`, data);
  return res.data;
};

export const deleteClient = async (id: string) => {
  const res = await axiosInstance.delete(`/clients/${id}`);
  return res.data;
};