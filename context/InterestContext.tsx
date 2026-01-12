import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/libs/api";
import AsyncStorage from "@react-native-async-storage/async-storage";


const InterestContext = createContext<InterestContextType | undefined>(
  undefined
);

export function InterestProvider({ children }: { children: React.ReactNode }) {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [userInterests, setUserInterests] = useState<Interest[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const [hasInterest, setHasInterest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInterestHydrated, setIsInterestHydrated] = useState(false);


  useEffect(() => {
    (async () => {
      const cached = await AsyncStorage.getItem("hasInterest");

      if (cached !== null) {
        setHasInterest(JSON.parse(cached));
      }

      setIsInterestHydrated(true);
    })();
  }, []);


  const loadInterests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/interests");
       const interestsData =
         response.data.data || response.data.interests || [];
       setInterests(interestsData);

       // Save to cache
       await AsyncStorage.setItem(
         "userInterests",
         JSON.stringify(interestsData)
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

      let interests: Interest[];

      if (Array.isArray(payload.data)) {
        interests = payload.data;
      } else if (Array.isArray(payload.interests)) {
        interests = payload.interests;
      } else {
        throw new Error("Invalid interests response shape");
      }

      setUserInterests(interests);
      setHasInterest(interests.length > 0);
      setSelectedInterestIds(interests.map((i) => i.id));
    } catch (error) {
      console.error("Error loading user interests:", error);
      setHasInterest(false);
    } finally {
      setLoading(false);
    }
  };


  const toggleInterest = (interestId: number) => {
    setSelectedInterestIds((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const saveUserInterests = async (userId: number): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.post(`/users/${userId}/interests/save`, {
        interest_ids: selectedInterestIds,
      });
      if (response.data.success || response.status === 200) {
        await AsyncStorage.setItem("hasInterest", JSON.stringify(hasInterest));
        setHasInterest(true);
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
    } catch (error) {
      console.log("Error clearing interests:", error);
    }
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
