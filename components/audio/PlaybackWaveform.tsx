import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Colors, Spacing } from '../../constants';

const { width: screenWidth } = Dimensions.get('window');

interface PlaybackWaveformProps {
  waveformData: number[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (position: number) => void;
}

export const PlaybackWaveform: React.FC<PlaybackWaveformProps> = ({
  waveformData,
  isPlaying,
  currentTime,
  duration,
  onSeek,
}) => {
  const [playheadPosition] = useState(new Animated.Value(0));
  const waveformWidth = screenWidth - 48;
  const barWidth = 3;
  const barSpacing = 1;
  const maxBars = Math.floor(waveformWidth / (barWidth + barSpacing));
  
  // Normalize waveform data to fit available bars
  const normalizedWaveform = React.useMemo(() => {
    if (waveformData.length === 0) return new Array(maxBars).fill(5);
    
    if (waveformData.length <= maxBars) {
      // Pad with baseline if too few samples
      return [
        ...waveformData,
        ...new Array(Math.max(0, maxBars - waveformData.length)).fill(5)
      ];
    } else {
      // Downsample if too many samples
      const step = waveformData.length / maxBars;
      return Array.from({ length: maxBars }, (_, i) => {
        const index = Math.floor(i * step);
        return waveformData[index] || 5;
      });
    }
  }, [waveformData, maxBars]);

  // Update playhead position based on current time
  useEffect(() => {
    if (duration > 0) {
      const progress = currentTime / duration;
      const newPosition = progress * waveformWidth;
      
      Animated.timing(playheadPosition, {
        toValue: newPosition,
        duration: isPlaying ? 100 : 0,
        useNativeDriver: false,
      }).start();
    }
  }, [currentTime, duration, waveformWidth, isPlaying]);

  const handleWaveformPress = (event: any) => {
    const touchX = event.nativeEvent.locationX;
    const progress = touchX / waveformWidth;
    const seekTime = progress * duration;
    onSeek(seekTime);
  };

  return (
    <TouchableOpacity 
      style={styles.waveformContainer}
      onPress={handleWaveformPress}
      activeOpacity={0.8}
    >
      <View style={styles.waveformContent}>
        {normalizedWaveform.map((height, index) => {
          const progress = duration > 0 ? currentTime / duration : 0;
          const barProgress = index / normalizedWaveform.length;
          const isPlayed = barProgress <= progress;
          
          return (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: Math.max(4, height),
                  backgroundColor: isPlayed ? Colors.primary : '#E5E7EB',
                  opacity: isPlayed ? 1 : 0.6,
                }
              ]}
            />
          );
        })}
        
        {/* Playhead indicator */}
        <Animated.View
          style={[
            styles.playhead,
            {
              left: playheadPosition,
            }
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  waveformContainer: {
    marginVertical: 24,
    paddingHorizontal: 24,
  },
  waveformContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    position: "relative",
  },
  waveformBar: {
    width: 3,
    minHeight: 4,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 0.5,
    borderRadius: 1.5,
  },
  playhead: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#EF4444",
    borderRadius: 1,
  },
}); 