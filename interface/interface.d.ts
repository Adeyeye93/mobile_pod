 interface User {
  id: number;       // matches your API (1)
  email: string;
}

 interface AuthResponse {
  message: string;
  user: User;
  token: string;    // access token
  refresh: string;  // refresh token
}

 interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: any) => Promise<void>;
  signOut: (args?: { message?: string }) => Promise<void>;
}

interface FlashMessageOptions {
  message: string;
  type?: "success" | "danger" | "info";
  duration?: number; // ms
}

interface FlashMessageContextProps {
  showMessage: (options: FlashMessageOptions) => void;
}

interface Interest {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface UserInterest {
  id: number;
  user_id: number;
  interest_id: number;
  interest: Interest;
}

interface InterestContextType {
  interests: Interest[];
  userInterests: Interest[];
  selectedInterestIds: number[];
  hasInterest: boolean;
  isInterestHydrated: boolean;
  loading: boolean;
  loadInterests: () => Promise<void>;
  loadUserInterests: (userId: number) => Promise<void>;
  toggleInterest: (interestId: number) => void;
  saveUserInterests: (userId: number) => Promise<boolean>;
  clearUserInterests: (userId: number) => Promise<void>;
}
type FeedFilter = "all" | "live" | "episodes" | "following" | "trending";

interface SheetProps {
  children: ReactNode;
  context: React.Context<SheetContextType | null>;
  snapPoints?: (number | string)[];
  backgroundColor?: string;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  handleIndicatorColor?: string;
  onClose?: () => void;
  enablePanDownToClose?: boolean;
}

interface NavigationProps {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  isInterestHydrated: boolean;
  hasInterest: boolean;
  fontsLoaded: boolean;
  OnCreator: boolean;
}

type CustomType =
  | "Listen Later"
  | "Archive"
  | "Liked Podcasts"
  | "Recently Played";

interface GridProps {
  use_icon?: boolean;
  color?: any;
  icon?: any;
  Type?: CustomType;
  episodeCount?: number;
  non_icon?: boolean,
  author?: string,
  onPress: () => void
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string | null;
  children: React.ReactNode;
  showCloseButton?: boolean;
  animationType?: "none" | "slide" | "fade";
  backgroundColor?: string;
  MenuIcons?: ImageSourcePropType[],

}

interface ModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface CreateModalContextReturn {
  ModalContext: React.Context<ModalContextType | undefined>;
  useModalContext: () => ModalContextType;
  ModalProvider: React.FC<{ children: React.ReactNode }>;
  ModalComponent: React.FC<{
    title: string | null;
    children: React.ReactNode;
    animationType?: "none" | "slide" | "fade";
    backgroundColor?: string;
    MenuIcons?: ImageSourcePropType[];
    showCloseButton?: boolean
  }>;
}

interface Creator {
  id: string;
  name: string;
  channelId: string;
  avatar: string;
  followerCount: number;
  bio: string;
}

interface GuestInvite {
  id: string;
  podcastId: string;
  hostCreatorId: string;
  guestCreatorId: string;
  guestCreator: Creator;
  scheduledStartTime: Date;
  status: "pending" | "accepted" | "declined" | "cancelled";
  inviteSentAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  joinedAt?: Date;
  role: "guest" | "co-host";
  message?: string; // Optional invite message from host
}

interface PodcastWithGuests {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  scheduledStartTime: Date;
  status: "scheduled" | "live" | "ended";
  guests: GuestInvite[];
}

// ============= INVITE CONTEXT =============

interface GuestInviteContextType {
  invites: GuestInvite[];
  sendInvite: (data: SendInviteRequest) => Promise<GuestInvite>;
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
  getPendingInvites: () => GuestInvite[];
  getAcceptedGuests: (podcastId: string) => GuestInvite[];
  canStartPodcast: (podcastId: string) => boolean; // Check if 1hr passed
}


interface SendInviteRequest {
  podcastId: string;
  hostCreatorId: string;
  guestCreatorId: string;
  scheduledStartTime: Date;
  role: "guest" | "co-host";
  message?: string;
}
