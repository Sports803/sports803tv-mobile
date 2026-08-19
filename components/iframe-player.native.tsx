import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";

export function IframePlayer({ uri }: { uri: string }) {
  if (!uri) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#9AA6BE" }}>No player iframe is available for this event.</Text></View>;
  return <WebView source={{ uri }} style={{ flex: 1, backgroundColor: "#000" }} originWhitelist={["*"]} javaScriptEnabled domStorageEnabled allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} allowsFullscreen allowsFullscreenVideo startInLoadingState renderLoading={() => <ActivityIndicator color="#E0102A" style={{ flex: 1, backgroundColor: "#000" }} />} />;
}
