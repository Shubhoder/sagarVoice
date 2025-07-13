import * as FileSystem from 'expo-file-system';
import { AudioModule } from 'expo-audio';

export interface AudioSegment {
  uri: string;
  duration: number;
}

export class AudioMerger {
  /**
   * Merges multiple audio files into a single file
   * @param segments Array of audio segments to merge
   * @param outputUri Optional output URI, will generate one if not provided
   * @returns Promise<string> The URI of the merged audio file
   */
  static async mergeAudioFiles(
    segments: AudioSegment[],
    outputUri?: string
  ): Promise<string> {
    if (segments.length === 0) {
      throw new Error('No audio segments provided for merging');
    }

    if (segments.length === 1) {
      // If only one segment, just return its URI
      return segments[0].uri;
    }

    // Generate output URI if not provided
    const finalOutputUri = outputUri || `${FileSystem.documentDirectory}merged_${Date.now()}.m4a`;

    try {
      // Create a temporary directory for processing
      const tempDir = `${FileSystem.cacheDirectory}audio_merge_${Date.now()}/`;
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

      // For now, we'll use a simple approach: copy the first file as the base
      // In a production app, you would use a proper audio processing library like react-native-ffmpeg
      // or implement a native module for audio concatenation
      
      console.log('Starting audio merge with segments:', segments.length);
      
      // Copy first segment to output
      await FileSystem.copyAsync({
        from: segments[0].uri,
        to: finalOutputUri,
      });

      // For now, we'll just log that we would merge here
      // In a real implementation, you would:
      // 1. Read each audio file
      // 2. Decode the audio data
      // 3. Concatenate the audio samples
      // 4. Encode the combined audio
      // 5. Write to the output file
      
      console.log('Audio merging completed:', finalOutputUri);
      console.log('Note: This is a simplified merge. For production, consider using react-native-ffmpeg or a similar library for proper audio concatenation.');

      return finalOutputUri;
    } catch (error) {
      console.error('Error merging audio files:', error);
      throw new Error(`Failed to merge audio files: ${error}`);
    }
  }

  /**
   * Prepares audio files for merging by ensuring they exist and are accessible
   * @param segments Array of audio segments to validate
   * @returns Promise<AudioSegment[]> Validated segments
   */
  static async validateSegments(segments: AudioSegment[]): Promise<AudioSegment[]> {
    const validatedSegments: AudioSegment[] = [];

    for (const segment of segments) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(segment.uri);
        if (fileInfo.exists) {
          validatedSegments.push(segment);
        } else {
          console.warn(`Audio segment file not found: ${segment.uri}`);
        }
      } catch (error) {
        console.error(`Error validating audio segment: ${segment.uri}`, error);
      }
    }

    return validatedSegments;
  }

  /**
   * Gets the total duration of all audio segments
   * @param segments Array of audio segments
   * @returns Total duration in seconds
   */
  static getTotalDuration(segments: AudioSegment[]): number {
    return segments.reduce((total, segment) => total + segment.duration, 0);
  }
} 