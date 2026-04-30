import { createContext, useContext, useMemo, useState } from "react";

interface StreamContextValue {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  private: boolean;
  setPrivate: (value: boolean) => void;
  allowComments: boolean;
  setAllowComments: (value: boolean) => void;
  saveAudio: boolean;
  setSaveAudio: (value: boolean) => void;
  category: string;
  setCategory: (value: string) => void;
  allow_notify_followers: boolean;
  setAllowNotifyFollowers: (value: boolean) => void;
  allow_notify_subscribers: boolean;
  setAllowNotifySubscribers: (value: boolean) => void;
  scheduledTime: string;
  setScheduledTime: (value: string) => void;
  NumberOfInvitedGuest: number;
  setNumberOfInvitedGuest: (value: number) => void;
  reset: () => void;
}

const defaults = {
  title: "",
  description: "",
  isPrivate: false,
  allowComments: true,
  saveAudio: false,
  category: "",
  allow_notify_followers: false,
  allow_notify_subscribers: true,
};

const StreamContext = createContext<StreamContextValue | null>(null);

export function StreamProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState(defaults.title);
  const [description, setDescription] = useState(defaults.description);
  const [isPrivate, setPrivate] = useState(defaults.isPrivate);
  const [allowComments, setAllowComments] = useState(defaults.allowComments);
  const [saveAudio, setSaveAudio] = useState(defaults.saveAudio);
  const [category, setCategory] = useState(defaults.category);
  const [allow_notify_followers, setAllowNotifyFollowers] = useState(
    defaults.allow_notify_followers,
  );
  const [allow_notify_subscribers, setAllowNotifySubscribers] = useState(
    defaults.allow_notify_subscribers,
  );
  const [scheduledTime, setScheduledTime] = useState("");
  const [NumberOfInvitedGuest, setNumberOfInvitedGuest] = useState(0);

  const reset = () => {
    setTitle(defaults.title);
    setDescription(defaults.description);
    setPrivate(defaults.isPrivate);
    setAllowComments(defaults.allowComments);
    setSaveAudio(defaults.saveAudio);
    setCategory(defaults.category);
    setAllowNotifyFollowers(defaults.allow_notify_followers);
    setAllowNotifySubscribers(defaults.allow_notify_subscribers);
    setScheduledTime("");
    setNumberOfInvitedGuest(0);
  };

  const value = useMemo(
    () => ({
      title,
      setTitle,
      description,
      setDescription,
      private: isPrivate,
      setPrivate,
      allowComments,
      setAllowComments,
      saveAudio,
      setSaveAudio,
      category,
      setCategory,
      allow_notify_followers,
      setAllowNotifyFollowers,
      allow_notify_subscribers,
      setAllowNotifySubscribers,
      scheduledTime,
      setScheduledTime,
      NumberOfInvitedGuest,
      setNumberOfInvitedGuest,
      reset,
    }),
    [
      title,
      description,
      isPrivate,
      allowComments,
      saveAudio,
      category,
      allow_notify_followers,
      allow_notify_subscribers,
      scheduledTime,
      NumberOfInvitedGuest,
    ],
  );

  return (
    <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
  );
}

export function useStream() {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error("useStream must be used within a StreamProvider");
  }
  return context;
}
