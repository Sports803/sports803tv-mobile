import { Linking, Pressable, Text, View } from "react-native";

import type { OwnerControlMap } from "@/lib/owner-control-contract";
import { ownerAnnouncement, ownerPromotion } from "@/lib/owner-control-contract";

const palette = { surface: "#17213A", red: "#E0102A", gold: "#F4B740", text: "#F7F8FC", muted: "#B6C2DB", border: "#26314A" };

export function OwnerBanner({ controls }: { controls: OwnerControlMap }) {
  const announcement = ownerAnnouncement(controls);
  const promotion = ownerPromotion(controls);
  if (!announcement && !promotion) return null;

  const openPromotion = async () => {
    if (promotion?.href && /^https:\/\//i.test(promotion.href)) await Linking.openURL(promotion.href);
  };

  return (
    <View style={{ gap: 8, marginBottom: 12 }}>
      {announcement ? <View style={{ borderRadius: 14, borderWidth: 1, borderColor: announcement.tone === "warning" ? palette.gold : palette.border, backgroundColor: palette.surface, padding: 12 }}>
        <Text style={{ color: announcement.tone === "warning" ? palette.gold : palette.red, fontSize: 11, fontWeight: "900", letterSpacing: 0.8 }}>{announcement.title.toUpperCase()}</Text>
        <Text style={{ color: palette.text, marginTop: 4, lineHeight: 19 }}>{announcement.message}</Text>
      </View> : null}
      {promotion ? <Pressable onPress={() => void openPromotion()} disabled={!promotion.href} style={({ pressed }) => ({ borderRadius: 14, padding: 13, backgroundColor: palette.red, opacity: pressed ? 0.84 : 1 })} accessibilityRole={promotion.href ? "link" : "text"} accessibilityLabel={promotion.title}>
        <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 15 }}>{promotion.title}</Text>
        {promotion.message ? <Text style={{ color: "#FFF0F2", marginTop: 3 }}>{promotion.message}</Text> : null}
      </Pressable> : null}
    </View>
  );
}
