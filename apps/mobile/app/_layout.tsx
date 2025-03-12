import { Stack } from "expo-router";
import "@/global.css";
import { View } from "react-native";
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackVisible: false,
       
      }}
    />
  );
}
