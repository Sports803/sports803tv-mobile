/**
 * The onboarding screen is optional. It should never hold a viewer at launch
 * for more than this short accessibility-friendly interval.
 */
export const ONBOARDING_AUTO_SKIP_MS = 5_000;

export function onboardingSkipLabel(secondsRemaining: number): string {
  const seconds = Math.max(0, Math.ceil(secondsRemaining));
  return seconds > 0 ? `Continue without onboarding (${seconds})` : "Continue without onboarding";
}
