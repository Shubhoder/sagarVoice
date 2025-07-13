import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OutboxRecording {
  id: string;
  filename: string;
  uri: string;
  duration: number;
  dateRecorded: string;
  timeRecorded: string;
  timestamp: number;
  waveformData: number[];
  isPlaying: boolean;
  currentTime: number;
  title?: string;
}

interface OutboxContextType {
  recordings: OutboxRecording[];
  isLoading: boolean;
  addRecording: (recording: Omit<OutboxRecording, 'id' | 'isPlaying' | 'currentTime'>) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  updateRecording: (id: string, updates: Partial<OutboxRecording>) => void;
  playRecording: (id: string) => void;
  pauseRecording: (id: string) => void;
  stopAllRecordings: () => void;
  getRecordingsByDate: () => { [key: string]: OutboxRecording[] };
  refreshRecordings: () => Promise<void>;
}

const OutboxContext = createContext<OutboxContextType | undefined>(undefined);

const OUTBOX_STORAGE_KEY = 'outbox_recordings';
const OUTBOX_DIRECTORY = `${FileSystem.documentDirectory}outbox/`;

export const OutboxProvider = ({ children }: { children: ReactNode }) => {
  const [recordings, setRecordings] = useState<OutboxRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize outbox directory
  useEffect(() => {
    initializeOutboxDirectory();
  }, []);

  const initializeOutboxDirectory = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(OUTBOX_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(OUTBOX_DIRECTORY, { intermediates: true });
        console.log('Created outbox directory:', OUTBOX_DIRECTORY);
      }
      await loadRecordings();
    } catch (error) {
      console.error('Error initializing outbox directory:', error);
    }
  };

  const loadRecordings = async () => {
    try {
      setIsLoading(true);
      const storedRecordings = await AsyncStorage.getItem(OUTBOX_STORAGE_KEY);
      if (storedRecordings) {
        const parsedRecordings: OutboxRecording[] = JSON.parse(storedRecordings);
        
        // Verify files still exist and filter out missing files
        const validRecordings = [];
        for (const recording of parsedRecordings) {
          const fileInfo = await FileSystem.getInfoAsync(recording.uri);
          if (fileInfo.exists) {
            validRecordings.push({
              ...recording,
              isPlaying: false,
              currentTime: 0,
            });
          }
        }
        
        setRecordings(validRecordings);
        
        // Update storage if any files were removed
        if (validRecordings.length !== parsedRecordings.length) {
          await AsyncStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(validRecordings));
        }
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecordingsToStorage = async (newRecordings: OutboxRecording[]) => {
    try {
      await AsyncStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(newRecordings));
    } catch (error) {
      console.error('Error saving recordings to storage:', error);
    }
  };

  const generateFilename = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `recording_${year}-${month}-${day}_${hour}-${minute}-${second}.m4a`;
  };

  const addRecording = async (recordingData: Omit<OutboxRecording, 'id' | 'isPlaying' | 'currentTime'>) => {
    try {
      // Check for duplicates before adding
      const existingRecording = recordings.find(r => 
        r.uri === recordingData.uri || 
        (r.timestamp === recordingData.timestamp && Math.abs(r.duration - recordingData.duration) < 1)
      );
      
      if (existingRecording) {
        console.log('Recording already exists in outbox, skipping duplicate:', recordingData.uri);
        return;
      }

      const id = `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const filename = generateFilename(recordingData.timestamp);
      const destinationUri = `${OUTBOX_DIRECTORY}${filename}`;

      // Check if destination file already exists
      const destinationExists = await FileSystem.getInfoAsync(destinationUri);
      if (destinationExists.exists) {
        console.log('Destination file already exists, generating new filename');
        const newTimestamp = Date.now();
        const newFilename = generateFilename(newTimestamp);
        const newDestinationUri = `${OUTBOX_DIRECTORY}${newFilename}`;
        
        // Copy the recording file to the outbox directory with new filename
        await FileSystem.copyAsync({
          from: recordingData.uri,
          to: newDestinationUri,
        });

        const newRecording: OutboxRecording = {
          ...recordingData,
          id,
          filename: newFilename,
          uri: newDestinationUri,
          timestamp: newTimestamp,
          isPlaying: false,
          currentTime: 0,
        };

        const updatedRecordings = [...recordings, newRecording];
        setRecordings(updatedRecordings);
        await saveRecordingsToStorage(updatedRecordings);
        
        console.log('Recording added to outbox with new filename:', newFilename);
      } else {
        // Copy the recording file to the outbox directory
        await FileSystem.copyAsync({
          from: recordingData.uri,
          to: destinationUri,
        });

        const newRecording: OutboxRecording = {
          ...recordingData,
          id,
          filename,
          uri: destinationUri,
          isPlaying: false,
          currentTime: 0,
        };

        const updatedRecordings = [...recordings, newRecording];
        setRecordings(updatedRecordings);
        await saveRecordingsToStorage(updatedRecordings);
        
        console.log('Recording added to outbox:', filename);
      }
    } catch (error) {
      console.error('Error adding recording to outbox:', error);
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      const recordingToDelete = recordings.find(r => r.id === id);
      if (recordingToDelete) {
        // Delete the file
        await FileSystem.deleteAsync(recordingToDelete.uri);
        
        // Remove from state and storage
        const updatedRecordings = recordings.filter(r => r.id !== id);
        setRecordings(updatedRecordings);
        await saveRecordingsToStorage(updatedRecordings);
        
        console.log('Recording deleted from outbox:', recordingToDelete.filename);
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  const updateRecording = (id: string, updates: Partial<OutboxRecording>) => {
    setRecordings(prev => 
      prev.map(recording => 
        recording.id === id ? { ...recording, ...updates } : recording
      )
    );
  };

  const playRecording = (id: string) => {
    setRecordings(prev => 
      prev.map(recording => ({
        ...recording,
        isPlaying: recording.id === id ? true : false,
        currentTime: recording.id === id ? recording.currentTime : 0,
      }))
    );
  };

  const pauseRecording = (id: string) => {
    setRecordings(prev => 
      prev.map(recording => 
        recording.id === id ? { ...recording, isPlaying: false } : recording
      )
    );
  };

  const stopAllRecordings = () => {
    setRecordings(prev => 
      prev.map(recording => ({ 
        ...recording, 
        isPlaying: false,
        currentTime: 0,
      }))
    );
  };

  const getRecordingsByDate = () => {
    const grouped: { [key: string]: OutboxRecording[] } = {};
    
    recordings.forEach(recording => {
      const date = new Date(recording.timestamp);
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(recording);
    });

    // Sort recordings within each date group by timestamp (newest first)
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => b.timestamp - a.timestamp);
    });

    return grouped;
  };

  const refreshRecordings = async () => {
    await loadRecordings();
  };

  return (
    <OutboxContext.Provider
      value={{
        recordings,
        isLoading,
        addRecording,
        deleteRecording,
        updateRecording,
        playRecording,
        pauseRecording,
        stopAllRecordings,
        getRecordingsByDate,
        refreshRecordings,
      }}
    >
      {children}
    </OutboxContext.Provider>
  );
};

export const useOutboxContext = () => {
  const context = useContext(OutboxContext);
  if (context === undefined) {
    throw new Error('useOutboxContext must be used within an OutboxProvider');
  }
  return context;
}; 