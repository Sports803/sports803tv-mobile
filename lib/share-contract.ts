export function eventSharePath(eventId: string) {
  return `share-event?eventId=${encodeURIComponent(eventId)}`;
}
