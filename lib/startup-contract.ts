export function startupRouteFor(onboardingComplete: boolean): "/onboarding" | null {
  return onboardingComplete ? null : "/onboarding";
}
