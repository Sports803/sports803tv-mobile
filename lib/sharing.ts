import * as Linking from "expo-linking";
import { Share } from "react-native";

import type { SportsEvent } from "@/lib/sports";
import { eventSharePath, inviteShareMessage } from "@/lib/share-contract";

export { eventSharePath } from "@/lib/share-contract";

export function buildEventShareMessage(event: Pick<SportsEvent, "id" | "homeName" | "awayName" | "leagueName" | "competitionLabel">) {
  const fixture = `${event.homeName} vs ${event.awayName || "Live broadcast"}`;
  const competition = event.competitionLabel || event.leagueName || "Sports803TV";
  return `Watch ${fixture} on Sports803TV · ${competition}`;
}

export function buildEventShareUrl(eventId: string) {
  return Linking.createURL(eventSharePath(eventId));
}

export const buildInviteShareMessage = inviteShareMessage;

export async function shareSports803() {
  return Share.share({ message: `${buildInviteShareMessage()}\n${Linking.createURL("/")}`, title: "Invite friends to Sports803TV" });
}

export async function shareEvent(event: SportsEvent) {
  const message = `${buildEventShareMessage(event)}\n${buildEventShareUrl(event.id)}`;
  return Share.share({ message, title: `${event.homeName} vs ${event.awayName || "Live"}` });
}
