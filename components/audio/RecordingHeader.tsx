import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography } from '../../constants';

interface RecordingHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export const RecordingHeader: React.FC<RecordingHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightIcon = 'person-add-outline',
  onRightPress,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      {showBackButton ? (
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      
      <Text style={styles.title}>{title}</Text>
      
      <TouchableOpacity onPress={onRightPress}>
        <Ionicons name={rightIcon} size={22} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 24,
  },
}); 