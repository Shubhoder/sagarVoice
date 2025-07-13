import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants';

interface RecordingInfoCardProps {
  savedFilePath?: string | null;
  duration: number;
  formatTime: (seconds: number) => string;
}

export const RecordingInfoCard: React.FC<RecordingInfoCardProps> = ({
  savedFilePath,
  duration,
  formatTime,
}) => {
  return (
    <View style={styles.recordingInfoCard}>
      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      <View style={styles.recordingInfoText}>
        <Text style={styles.recordingInfoTitle}>Recording Auto-Saved</Text>
        <Text style={styles.recordingInfoSubtitle}>
          Saved to: {savedFilePath ? savedFilePath.split('/').pop() : 'Unknown'}
        </Text>
        <Text style={styles.recordingInfoDuration}>
          Duration: {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  recordingInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  recordingInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  recordingInfoTitle: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "700",
    marginBottom: 4,
  },
  recordingInfoSubtitle: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "500",
    marginBottom: 2,
  },
  recordingInfoDuration: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "400",
  },
}); 