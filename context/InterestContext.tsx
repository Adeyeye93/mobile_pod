import { api } from "@/libs/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface InterestContextType {
  interests: Interest[];
  userInterests: Interest[];
  selectedInterestIds: number[];
  hasInterest: boolean;
  loading: boolean;
  isInterestHydrated: boolean;
  loadInterests: () => Promise<void>;
  loadUserInterests: (userId: number) => Promise<boolean>;
  toggleInterest: (interestId: number) => void;
  saveUserInterests: (userId: number) => Promise<boolean>;
  clearUserInterests: (userId: number) => Promise<void>;
  setHasInterest: () => Promise<void>;
  setUserInterests: (interests: any) => Promise<void>;
}

const InterestContext = createContext<InterestContextType | undefined>(
  undefined,
);

export function InterestProvider({ children }: { children: React.ReactNode }) {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [userInterests, setUserInterests] = useState<Interest[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const [hasInterest, setHasInterest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInterestHydrated, setIsInterestHydrated] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    signOut();
  }

  // Only hydrate from cache, don't set hasInterest yet
  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem("hasInterest");
        if (cached !== null) {
          setHasInterest(JSON.parse(cached));
        }
      } catch (error) {
        console.log("Error reading cached interests:", error);
      } finally {
        // Mark as hydrated ONLY after checking cache
        setIsInterestHydrated(true);
      }
    })();
  }, []);

  const loadInterests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/interests");
      const interestsData = response.data.data || response.data.interests || [];
      setInterests(interestsData);

      // Save to cache
      await AsyncStorage.setItem(
        "userInterests",
        JSON.stringify(interestsData),
      );
    } catch (error) {
      console.log("Error loading interests:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserInterests = async (userId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}/interests`);
      const payload = response.data;

      let userInterestsData: Interest[];

      if (Array.isArray(payload.data)) {
        userInterestsData = payload.data;
      } else if (Array.isArray(payload.interests)) {
        userInterestsData = payload.interests;
      } else {
        userInterestsData = [];
      }

      setUserInterests(userInterestsData);
      const hasAnyInterests = userInterestsData.length > 0;
      setHasInterest(hasAnyInterests);
      setSelectedInterestIds(userInterestsData.map((i) => i.id));

      // Persist to cache
      await AsyncStorage.setItem(
        "hasInterest",
        JSON.stringify(hasAnyInterests),
      );

      return hasAnyInterests;
    } catch (error) {
      const err = error as any;
      if (err.issue && err.reason === "SESSION_EXPIRE") {
        setHasInterest(false);
        handleLogout();
      } else {
              console.error("Error loading user interests:", error);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interestId: number) => {
    setSelectedInterestIds((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId],
    );
  };

  const saveUserInterests = async (userId: number): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.post(`/users/${userId}/interests/save`, {
        interest_ids: selectedInterestIds,
      });

      if (response.data.success || response.status === 200) {
        setHasInterest(true);
        await AsyncStorage.setItem("hasInterest", JSON.stringify(true));
        await loadUserInterests(userId);
        return true;
      }
      return false;
    } catch (error) {
      console.log("Error saving interests:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearUserInterests = async (userId: number) => {
    try {
      await api.delete(`/users/${userId}/interests`);
      setUserInterests([]);
      setHasInterest(false);
      setSelectedInterestIds([]);
      await AsyncStorage.setItem("hasInterest", JSON.stringify(false));
    } catch (error) {
      console.log("Error clearing interests:", error);
    }
  };

  const setHasInterestAsync = async () => {
    setHasInterest(true);
  };

  const setUserInterestsAsync = async (interests: any) => {
    setInterests(interests);
  };

  return (
    <InterestContext.Provider
      value={{
        interests,
        userInterests,
        selectedInterestIds,
        hasInterest,
        loading,
        isInterestHydrated,
        loadInterests,
        loadUserInterests,
        toggleInterest,
        saveUserInterests,
        clearUserInterests,
        setHasInterest: setHasInterestAsync,
        setUserInterests: setUserInterestsAsync,
      }}
    >
      {children}
    </InterestContext.Provider>
  );
}

export function useInterest() {
  const context = useContext(InterestContext);
  if (!context) {
    throw new Error("useInterest must be used within InterestProvider");
  }
  return context;
}
