export type SupportDestination = {
  id: "patreon" | "buy-me-a-coffee";
  label: string;
  url: string;
  accent: string;
};

export function isPublicHttpUrl(value: string | undefined): value is string {
  return Boolean(value && /^https:\/\//i.test(value));
}

export function makeSupportDestinations(
  patreonUrl: string | undefined,
  buyMeACoffeeUrl: string | undefined,
): SupportDestination[] {
  return [
    { id: "patreon", label: "Support on Patreon", url: patreonUrl || "", accent: "#E85D75" },
    { id: "buy-me-a-coffee", label: "Buy Me a Coffee", url: buyMeACoffeeUrl || "", accent: "#FFDD00" },
  ].filter((destination): destination is SupportDestination => isPublicHttpUrl(destination.url));
}
