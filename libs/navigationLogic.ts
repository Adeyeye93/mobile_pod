/**
 * Centralized navigation logic
 * Determines which screen to show based on app state
 */

export type NavigationState = 
  | "splash" // Still loading
  | "Interest" //  Authenticated but no interests
  | "onboarding" // Not authenticated
  | "main"; // Authenticated with interests



export function getNavigationState(props: NavigationProps): NavigationState {
  const {
    isBootstrapping,
    isAuthenticated,
    isInterestHydrated,
    hasInterest,
    fontsLoaded,
  } = props;

  // Still loading resources
  if (isBootstrapping || !fontsLoaded || !isInterestHydrated) {
    return "splash";
  }

  // Not authenticated
  if (!isAuthenticated) {
    return "onboarding";
  }

  // Authenticated but no interests
  if (isAuthenticated && !hasInterest) {
    return "Interest";
  }

  // Authenticated with interests
  return "main";
}

export function getInitialRoute(state: NavigationState): string {
  switch (state) {
    case "splash":
      return "/"; // Will render null
    case "Interest":
      return "/(auth)/interests";
    case "onboarding":
      return "/(auth)/onboarding";
    case "main":
      return "/(tabs)";
  }
}