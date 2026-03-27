import axiosInstance from '../lib/axiosInstance';

export const loginUser = async (email: string, password: string) => {
  const res = await axiosInstance.post('/auth/login', { email, password });
  return res.data;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const res = await axiosInstance.post('/auth/register', { name, email, password });
  return res.data;
};