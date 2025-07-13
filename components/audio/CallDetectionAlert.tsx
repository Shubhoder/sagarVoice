import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants';

interface CallDetectionAlertProps {
  visible: boolean;
  onBackToRecord: () => void;
}

export const CallDetectionAlert: React.FC<CallDetectionAlertProps> = ({
  visible,
  onBackToRecord,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.callAlert}>
      <Ionicons name="call" size={20} color="#FF6B6B" />
      <Text style={styles.callAlertText}>Call detected - Recording auto-saved</Text>
      <TouchableOpacity 
        style={styles.callAlertButton}
        onPress={onBackToRecord}
      >
        <Text style={styles.callAlertButtonText}>Back to Record</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  callAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  callAlertText: {
    flex: 1,
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
    marginLeft: 8,
  },
  callAlertButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  callAlertButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
}); 