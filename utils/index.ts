export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const generateWaveform = (seed: string): number[] => {
  const numericSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const heights = [];
  for (let i = 0; i < 50; i++) {
    heights.push(Math.sin(i * 0.1 + numericSeed) * 15 + 20);
  }
  return heights;
};

export const getMostRecentRecording = (recordings: any[]): any | null => {
  if (recordings.length === 0) return null;
  
  const today = new Date();
  const todayRecordings = recordings.filter(recording => {
    const recordingDate = new Date(recording.timestamp);
    return recordingDate.toDateString() === today.toDateString();
  });
  
  if (todayRecordings.length === 0) {
    // If no recordings today, get the most recent overall
    return recordings.sort((a, b) => b.timestamp - a.timestamp)[0];
  }
  
  // Return the most recent from today
  return todayRecordings.sort((a, b) => b.timestamp - a.timestamp)[0];
};

// Export audio merger
export { AudioMerger } from './audioMerger'; 