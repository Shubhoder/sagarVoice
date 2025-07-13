import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';
import { useAudioContext } from '../contexts/AudioContext';
import { useOutboxContext } from '../contexts/OutboxContext';

export const useRecordingPlayback = () => {
  const router = useRouter();
  const { 
    currentRecording, 
    setIsResuming, 
    resetRecording, 
    callDetected, 
    setCallDetected, 
    setFromCallDetection, 
    prepareResume, 
    getTotalDuration 
  } = useAudioContext();
  const { addRecording } = useOutboxContext();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [hasBeenSavedToOutbox, setHasBeenSavedToOutbox] = useState(false);

  // Audio player setup
  const player = useAudioPlayer(currentRecording.uri);
  const playerStatus = useAudioPlayerStatus(player);

  // Setup audio mode for playback
  useEffect(() => {
    const setupAudio = async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
      await setIsAudioActiveAsync(true);
    };
    
    setupAudio();
  }, []);

  // Update current time during playback
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (playerStatus.playing) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          const totalDuration = getTotalDuration();
          return newTime <= totalDuration ? newTime : totalDuration;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playerStatus.playing, getTotalDuration()]);

  // Save recording to outbox when completed
  useEffect(() => {
    const saveToOutbox = async () => {
      if (currentRecording.uri && currentRecording.isComplete && !hasBeenSavedToOutbox) {
        try {
          const now = new Date();
          const dateRecorded = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          const timeRecorded = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          const recordingDuration = getTotalDuration();

          await addRecording({
            uri: currentRecording.uri,
            duration: recordingDuration,
            dateRecorded,
            timeRecorded,
            timestamp: now.getTime(),
            waveformData: currentRecording.liveWaveformSamples,
            filename: '',
            title: `Recording ${dateRecorded} ${timeRecorded}`,
          });

          setHasBeenSavedToOutbox(true);
          console.log('Recording saved to outbox successfully');
        } catch (error) {
          console.error('Failed to save recording to outbox:', error);
        }
      }
    };

    saveToOutbox();
  }, [currentRecording.uri, currentRecording.isComplete, hasBeenSavedToOutbox, addRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (player) {
      if (playerStatus.playing) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  const handleSeek = (position: number) => {
    const totalDuration = getTotalDuration();
    if (player && totalDuration > 0) {
      const seekTime = Math.max(0, Math.min(position, totalDuration));
      player.seekTo(seekTime);
      setCurrentTime(seekTime);
    }
  };

  const handleResumeRecording = () => {
    prepareResume();
    setIsResuming(true);
    router.push('../(tabs)/record');
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Recording',
      'Are you sure you want to discard this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => {
            resetRecording();
            router.push('../(tabs)/record');
          }
        },
      ]
    );
  };

  const handleSend = () => {
    Alert.alert('Send Recording', 'Recording sent successfully!');
  };

  const handleDraft = () => {
    Alert.alert('Save Draft', 'Recording saved as draft!');
  };

  const handleBackToRecord = () => {
    setCallDetected(false);
    setFromCallDetection(false);
    router.push('../(tabs)/record');
  };

  return {
    currentTime,
    playerStatus,
    callDetected,
    currentRecording,
    formatTime,
    handlePlayPause,
    handleSeek,
    handleResumeRecording,
    handleDiscard,
    handleSend,
    handleDraft,
    handleBackToRecord,
    getTotalDuration,
  };
}; 