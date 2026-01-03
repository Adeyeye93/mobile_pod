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

