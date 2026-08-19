import { Platform } from "react-native";
import * as Calendar from "expo-calendar";
import { calendarEventDetails, type CalendarMatch } from "@/lib/calendar-contract";

export type { CalendarMatch } from "@/lib/calendar-contract";

export type CalendarExportResult = "added" | "unavailable" | "permission-denied" | "invalid-time";

export async function exportMatchToCalendar(event: CalendarMatch): Promise<CalendarExportResult> {
  const details = calendarEventDetails(event);
  if (!Number.isFinite(details.startDate.getTime())) return "invalid-time";
  if (Platform.OS === "web" || !(await Calendar.isAvailableAsync())) return "unavailable";
  const current = await Calendar.getCalendarPermissionsAsync();
  const permission = current.status === Calendar.PermissionStatus.GRANTED ? current : await Calendar.requestCalendarPermissionsAsync();
  if (permission.status !== Calendar.PermissionStatus.GRANTED) return "permission-denied";
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.filter((calendar) => calendar.allowsModifications);
  if (!writable.length) return "unavailable";
  const defaultCalendar = Platform.OS === "ios" ? await Calendar.getDefaultCalendarAsync() : null;
  const target = defaultCalendar?.allowsModifications ? defaultCalendar : writable[0];
  await Calendar.createEventAsync(target.id, details);
  return "added";
}
