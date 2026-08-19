export function eventSharePath(eventId: string) {
  return `share-event?eventId=${encodeURIComponent(eventId)}`;
}

export function inviteShareMessage() {
  return "Follow live sports, upcoming fixtures, and Live TV channels with Sports803TV.";
}
