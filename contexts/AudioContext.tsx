import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WaveformData {
  id: string;
  samples: number[];
  duration: number;
  timestamp: number;
}

export interface AudioRecordingData {
  uri: string | null;
  duration: number;
  waveformData: WaveformData[];
  liveWaveformSamples: number[]; // Real-time samples collected during recording
  isComplete: boolean;
  fromCallDetection: boolean; // Flag to indicate if recording was stopped due to call detection
  savedFilePath: string | null; // Full path to the saved recording file
  previousDuration: number; // Duration from previous recording segments
  previousWaveformSamples: number[]; // Waveform samples from previous recording segments
  resumeMode: boolean; // Flag to indicate if we're in resume mode
  previousAudioSegments: AudioSegment[]; // Previous audio segments for merging
}

export interface AudioSegment {
  uri: string;
  duration: number;
  timestamp: number;
}

interface AudioContextType {
  currentRecording: AudioRecordingData;
  setCurrentRecording: (data: AudioRecordingData) => void;
  addWaveformSample: (sample: number) => void;
  batchWaveformSamples: (samples: number[]) => void;
  updateRecordingUri: (uri: string) => void;
  updateDuration: (duration: number) => void;
  resetRecording: () => void;
  isResuming: boolean;
  setIsResuming: (resuming: boolean) => void;
  callDetected: boolean;
  setCallDetected: (detected: boolean) => void;
  finalizeLiveWaveform: () => void;
  setFromCallDetection: (fromCall: boolean) => void;
  setSavedFilePath: (path: string) => void;
  prepareResume: () => void;
  getTotalDuration: () => number;
  getAllWaveformSamples: () => number[];
  finalizeResumedRecording: () => void;
  mergeAudioSegments: () => Promise<string | null>;
  addAudioSegment: (segment: AudioSegment) => void;
}

const defaultRecording: AudioRecordingData = {
  uri: null,
  duration: 0,
  waveformData: [],
  liveWaveformSamples: [],
  isComplete: false,
  fromCallDetection: false,
  savedFilePath: null,
  previousDuration: 0,
  previousWaveformSamples: [],
  resumeMode: false,
  previousAudioSegments: [],
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [currentRecording, setCurrentRecording] = useState<AudioRecordingData>(defaultRecording);
  const [isResuming, setIsResuming] = useState(false);
  const [callDetected, setCallDetected] = useState(false);

  const addWaveformSample = (sample: number) => {
    setCurrentRecording(prev => ({
      ...prev,
      liveWaveformSamples: [...prev.liveWaveformSamples, sample],
    }));
  };

  const batchWaveformSamples = (samples: number[]) => {
    setCurrentRecording(prev => ({
      ...prev,
      liveWaveformSamples: [...prev.liveWaveformSamples, ...samples],
    }));
  };

  const finalizeLiveWaveform = () => {
    setCurrentRecording(prev => {
      // Convert live samples to structured waveform data
      const waveformEntry: WaveformData = {
        id: `recording-${Date.now()}`,
        samples: prev.liveWaveformSamples,
        duration: prev.duration,
        timestamp: Date.now(),
      };
      
      return {
        ...prev,
        waveformData: [waveformEntry],
        isComplete: true,
      };
    });
  };

  const updateRecordingUri = (uri: string) => {
    setCurrentRecording(prev => ({
      ...prev,
      uri,
    }));
  };

  const updateDuration = (duration: number) => {
    setCurrentRecording(prev => ({
      ...prev,
      duration,
    }));
  };

  const resetRecording = () => {
    setCurrentRecording(defaultRecording);
    setIsResuming(false);
    setCallDetected(false);
  };

  const setFromCallDetection = (fromCall: boolean) => {
    setCurrentRecording(prev => ({
      ...prev,
      fromCallDetection: fromCall,
    }));
  };

  const setSavedFilePath = (path: string) => {
    setCurrentRecording(prev => ({
      ...prev,
      savedFilePath: path,
    }));
  };

  const prepareResume = () => {
    console.log('prepareResume', currentRecording);
    setCurrentRecording(prev => ({
      ...prev,
      previousDuration: prev.duration,
      previousWaveformSamples: [...prev.liveWaveformSamples],
      resumeMode: true,
      liveWaveformSamples: [], // Reset live samples for new recording segment
    }));
  };

  const getTotalDuration = () => {
    return currentRecording.previousDuration + currentRecording.duration;
  };

  const getAllWaveformSamples = () => {
    return [...currentRecording.previousWaveformSamples, ...currentRecording.liveWaveformSamples];
  };

  const finalizeResumedRecording = () => {
    setCurrentRecording(prev => {
      const allSamples = [...prev.previousWaveformSamples, ...prev.liveWaveformSamples];
      const totalDuration = prev.previousDuration + prev.duration;
      
      const waveformEntry: WaveformData = {
        id: `resumed-recording-${Date.now()}`,
        samples: allSamples,
        duration: totalDuration,
        timestamp: Date.now(),
      };
      
      return {
        ...prev,
        duration: totalDuration,
        liveWaveformSamples: allSamples,
        waveformData: [waveformEntry],
        isComplete: true,
        resumeMode: false,
      };
    });
  };

  const addAudioSegment = (segment: AudioSegment) => {
    setCurrentRecording(prev => ({
      ...prev,
      previousAudioSegments: [...prev.previousAudioSegments, segment],
    }));
  };

  const mergeAudioSegments = async (): Promise<string | null> => {
    try {
      const { AudioMerger } = await import('../utils/audioMerger');
      
      if (currentRecording.previousAudioSegments.length === 0) {
        return currentRecording.uri;
      }

      // Add current recording as the last segment
      const allSegments = [
        ...currentRecording.previousAudioSegments,
        {
          uri: currentRecording.uri!,
          duration: currentRecording.duration,
          timestamp: Date.now(),
        }
      ];

      const mergedUri = await AudioMerger.mergeAudioFiles(allSegments);
      
      // Update the recording with the merged URI
      setCurrentRecording(prev => ({
        ...prev,
        uri: mergedUri,
        duration: AudioMerger.getTotalDuration(allSegments),
        previousAudioSegments: [], // Clear segments after merging
      }));

      return mergedUri;
    } catch (error) {
      console.error('Error merging audio segments:', error);
      return null;
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentRecording,
        setCurrentRecording,
        addWaveformSample,
        batchWaveformSamples,
        updateRecordingUri,
        updateDuration,
        resetRecording,
        isResuming,
        setIsResuming,
        callDetected,
        setCallDetected,
        finalizeLiveWaveform,
        setFromCallDetection,
        setSavedFilePath,
        prepareResume,
        getTotalDuration,
        getAllWaveformSamples,
        finalizeResumedRecording,
        mergeAudioSegments,
        addAudioSegment,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}; 