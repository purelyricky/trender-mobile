import React, { useState, useEffect } from 'react';
import { View, StatusBar, ActivityIndicator } from 'react-native';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { useGlobalContext } from '@/lib/global-provider';
import CustomSplashScreen from '@/components/SplashScreen';

// Keep splash screen visible
SplashScreen.preventAutoHideAsync();

export default function AppWrapper() {
  const { loading: authLoading } = useGlobalContext();
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  
  const [fontsLoaded, fontError] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });

  // Handle initial app loading
  useEffect(() => {
    async function prepare() {
      try {
        // Only hide the native splash when fonts are loaded
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, [fontsLoaded]);

  // Mark app as ready when auth check completes and fonts are loaded
  useEffect(() => {
    if (!authLoading && fontsLoaded) {
      // Add a small delay to ensure everything is properly rendered
      const timer = setTimeout(() => {
        setAppReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading, fontsLoaded]);

  const handleSplashFinish = () => {
    setShowCustomSplash(false);
  };

  // Don't render anything until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Show custom splash screen until auth is ready and splash animation completes
  if (showCustomSplash || !appReady) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar translucent backgroundColor="transparent" />
        {showCustomSplash ? (
          <CustomSplashScreen onFinish={handleSplashFinish} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0061FF" />
          </View>
        )}
      </View>
    );
  }

  // App is ready, render the main content
  return <Slot />;
}