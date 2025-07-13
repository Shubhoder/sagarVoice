import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  setIsAudioActiveAsync,
} from 'expo-audio';
import { useAudioContext } from '../contexts/AudioContext';
import { useCallDetection } from './useCallDetection';

export const useRecordingController = (router: any) => {
  const { 
    currentRecording, 
    updateRecordingUri, 
    updateDuration, 
    isResuming, 
    setIsResuming,
    callDetected,
    setCallDetected,
    finalizeLiveWaveform,
    finalizeResumedRecording,
    setFromCallDetection,
    setSavedFilePath,
    getTotalDuration,
    mergeAudioSegments,
  } = useAudioContext();
  
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Audio recorder setup
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  // Call detection setup
  const handleCallDetected = async () => {
    console.log('Call detected! Automatically saving recording and navigating to safe screen.');
    setCallDetected(true);
    setFromCallDetection(true);
    
    // Auto-save the recording when call is detected
    if (recorderState.isRecording) {
      await stopRecordingFromCall();
    } else {
      // If not recording, just navigate
      setIsNavigating(true);
      setTimeout(() => {
        router.push('../recordingScreen/audio-recording');
      }, 500);
    }
  };

  // Special stop recording function for call detection
  const stopRecordingFromCall = async () => {
    try {
      await audioRecorder.stop();
      const savedPath = audioRecorder.uri || '';
      
      updateRecordingUri(savedPath);
      updateDuration(recordingDuration);
      setSavedFilePath(savedPath);
      
      // Finalize the waveform data - use resumed version if in resume mode
      if (currentRecording.resumeMode) {
        finalizeResumedRecording();
        
        // Merge audio segments if we have previous segments
        if (currentRecording.previousAudioSegments.length > 0) {
          console.log('Merging audio segments due to call detection...');
          const mergedUri = await mergeAudioSegments();
          if (mergedUri) {
            console.log('Audio segments merged successfully:', mergedUri);
            setSavedFilePath(mergedUri);
          }
        }
      } else {
        finalizeLiveWaveform();
      }
      
      console.log('Recording auto-saved due to call detection:', savedPath);
      
      // Auto-navigate to audio-recording screen
      setIsNavigating(true);
      setTimeout(() => {
        router.push('../recordingScreen/audio-recording');
      }, 500);
    } catch (error) {
      console.error('Failed to auto-save recording:', error);
      Alert.alert('Error', 'Failed to save recording during call detection');
    }
  };

  useCallDetection({
    onCallDetected: handleCallDetected,
    isRecording: recorderState.isRecording,
  });

  // Request permissions and setup audio mode
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission Required', 'Permission to access microphone was denied');
        setIsPermissionGranted(false);
      } else {
        setIsPermissionGranted(true);
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  // Auto-start recording when in resume mode
  useEffect(() => {
    if (isResuming && isPermissionGranted && !recorderState.isRecording) {
      console.log('Auto-starting recording in resume mode');
      startRecording();
      setIsResuming(false); // Reset the flag
    }
  }, [isResuming, isPermissionGranted, recorderState.isRecording]);

  // Track recording duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (recorderState.isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recorderState.isRecording]);

  const startRecording = async () => {
    if (!isPermissionGranted) {
      Alert.alert('Permission Required', 'Please grant microphone permission to record audio');
      return;
    }

    try {
      // Reset call detection flags when starting new recording
      setCallDetected(false);
      setFromCallDetection(false);
      
      // Reset recording duration for new segment (not total duration)
      setRecordingDuration(0);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const savedPath = audioRecorder.uri || '';
      
      updateRecordingUri(savedPath);
      updateDuration(recordingDuration);
      setSavedFilePath(savedPath);
      
      // For manual stops, ensure call detection flag is false
      setFromCallDetection(false);
      
      // Finalize the waveform data - use resumed version if in resume mode
      if (currentRecording.resumeMode) {
        finalizeResumedRecording();
        
        // Merge audio segments if we have previous segments
        if (currentRecording.previousAudioSegments.length > 0) {
          console.log('Merging audio segments...');
          const mergedUri = await mergeAudioSegments();
          if (mergedUri) {
            console.log('Audio segments merged successfully:', mergedUri);
            setSavedFilePath(mergedUri);
          }
        }
      } else {
        finalizeLiveWaveform();
      }
      
      console.log('Recording saved to:', savedPath);
      
      // Auto-navigate to audio-recording screen
      setIsNavigating(true);
      setTimeout(() => {
        router.push('../recordingScreen/audio-recording');
      }, 500);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const getCurrentDisplayDuration = () => {
    if (currentRecording.resumeMode) {
      return currentRecording.previousDuration + recordingDuration;
    }
    return recordingDuration;
  };

  const getRecordingStateText = () => {
    if (callDetected) {
      return "Call detected - Recording stopped";
    }
    if (recorderState.isRecording) {
      const displayDuration = getCurrentDisplayDuration();
      const resumeText = currentRecording.resumeMode ? " (Resumed)" : "";
      return `Recording... ${formatDuration(displayDuration)}${resumeText}`;
    }
    if (currentRecording.uri) {
      return "Recording ready to play";
    }
    if (isResuming) {
      return "Resume recording mode";
    }
    return "Start recording";
  };

  const getMainButtonAction = () => {
    if (recorderState.isRecording) {
      return stopRecording;
    }
    return startRecording;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // State
    recordingDuration,
    isPermissionGranted,
    isNavigating,
    audioRecorder,
    recorderState,
    callDetected,
    
    // Actions
    startRecording,
    stopRecording,
    getMainButtonAction,
    
    // Computed values
    getCurrentDisplayDuration,
    getRecordingStateText,
    formatDuration,
  };
}; 