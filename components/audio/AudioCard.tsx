import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { generateWaveform } from '../../utils';

interface AudioCardProps {
  id: string;
  title: string;
  sender: string;
  date: string;
  duration: string;
  isPlaying: boolean;
  isSelected: boolean;
  waveformData?: number[];
  currentTime: number;
  onPlayPause: () => void;
  onToggleSelection?: () => void;
  showActions?: boolean;
  onShare?: () => void;
  onSend?: () => void;
  onDelete?: () => void;
}

const VoiceWaveform: React.FC<{
  itemId: string;
  isSelected: boolean;
  waveformData?: number[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}> = ({ itemId, isSelected, waveformData, isPlaying, currentTime, duration }) => {
  const waveformHeights = waveformData || generateWaveform(itemId);
  
  // Calculate progress based on playback
  let playedIndex = 0;
  if (isPlaying && duration > 0) {
    const progress = Math.min(currentTime / duration, 1);
    playedIndex = Math.floor(progress * waveformHeights.length);
  }

  return (
    <View style={styles.waveformContainer}>
      {waveformHeights.map((height, index) => (
        <View
          key={index}
          style={[
            styles.waveformBar,
            {
              height: Math.max(4, height),
              backgroundColor: index < playedIndex ? "#00AEEF" : "#E5E7EB",
            }
          ]}
        />
      ))}
    </View>
  );
};

export const AudioCard: React.FC<AudioCardProps> = ({
  id,
  title,
  sender,
  date,
  duration,
  isPlaying,
  isSelected,
  waveformData,
  currentTime,
  onPlayPause,
  onToggleSelection,
  showActions = false,
  onShare,
  onSend,
  onDelete,
}) => {
  const parseDuration = (durationStr: string) => {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  return (
    <TouchableOpacity
      onPress={onToggleSelection}
      style={styles.container}
    >
      <View style={styles.cardContent}>
        {/* Play Button */}
        <TouchableOpacity
          onPress={onPlayPause}
          style={[
            styles.playButton,
            { backgroundColor: isPlaying ? "#00AEEF" : "#E5E7EB" }
          ]}
        >
          {isPlaying ? (
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          ) : (
            <Feather name="play" size={20} color="#666" />
          )}
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sender}>{sender}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        {/* Duration */}
        <Text style={styles.duration}>{duration}</Text>
      </View>

      {/* Voice Waveform - Only show for selected item */}
      {isSelected && (
        <VoiceWaveform 
          itemId={id} 
          isSelected={isSelected} 
          waveformData={waveformData}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={parseDuration(duration)}
        />
      )}

      {/* Audio Status - Show when playing */}
      {isPlaying && (
        <View style={styles.audioStatus}>
          <Text style={styles.audioStatusText}>
            Playing... {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {duration}
          </Text>
        </View>
      )}

      {/* Action Buttons - Only show for selected item when showActions is true */}
      {isSelected && showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionItem} onPress={onDelete}>
            <View style={styles.deleteActionButton}>
              <Feather name="trash-2" size={24} color="#EF4444" />
            </View>
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={onSend}>
            <View style={styles.sendActionButton}>
              <Feather name="send" size={24} color="#00AEEF" />
            </View>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={onShare}>
            <View style={styles.shareActionButton}>
              <Feather name="share-2" size={24} color="#10B981" />
            </View>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  pauseIcon: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  pauseBar: {
    width: 3,
    height: 16,
    backgroundColor: "#fff",
    marginHorizontal: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  sender: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  date: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  duration: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 16,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    marginVertical: 10,
  },
  waveformBar: {
    width: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 1,
    borderRadius: 1,
  },
  audioStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
  },
  audioStatusText: {
    fontSize: 14,
    color: '#00AEEF',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  actionItem: {
    alignItems: "center",
    marginHorizontal: 25,
  },
  deleteActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  sendActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  shareActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
}); 