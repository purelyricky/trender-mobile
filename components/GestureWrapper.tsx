import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';

interface GestureWrapperProps {
  children: React.ReactNode;
}

export const GestureWrapper: React.FC<GestureWrapperProps> = ({ children }) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </GestureHandlerRootView>
  );
};