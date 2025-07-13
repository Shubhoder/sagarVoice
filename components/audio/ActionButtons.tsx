import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants';

interface ActionButtonsProps {
  onDiscard: () => void;
  onSend: () => void;
  onDraft: () => void;
  onUpload: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onDiscard,
  onSend,
  onDraft,
  onUpload,
}) => {
  return (
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.actionItem} onPress={onDiscard}>
        <Ionicons name="trash-outline" size={26} color={Colors.primary} />
        <Text style={styles.actionText}>Discard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem} onPress={onSend}>
        <Ionicons name="arrow-up" size={26} color={Colors.primary} />
        <Text style={styles.actionText}>Send</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem} onPress={onDraft}>
        <Ionicons name="copy-outline" size={26} color={Colors.primary} />
        <Text style={styles.actionText}>Draft</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem} onPress={onUpload}>
        <Ionicons name="camera-outline" size={26} color={Colors.primary} />
        <Text style={styles.actionText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 32,
    paddingHorizontal: 16,
  },
  actionItem: { 
    alignItems: "center" 
  },
  actionText: { 
    color: "#555", 
    fontSize: 14, 
    marginTop: 6 
  },
}); 