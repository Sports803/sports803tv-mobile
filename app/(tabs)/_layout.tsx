import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const bottom = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { backgroundColor: "#080C18", borderTopColor: "#26314A", height: 58 + bottom, paddingBottom: bottom, paddingTop: 7 } }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={24} color={color} /> }} />
    <Tabs.Screen name="live" options={{ title: "Live TV", tabBarIcon: ({ color }) => <IconSymbol name="tv.fill" size={24} color={color} /> }} />
    <Tabs.Screen name="favorites" options={{ title: "Favorites", tabBarIcon: ({ color }) => <IconSymbol name="star.fill" size={24} color={color} /> }} />
    <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color }) => <IconSymbol name="ellipsis.circle.fill" size={24} color={color} /> }} />
  </Tabs>;
}
