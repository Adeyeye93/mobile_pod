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
  signOut: () => Promise<void>;
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
