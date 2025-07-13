import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseCallDetectionProps {
  onCallDetected: () => void;
  isRecording: boolean;
}

export const useCallDetection = ({ onCallDetected, isRecording }: UseCallDetectionProps) => {
  const appState = useRef(AppState.currentState);
  const recordingWhenBackgrounded = useRef(false);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // If app goes to background while recording, it might be a call
      if (appState.current === 'active' && nextAppState === 'background' && isRecording) {
        recordingWhenBackgrounded.current = true;
        
        // Add a slight delay to differentiate between user manually backgrounding
        // vs system backgrounding due to call
        setTimeout(() => {
          if (AppState.currentState === 'background' && recordingWhenBackgrounded.current) {
            console.log('Potential call detected - app backgrounded during recording');
            onCallDetected();
          }
        }, 1000); // 1 second delay
      }
      
      // Reset flag when app becomes active again
      if (nextAppState === 'active') {
        recordingWhenBackgrounded.current = false;
      }
      
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isRecording, onCallDetected]);

  // Additional call detection using extended background monitoring
  useEffect(() => {
    let backgroundTimer: ReturnType<typeof setTimeout> | null = null;

    const checkExtendedBackground = () => {
      if (isRecording && AppState.currentState === 'background') {
        // Clear any existing timer
        if (backgroundTimer) {
          clearTimeout(backgroundTimer);
        }
        
        // Set a new timer for extended background detection
        backgroundTimer = setTimeout(() => {
          if (AppState.currentState === 'background' && isRecording) {
            console.log('Extended background state detected - likely a call');
            onCallDetected();
          }
          backgroundTimer = null;
        }, 3000); // 3 seconds for extended background detection
      } else if (backgroundTimer) {
        // Clear timer if not recording or not in background
        clearTimeout(backgroundTimer);
        backgroundTimer = null;
      }
    };

    // Only run this enhanced detection if we're recording
    if (isRecording) {
      const interval = setInterval(checkExtendedBackground, 1000);
      
      return () => {
        clearInterval(interval);
        if (backgroundTimer) {
          clearTimeout(backgroundTimer);
        }
      };
    }
  }, [isRecording, onCallDetected]);
};`` 