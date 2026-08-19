import { Pressable, Text, View } from "react-native";

import { openSupportDestination, supportDestinations } from "@/lib/support";

export function SupportActions({ compact = false }: { compact?: boolean }) {
  if (!supportDestinations.length) return null;

  return (
    <View style={{ marginTop: compact ? 10 : 14 }} accessibilityLabel="Support Sports803TV">
      {!compact ? <><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "800" }}>Support Sports803TV</Text><Text style={{ color: "#9AA6BE", marginTop: 6, lineHeight: 19 }}>Help keep live sports coverage available and ad-light.</Text></> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: compact ? 0 : 12 }}>
        {supportDestinations.map((destination) => (
          <Pressable
            key={destination.id}
            onPress={() => void openSupportDestination(destination)}
            accessibilityRole="link"
            accessibilityLabel={destination.label}
            style={({ pressed }) => ({
              backgroundColor: destination.accent,
              borderRadius: 18,
              paddingHorizontal: 13,
              paddingVertical: 10,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: "#0A1020", fontSize: 12, fontWeight: "900" }}>{destination.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
