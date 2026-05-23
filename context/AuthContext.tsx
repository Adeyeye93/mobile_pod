import { getAuth, saveAuth, clearAuth } from "@/storage/authStorage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/libs/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "@/context/FlashMessageContext";
import { authEvents } from "@/libs/authEvents";
import { useRouter } from "expo-router";



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
  const { show } = useToast();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const isAuthenticated = !!user;

  useEffect(() => {
    (async () => {
      const stored = await getAuth();
      if (stored) {
        setUser(stored.user);
        setEmail(stored.user.email)
        const formatedUsername = stored.user.email.replace(/@.*$/, "")
        setUsername(formatedUsername)
      }
      setIsBootstrapping(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login/", {
      email,
      password,
    });

    const payload = {
      user: res.data.user,
      accessToken: res.data.token,
      refreshToken: res.data.refresh,
    };

    console.log("signIn payload", payload);
    await saveAuth(payload);;
    setUser(payload.user);
  };

  const signUp = async (data: any): Promise<void> => {
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);
      
      const payload = {
        user: res.data.user,
        accessToken: res.data.token,
        refreshToken: res.data.refresh,
      };
      await saveAuth(payload);
      setUser(payload.user);
      
    } catch (err: any) {
      throw err;
    }
  };

  

  const signOut = useCallback(
    async (args?: { message?: string }) => {
      await clearAuth();
      AsyncStorage.clear();
      setUser(null);
      router.push("/(auth)/onboarding");
      show({
        message: args?.message || "Logged out successfully!",
        type: "info",
        title: "Logged Out",
      });
    },
    [clearAuth, show],
  );

  useEffect(() => {
    authEvents.setSignOutCallback(() => {
      signOut({ message: "Session expired. Please log in again." });
    });
  }, [signOut]);


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isBootstrapping,
        username,
        email,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

