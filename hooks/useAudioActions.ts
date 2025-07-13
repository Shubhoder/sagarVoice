import { useState } from 'react';
import { AudioService } from '../services/audioService';

export const useAudioActions = (recordings: any[], deleteRecording: (id: string) => void, stopAllRecordings: () => void) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleToggleSelection = (recordingId: string) => {
    if (selectedItemId === recordingId) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(recordingId);
    }
  };

  const handleShare = async (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      await AudioService.shareRecording(recordingId, recording);
    }
  };

  const handleSend = (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      AudioService.sendRecording(recordingId, recording);
    }
  };

  const handleDelete = (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      AudioService.deleteRecording(recordingId, recording, () => {
        // Stop playing if this recording is currently playing
        stopAllRecordings();
        // Remove from outbox
        deleteRecording(recordingId);
        // Close selection
        setSelectedItemId(null);
      });
    }
  };

  const clearSelection = () => {
    setSelectedItemId(null);
  };

  return {
    selectedItemId,
    handleToggleSelection,
    handleShare,
    handleSend,
    handleDelete,
    clearSelection,
  };
}; 