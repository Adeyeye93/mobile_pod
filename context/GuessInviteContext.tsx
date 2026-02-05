import React, { createContext, useContext, useState } from "react";
import { api } from "@/libs/api";


const GuestInviteContext = createContext<GuestInviteContextType | undefined>(
  undefined,
);

export function GuestInviteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [invites, setInvites] = useState<GuestInvite[]>([]);

  const sendInvite = async (data: SendInviteRequest): Promise<GuestInvite> => {
    try {
      const response = await api.post("/podcasts/invites/send", {
        podcastId: data.podcastId,
        hostCreatorId: data.hostCreatorId,
        guestCreatorId: data.guestCreatorId,
        scheduledStartTime: data.scheduledStartTime,
        role: data.role,
        message: data.message,
      });

      const newInvite: GuestInvite = response.data;
      setInvites([...invites, newInvite]);

      return newInvite;
    } catch (error) {
      console.error("Failed to send invite:", error);
      throw error;
    }
  };

  const acceptInvite = async (inviteId: string) => {
    try {
      await api.post(`/podcasts/invites/${inviteId}/accept`, {
        acceptedAt: new Date().toISOString(),
      });

      setInvites(
        invites.map((inv) =>
          inv.id === inviteId
            ? { ...inv, status: "accepted", acceptedAt: new Date() }
            : inv,
        ),
      );
    } catch (error) {
      console.error("Failed to accept invite:", error);
      throw error;
    }
  };

  const declineInvite = async (inviteId: string) => {
    try {
      await api.post(`/podcasts/invites/${inviteId}/decline`, {
        declinedAt: new Date().toISOString(),
      });

      setInvites(
        invites.map((inv) =>
          inv.id === inviteId
            ? { ...inv, status: "declined", declinedAt: new Date() }
            : inv,
        ),
      );
    } catch (error) {
      console.error("Failed to decline invite:", error);
      throw error;
    }
  };

  const getPendingInvites = (): GuestInvite[] => {
    return invites.filter((inv) => inv.status === "pending");
  };

  const getAcceptedGuests = (podcastId: string): GuestInvite[] => {
    return invites.filter(
      (inv) => inv.podcastId === podcastId && inv.status === "accepted",
    );
  };

  // Check if podcast can start (1 hour before scheduled time with accepted guests)
  const canStartPodcast = (podcastId: string): boolean => {
    const podcast = invites.filter((inv) => inv.podcastId === podcastId);
    const now = new Date();
    const oneHourBefore = new Date(
      podcast[0]?.scheduledStartTime.getTime() - 60 * 60 * 1000,
    );

    // Can start if current time is >= 1 hour before scheduled start
    // AND all invited guests have either accepted or declined
    const allResponded = podcast.every(
      (inv) => inv.status === "accepted" || inv.status === "declined",
    );

    return now >= oneHourBefore && allResponded;
  };

  return (
    <GuestInviteContext.Provider
      value={{
        invites,
        sendInvite,
        acceptInvite,
        declineInvite,
        getPendingInvites,
        getAcceptedGuests,
        canStartPodcast,
      }}
    >
      {children}
    </GuestInviteContext.Provider>
  );
}

export function useGuestInvite(): GuestInviteContextType {
  const context = useContext(GuestInviteContext);
  if (!context) {
    throw new Error("useGuestInvite must be used within GuestInviteProvider");
  }
  return context;
}
