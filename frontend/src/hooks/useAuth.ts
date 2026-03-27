import { useAuthStore } from '../store/authStore';
import { loginUser, registerUser } from '../api/auth';

export const useAuth = () => {
  const { user, token, setUser, logout } = useAuthStore();

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);
    setUser(data.user, data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await registerUser(name, email, password);
    setUser(data.user, data.token);
  };

  return { user, token, login, register, logout };
};