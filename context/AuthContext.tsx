import { getAuth, saveAuth, clearAuth } from "@/storage/authStorage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/libs/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "@/context/FlashMessageContext";
import { authEvents } from "@/libs/authEvents";
import { fixMediaUrl } from "@/utils/mediaUrl";

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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");

  const isAuthenticated = !!user;

  useEffect(() => {
    (async () => {
      const stored = await getAuth();
      if (stored) {
        setUser(stored.user);
        setEmail(stored.user.email);
        setUsername(stored.user.username ?? stored.user.email.replace(/@.*$/, ""));
        setAvatarUrl(fixMediaUrl(stored.user.avatar_url) ?? "");
        // fetch fresh profile data (bio, latest avatar)
        api.get("users/me").then((res) => {
          const u = res.data?.user ?? res.data;
          if (u?.avatar_url) setAvatarUrl(fixMediaUrl(u.avatar_url) ?? "");
          if (u?.username) setUsername(u.username);
          if (u?.bio) setBio(u.bio ?? "");
        }).catch((err) => {
          console.warn("[AuthContext] GET users/me failed:", err?.status ?? err?.response?.status, err?.message);
        });
      }
      setIsBootstrapping(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login/", { email, password });
    const payload = {
      user: res.data.user,
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
    };
    await saveAuth(payload);
    setUser(payload.user);
    setEmail(payload.user.email);
    setUsername(payload.user.username ?? payload.user.email.replace(/@.*$/, ""));
    setAvatarUrl(fixMediaUrl(payload.user.avatar_url) ?? "");
  };

  const signUp = async (data: SignUpPayload): Promise<void> => {
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);
      const payload = {
        user: res.data.user,
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token,
      };
      await saveAuth(payload);
      setUser(payload.user);
      setEmail(payload.user.email);
      setUsername(payload.user.username ?? payload.user.email.replace(/@.*$/, ""));
      setAvatarUrl(fixMediaUrl(payload.user.avatar_url) ?? "");
    } catch (err: any) {
      throw err;
    }
  };

  const updateProfile = useCallback(
    (updates: { username?: string; avatarUrl?: string; bio?: string }) => {
      if (updates.username !== undefined) setUsername(updates.username);
      if (updates.avatarUrl !== undefined) setAvatarUrl(updates.avatarUrl);
      if (updates.bio !== undefined) setBio(updates.bio);
    },
    [],
  );

  const signOut = useCallback(
    async (args?: { message?: string }) => {
      await clearAuth();
      await AsyncStorage.multiRemove(["hasInterest", "userInterests", "last_updated"]);
      setUser(null);
      show({
        message: args?.message || "Logged out successfully!",
        type: "info",
        title: "Logged Out",
      });
    },
    [show],
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
        avatarUrl,
        bio,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
