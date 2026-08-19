import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { savePushToken } from "@/lib/local";

export async function requestNotificationPermission() {
  if (Platform.OS === "web") return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("matches", { name: "Match alerts", importance: Notifications.AndroidImportance.DEFAULT });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === "granted";
}

export async function scheduleMatchReminder(event: { id: string; homeName: string; awayName?: string; kickoff?: string | number }) {
  if (Platform.OS === "web" || !event.kickoff) return null;
  const kickoff = new Date(event.kickoff).getTime();
  const reminderAt = kickoff - 15 * 60_000;
  if (reminderAt <= Date.now()) return null;
  const allowed = await requestNotificationPermission();
  if (!allowed) return null;
  return Notifications.scheduleNotificationAsync({ content: { title: "Match starting soon", body: `${event.homeName} vs ${event.awayName || "Live broadcast"} starts in 15 minutes.`, data: { eventId: event.id, url: `/player?eventId=${event.id}` } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(reminderAt) } });
}

export async function registerForRemoteNotifications() {
  if (Platform.OS === "web") return null;
  const allowed = await requestNotificationPermission();
  if (!allowed) return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await savePushToken(token);
  return token;
}

export async function cancelAllMatchReminders() {
  if (Platform.OS !== "web") await Notifications.cancelAllScheduledNotificationsAsync();
}
