import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, Colors } from '../../constants';

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onReplay?: () => void;
  showReplay?: boolean;
  onResumeRecording?: () => void;
  showResume?: boolean;
}

export const  AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onReplay,
  showReplay = false,
  onResumeRecording,
  showResume = false,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Playback Timer */}
      <Text style={styles.playbackLabel}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>

      {/* Play/Pause Button */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={onPlayPause}
      >
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={30} 
          color="#fff" 
        />
      </TouchableOpacity>

      {/* Recording Status */}
      <Text style={styles.status}>
        {isPlaying ? 'Playing...' : 'Paused'}
      </Text>

      {/* Replay Button - Optional */}
      {showReplay && onReplay && (
        <TouchableOpacity
          style={styles.replayButton}
          onPress={onReplay}
        >
          <Text style={styles.replayButtonText}>Replay</Text>
        </TouchableOpacity>
      )}

      {/* Resume Recording Button - Optional */}
      {showResume && onResumeRecording && (
        <TouchableOpacity
          style={styles.resumeButton}
          onPress={onResumeRecording}
        >
          <Ionicons name="mic" size={24} color="#fff" />
          <Text style={styles.resumeButtonText}>Resume Recording</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  playbackLabel: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: "#00AEEF",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: "center",
    marginVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  status: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginVertical: 8,
  },
  replayButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    marginTop: Spacing.md,
  },
  replayButtonText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
  resumeButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
    marginLeft: Spacing.sm,
  },
}); 