import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import type { Recording } from "./useRecordings";

const TERMS_KEY = "search_history_terms_v1";
const RECORDINGS_KEY = "search_history_recordings_v1";
const MAX_TERMS = 12;
const MAX_RECORDINGS = 10;

export function useSearchHistory() {
  const [terms, setTerms] = useState<string[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    AsyncStorage.multiGet([TERMS_KEY, RECORDINGS_KEY]).then(([t, r]) => {
      if (t[1]) setTerms(JSON.parse(t[1]));
      if (r[1]) setRecordings(JSON.parse(r[1]));
    });
  }, []);

  const addTerm = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setTerms((prev) => {
      const next = [trimmed, ...prev.filter((t) => t !== trimmed)].slice(
        0,
        MAX_TERMS
      );
      AsyncStorage.setItem(TERMS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeTerm = useCallback((term: string) => {
    setTerms((prev) => {
      const next = prev.filter((t) => t !== term);
      AsyncStorage.setItem(TERMS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addRecording = useCallback((recording: Recording) => {
    setRecordings((prev) => {
      const next = [recording, ...prev.filter((r) => r.id !== recording.id)].slice(
        0,
        MAX_RECORDINGS
      );
      AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const next = prev.filter((r) => r.id !== id);
      AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    AsyncStorage.multiRemove([TERMS_KEY, RECORDINGS_KEY]);
    setTerms([]);
    setRecordings([]);
  }, []);

  return { terms, recordings, addTerm, removeTerm, addRecording, removeRecording, clearAll };
}
