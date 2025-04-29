import { Stack } from "expo-router";
import "./global.css";
import GlobalProvider from "@/lib/global-provider";
import AppWrapper from "@/components/AppWrapper";
import { usePathname } from "expo-router";
import React from "react";
import AuthGuard from "@/components/AuthGuard";

export default function RootLayout() {
  return (
    <GlobalProvider>
      <AppWrapper>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthGuard>
      </AppWrapper>
    </GlobalProvider>
  );
}