import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const router = useRouter();
  const { token, user, isAuthenticated, setAuth, logout } = useAuthStore();

  const login = (token: string, user: any) => {
    setAuth(token, user);
    router.replace('/(tabs)/home');
  };

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout: handleLogout,
  };
};
