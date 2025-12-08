import { create } from 'zustand';

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  return {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isCheckingAuth: true,

    login: (user, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
      const token = get().token;
      if (!token) {
        set({ isCheckingAuth: false, isAuthenticated: false });
        return;
      }

      set({ isCheckingAuth: true });
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const user = await response.json();
          set({ user, isAuthenticated: true, isCheckingAuth: false });
        } else {
          // Token invalid or expired
          get().logout();
          set({ isCheckingAuth: false });
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        get().logout();
        set({ isCheckingAuth: false });
      }
    },
  };
});
