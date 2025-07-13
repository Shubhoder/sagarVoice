import { useAuthContext } from '@/contexts/AuthContext';
import { useOutboxContext } from '@/contexts/OutboxContext';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RecentItem, RecordingCard, StatsCard } from '../../components/home';
import { AudioCard } from '../../components/audio';
import { useOutboxPlayer } from '../../hooks/useOutboxPlayer';
import { useAudioActions } from '../../hooks/useAudioActions';
import { AudioService } from '../../services/audioService';

import { Colors, Spacing, Typography } from '../../constants';

interface RecentRecord {
  id: string;
  patientName: string;
  date: string;
  time: string;
  duration: string;
  isPlaying: boolean;
}

export default function HomeScreen() {
  const { user } = useAuthContext();
  const { recordings, deleteRecording } = useOutboxContext();
  const { isPlaying, playRecording, pauseRecording, stopAllRecordings, currentTime } = useOutboxPlayer(recordings);
  const router = useRouter();
  
  // Use the audio actions hook
  const {
    selectedItemId,
    handleToggleSelection,
    handleShare,
    handleSend,
    handleDelete,
  } = useAudioActions(recordings, deleteRecording, stopAllRecordings);

  const [recentRecords, setRecentRecords] = React.useState<RecentRecord[]>([
    {
      id: '1',
      patientName: 'Patient Name',
      date: '28 May 2024',
      time: '04:22pm',
      duration: '00:30:40',
      isPlaying: false,
    },
    {
      id: '2',
      patientName: 'Patient Name',
      date: '28 May 2024',
      time: '04:22pm',
      duration: '00:30:40',
      isPlaying: false,
    },
  ]);

  // Get the most recent recording using the service
  const mostRecentRecording = useMemo(() => {
    return AudioService.getMostRecentRecording(recordings);
  }, [recordings]);

  const handleStatsPress = (type: 'pending' | 'sent') => {
    // Handle stats navigation or action
    // TODO: Implement navigation to stats screen
  };

  const handleRecordPress = () => {
    router.push('./record');
  };

  const handleTogglePlay = (id: string) => {
    setRecentRecords(prev =>
      prev.map(record =>
        record.id === id
          ? { ...record, isPlaying: !record.isPlaying }
          : { ...record, isPlaying: false }
      )
    );
  };

  // Audio card handlers
  const handleAudioPlayPause = async (recordingId: string) => {
    try {
      if (isPlaying(recordingId)) {
        await pauseRecording(recordingId);
      } else {
        await stopAllRecordings();
        await playRecording(recordingId);
      }
    } catch (error) {
      console.error('Error handling play/pause:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome</Text>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.subtitle}>Choose from the below options</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Pending"
            value="9"
            onPress={() => handleStatsPress('pending')}
          />
          <StatsCard
            title="Sent"
            value="73"
            onPress={() => handleStatsPress('sent')}
          />
        </View>
        
        <RecordingCard onPress={handleRecordPress} />

        <View style={styles.recentsSection}>
          <Text style={styles.recentsTitle}>Recents</Text>
          
          {/* Show most recent audio recording if available */}
          {mostRecentRecording && (
            <AudioCard
              id={mostRecentRecording.id}
              title={mostRecentRecording.title || mostRecentRecording.filename}
              sender="Dr. Rajeev"
              date={`${mostRecentRecording.dateRecorded} | ${mostRecentRecording.timeRecorded}`}
              duration={AudioService.formatDuration(mostRecentRecording.duration)}
              isPlaying={isPlaying(mostRecentRecording.id)}
              isSelected={selectedItemId === mostRecentRecording.id}
              waveformData={mostRecentRecording.waveformData}
              currentTime={currentTime}
              onPlayPause={() => handleAudioPlayPause(mostRecentRecording.id)}
              onToggleSelection={() => handleToggleSelection(mostRecentRecording.id)}
              showActions={true}
              onShare={() => handleShare(mostRecentRecording.id)}
              onSend={() => handleSend(mostRecentRecording.id)}
              onDelete={() => handleDelete(mostRecentRecording.id)}
            />
          )}
          
          {/* Show old mock data for other recent items */}
          {recentRecords.map(record => (
            <RecentItem
              key={record.id}
              patientName={record.patientName}
              date={record.date}
              time={record.time}
              duration={record.duration}
              isPlaying={record.isPlaying}
              onTogglePlay={() => handleTogglePlay(record.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  welcome: {
    fontSize: Typography.sizes.lg,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  userName: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  recentsSection: {
    marginTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  recentsTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semiBold,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
});