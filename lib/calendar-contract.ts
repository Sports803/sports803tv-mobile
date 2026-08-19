export type CalendarMatch = {
  id: string;
  homeName: string;
  awayName?: string;
  kickoff?: string | number;
  leagueName?: string;
  competitionLabel?: string;
};

export function calendarEventDetails(event: CalendarMatch) {
  const startDate = new Date(event.kickoff ?? "");
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  return {
    title: `${event.homeName} vs ${event.awayName || "Live broadcast"}`,
    startDate,
    endDate,
    notes: [event.competitionLabel || event.leagueName || "Sports803TV", `Open Sports803TV to watch: /player?eventId=${event.id}`].join("\n"),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    alarms: [{ relativeOffset: -30 }],
  };
}
