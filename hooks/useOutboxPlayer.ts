import { useState, useEffect, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export const useOutboxPlayer = (recordings: any[]) => {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get currently playing recording
  const playingRecording = recordings.find(r => r.id === currentPlayingId);
  
  // Create audio player for the currently playing recording
  const player = useAudioPlayer(playingRecording?.uri || null);
  const playerStatus = useAudioPlayerStatus(player);

  // Update player reference and initialization state
  useEffect(() => {
    playerRef.current = player;
    setIsInitialized(!!player);
  }, [player]);

  // Handle playback timing
  useEffect(() => {
    if (playerStatus.playing && currentPlayingId) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const recording = recordings.find(r => r.id === currentPlayingId);
          const maxDuration = recording?.duration || 0;
          const newTime = prev + 0.1;
          return newTime <= maxDuration ? newTime : maxDuration;
        });
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playerStatus.playing, currentPlayingId, recordings]);

  // Update duration when player loads
  useEffect(() => {
    if (playerStatus.duration && currentPlayingId) {
      setDuration(playerStatus.duration);
    }
  }, [playerStatus.duration, currentPlayingId]);

  // Reset timer when playback ends
  useEffect(() => {
    if (playerStatus.playing === false && currentTime > 0 && currentPlayingId) {
      // Check if playback actually ended (not just paused)
      const recordingDuration = playingRecording?.duration || 0;
      if (Math.abs(currentTime - recordingDuration) < 1) {
        setCurrentTime(0);
        setCurrentPlayingId(null);
      }
    }
  }, [playerStatus.playing, currentTime, playingRecording, currentPlayingId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const playRecording = async (recordingId: string) => {
    try {
      // First stop any currently playing recording
      if (currentPlayingId && currentPlayingId !== recordingId && playerRef.current) {
        await playerRef.current.pause();
      }

      // Set the new recording as current
      setCurrentPlayingId(recordingId);
      setCurrentTime(0);

      // Wait a bit for the player to initialize with the new recording
      await new Promise(resolve => setTimeout(resolve, 100));

      // Now play the recording
      if (playerRef.current) {
        await playerRef.current.play();
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      // Reset state on error
      setCurrentPlayingId(null);
      setCurrentTime(0);
    }
  };

  const pauseRecording = async (recordingId: string) => {
    try {
      if (playerRef.current && currentPlayingId === recordingId) {
        await playerRef.current.pause();
      }
    } catch (error) {
      console.error('Error pausing recording:', error);
    }
  };

  const stopAllRecordings = async () => {
    try {
      if (playerRef.current && currentPlayingId) {
        await playerRef.current.pause();
      }
      setCurrentPlayingId(null);
      setCurrentTime(0);
      setDuration(0);
    } catch (error) {
      console.error('Error stopping recordings:', error);
    }
  };

  const isPlaying = (recordingId: string) => {
    return currentPlayingId === recordingId && playerStatus.playing && isInitialized;
  };

  const seekTo = async (recordingId: string, position: number) => {
    try {
      if (playerRef.current && currentPlayingId === recordingId) {
        await playerRef.current.seekTo(position);
        setCurrentTime(position);
      }
    } catch (error) {
      console.error('Error seeking recording:', error);
    }
  };

  return {
    currentPlayingId,
    currentTime,
    duration,
    isPlaying,
    playRecording,
    pauseRecording,
    stopAllRecordings,
    seekTo,
    playerStatus,
    isInitialized,
  };
}; 