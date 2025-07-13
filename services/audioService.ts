import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { formatDuration, getMostRecentRecording } from '../utils';

export interface AudioActionHandlers {
  onShare: (recordingId: string, recording: any) => Promise<void>;
  onSend: (recordingId: string, recording: any) => void;
  onDelete: (recordingId: string, recording: any, onConfirm: () => void) => void;
}

export class AudioService {
  static async shareRecording(recordingId: string, recording: any): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(recording.uri, {
          mimeType: 'audio/m4a',
          dialogTitle: `Share ${recording.title || recording.filename}`,
        });
      } else {
        console.log('Sharing is not available on this platform');
      }
    } catch (error) {
      console.error('Error sharing recording:', error);
    }
  }

  static sendRecording(recordingId: string, recording: any): void {
    Alert.alert(
      'Send Recording',
      `Send ${recording.title || recording.filename} to server?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => {
            // TODO: Implement actual send/upload functionality
            Alert.alert('Success', 'Recording sent successfully!');
            console.log('Sending recording:', recording.filename);
          }
        },
      ]
    );
  }

  static deleteRecording(
    recordingId: string, 
    recording: any, 
    onConfirm: () => void
  ): void {
    Alert.alert(
      'Delete Recording',
      `Are you sure you want to delete ${recording.title || recording.filename}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: onConfirm
        },
      ]
    );
  }

  // Re-export utility functions for convenience
  static formatDuration = formatDuration;
  static getMostRecentRecording = getMostRecentRecording;
} 