import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Import modular components
import {
  PlaybackWaveform,
  RecordingHeader,
  CallDetectionAlert,
  RecordingInfoCard,
  ActionButtons,
  UploadModal,
} from "../../components/audio";

// Import hooks
import { useRecordingPlayback, usePhotoUpload } from "../../hooks";

// Import existing components
import FloatingTabs from "../floatingTabs";

const AudioRecordingScreen = () => {
  const router = useRouter();
  
  // Use custom hooks for logic
  const {
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
  } = useRecordingPlayback();

  const {
    uploadModalVisible,
    handleTakePhoto,
    handleChoosePhoto,
    openUploadModal,
    closeUploadModal,
  } = usePhotoUpload();

  // Extract waveform heights from live recorded data
  const waveformHeights = React.useMemo(() => {
    if (currentRecording.liveWaveformSamples && currentRecording.liveWaveformSamples.length > 0) {
      return currentRecording.liveWaveformSamples;
    }
    return currentRecording.waveformData.flatMap(data => data.samples);
  }, [currentRecording.liveWaveformSamples, currentRecording.waveformData]);

  if (!currentRecording.uri) {
    return (
      <View style={styles.container}>
        <Text style={styles.noRecordingText}>No recording available</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('../(tabs)/record')}
        >
          <Text style={styles.backButtonText}>Go Back to Record</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <RecordingHeader
        title={currentRecording.fromCallDetection ? "Auto-Saved Recording" : "Recording Playback"}
      />

      {/* Call Detection Alert */}
      <CallDetectionAlert
        visible={callDetected && currentRecording.fromCallDetection}
        onBackToRecord={handleBackToRecord}
      />

      {/* Recording Info */}
      {currentRecording.fromCallDetection && (
        <RecordingInfoCard
          savedFilePath={currentRecording.savedFilePath}
          duration={getTotalDuration()}
          formatTime={formatTime}
        />
      )}

      {/* Playback Waveform */}
      <PlaybackWaveform
        waveformData={waveformHeights}
        isPlaying={playerStatus.playing}
        currentTime={currentTime}
        duration={getTotalDuration()}
        onSeek={handleSeek}
      />

      {/* Playback Timer */}
      <Text style={styles.playbackLabel}>
        {formatTime(currentTime)} / {formatTime(getTotalDuration())}
      </Text>

      {/* Play/Pause Button */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePlayPause}
      >
        <Ionicons 
          name={playerStatus.playing ? "pause" : "play"} 
          size={30} 
          color="#fff" 
        />
      </TouchableOpacity>

      {/* Recording Status */}
      <Text style={styles.status}>
        {playerStatus.playing ? 'Playing...' : 'Paused'}
      </Text>

      {/* Resume Recording Button */}
      <TouchableOpacity 
        style={styles.resumeButton}
        onPress={handleResumeRecording}
      >
        <Ionicons name="mic" size={40} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.resumeText}>
        Tap to Resume Recording
      </Text>

      {/* Action Buttons */}
      <ActionButtons
        onDiscard={handleDiscard}
        onSend={handleSend}
        onDraft={handleDraft}
        onUpload={openUploadModal}
      />

      {/* Upload Modal */}
      <UploadModal
        visible={uploadModalVisible}
        onClose={closeUploadModal}
        onTakePhoto={handleTakePhoto}
        onChoosePhoto={handleChoosePhoto}
      />

      {/* Floating Tabs */}
      <FloatingTabs />
    </View>
  );
};

export default AudioRecordingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 100,
  },
  noRecordingText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 100,
  },
  backButton: {
    backgroundColor: "#00AEEF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  playbackLabel: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: "#00AEEF",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: "center",
    marginVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  status: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginVertical: 8,
  },
  resumeText: {
    color: "#00AEEF",
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },
  resumeButton: {
    backgroundColor: "#00AEEF",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    borderWidth: 3,
    borderColor: "#E5E7EB",
  },
});