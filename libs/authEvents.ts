type SignOutCallback = () => void;

let signOutCallback: SignOutCallback | null = null;

export const authEvents = {
  setSignOutCallback: (cb: SignOutCallback) => {
    signOutCallback = cb;
  },
  signOut: () => {
    signOutCallback?.();
  },
};
