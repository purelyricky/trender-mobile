import { Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppLayout() {
  // The root layout doesn't need to check auth anymore
  // Authentication is now handled in AppWrapper
  return <Slot />;
}