import { getAuth, saveAuth, clearAuth } from "@/storage/authStorage";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/libs/api";

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const isAuthenticated = !!user;

  // Restore session on app launch
  useEffect(() => {
    (async () => {
      const stored = await getAuth();
      if (stored) {
        setUser(stored.user);
      }
      setIsBootstrapping(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    const payload = {
      user: res.data.user,
      accessToken: res.data.token,
      refreshToken: res.data.refresh,
    };

    await saveAuth(payload);
    setUser(payload.user);
  };

  const signUp = async (data: string[]) => {
    const res = await api.post<AuthResponse>("/auth/register", data);

    const payload = {
      user: res.data.user,
      accessToken: res.data.token,
      refreshToken: res.data.refresh,
    };

    await saveAuth(payload);
    setUser(payload.user);
  };

  const signOut = async () => {
    await clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isBootstrapping,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
