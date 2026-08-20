import { View } from "react-native";

export function IframePlayer({ uri, onReady, onError }: { uri: string; onReady?: () => void; onError?: () => void }) {
  return <View style={{ flex: 1, backgroundColor: "#000" }}>{uri ? <iframe title="Sports803TV player" src={uri} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen onLoad={onReady} onError={onError} style={{ width: "100%", height: "100%", border: 0, backgroundColor: "#000" }} /> : null}</View>;
}
