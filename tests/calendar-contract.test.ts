import { describe, expect, it } from "vitest";
import { calendarEventDetails } from "../lib/calendar-contract";

describe("calendar match contract", () => {
  it("creates a two-hour, deep-linkable calendar entry from the match identity", () => {
    const details = calendarEventDetails({ id: "fixture-1", homeName: "Home", awayName: "Away", kickoff: "2026-08-20T18:00:00.000Z", leagueName: "League" });
    expect(details.title).toBe("Home vs Away");
    expect(details.endDate.getTime() - details.startDate.getTime()).toBe(2 * 60 * 60 * 1000);
    expect(details.notes).toContain("/player?eventId=fixture-1");
    expect(details.alarms).toEqual([{ relativeOffset: -30 }]);
  });
});
