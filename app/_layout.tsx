import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { OutboxProvider } from '@/contexts/OutboxContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <AudioProvider>
        <OutboxProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settingsnew" />
            <Stack.Screen name="recordingScreen" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" />
        </OutboxProvider>
      </AudioProvider>
    </AuthProvider>
  );
}