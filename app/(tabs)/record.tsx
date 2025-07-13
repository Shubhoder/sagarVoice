import { useRouter } from "expo-router";
import React, { useState, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from 'expo-audio';

import { Colors, Spacing, Typography } from "../../constants";
import { useAudioContext } from "../../contexts/AudioContext";
import { WaveformVisualizer, AudioPlayer } from "../../components/audio";
import { useRecordingController } from "../../hooks/useRecordingController";

export default function RecordScreen() {
  const router = useRouter();
  const { 
    currentRecording, 
    getTotalDuration, 
    prepareResume, 
    setIsResuming,
    addAudioSegment,
    mergeAudioSegments 
  } = useAudioContext();
  
  // Use the recording controller hook
  const {
    audioRecorder,
    recorderState,
    callDetected,
    getMainButtonAction,
    getRecordingStateText,
    formatDuration,
  } = useRecordingController(router);

  // Audio player setup (only when we have a recording)
  const player = useAudioPlayer(currentRecording.uri);
  const playerStatus = useAudioPlayerStatus(player);

  // Reset audio mode when playback stops
  useEffect(() => {
    const resetAudioMode = async () => {
      if (!playerStatus.playing && currentRecording.uri) {
        // Reset to recording mode when playback stops
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
        await setIsAudioActiveAsync(false);
      }
    };
    
    resetAudioMode();
  }, [playerStatus.playing, currentRecording.uri]);

  const playRecording = async () => {
    if (currentRecording.uri && player) {
      if (playerStatus.playing) {
        player.pause();
      } else {
        // Set audio mode for speaker playback
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false, // Disable recording during playback
        });
        await setIsAudioActiveAsync(true);
        player.play();
      }
    }
  };

  const replayRecording = async () => {
    if (currentRecording.uri && player) {
      // Set audio mode for speaker playback
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false, // Disable recording during playback
      });
      await setIsAudioActiveAsync(true);
      player.seekTo(0);
      player.play();
    }
  };

  const handleResumeRecording = async () => {
    if (currentRecording.uri && !recorderState.isRecording) {
      // Pause playback if playing
      if (playerStatus.playing) {
        player.pause();
      }

      // Add current recording as a segment for merging
      addAudioSegment({
        uri: currentRecording.uri,
        duration: currentRecording.duration,
        timestamp: Date.now(),
      });

      // Prepare for resume recording
      prepareResume();
      setIsResuming(true);

      // Navigate back to recording mode
      console.log('Preparing to resume recording...');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Real-time Waveform Header */}
      <WaveformVisualizer 
        isRecording={recorderState.isRecording} 
        audioRecorder={audioRecorder}
      />
      
      <View style={styles.content}>
        {/* Recording State Display */}
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{getRecordingStateText()}</Text>
          {recorderState.isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
            </View>
          )}
        </View>

        {/* Main Microphone Button */}
        <View style={styles.logoContainer}>
          <TouchableOpacity
            onPress={getMainButtonAction()}
            style={[
              styles.micButton,
              recorderState.isRecording && styles.micButtonRecording,
              currentRecording.resumeMode && !recorderState.isRecording && styles.micButtonResume
            ]}
          >
            <Image
              source={require("../../assets/mic.png")}
              style={{ 
                width: 120, 
                height: 120,
                tintColor: recorderState.isRecording ? '#fff' : 
                          currentRecording.resumeMode && !recorderState.isRecording ? '#10B981' : undefined
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {recorderState.isRecording ? "Tap to stop recording" : 
           currentRecording.resumeMode ? "Tap to resume recording" : "Tap to start recording"}
        </Text>

        {/* Playback Controls - Show only when we have a recording */}
        {currentRecording.uri && (
          <AudioPlayer
            isPlaying={playerStatus.playing}
            currentTime={0} // TODO: Add current time tracking
            duration={getTotalDuration()}
            onPlayPause={playRecording}
            onReplay={replayRecording}
            showReplay={true}
            onResumeRecording={handleResumeRecording}
            showResume={!recorderState.isRecording}
          />
        )}

        {/* Recording Info */}
        {currentRecording.uri && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Duration: {formatDuration(getTotalDuration())}
            </Text>
            <Text style={styles.infoText}>
              Status: {playerStatus.playing ? "Playing" : "Paused"}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  stateContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  stateText: {
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    fontWeight: Typography.weights.semiBold,
    marginBottom: Spacing.sm,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: Spacing.sm,
  },
  recordingText: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  micButton: {
    padding: Spacing.md,
    borderRadius: 80,
    backgroundColor: 'transparent',
  },
  micButtonRecording: {
    backgroundColor: '#ff4444',
  },
  micButtonResume: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#10B981',
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  infoContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginVertical: 2,
  },
});