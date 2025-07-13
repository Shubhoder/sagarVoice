# DoctorRecord App - Modular Architecture

## Overview
The app has been restructured into a modular architecture with clear separation of concerns, making it more maintainable, testable, and scalable.

## Directory Structure

```
react_native/
├── components/           # Reusable UI components
│   ├── audio/           # Audio-specific components
│   │   ├── AudioCard.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── WaveformVisualizer.tsx
│   │   ├── PlaybackWaveform.tsx
│   │   ├── RecordingHeader.tsx
│   │   ├── CallDetectionAlert.tsx
│   │   ├── RecordingInfoCard.tsx
│   │   ├── ActionButtons.tsx
│   │   ├── UploadModal.tsx
│   │   └── index.ts
│   ├── home/            # Home screen components
│   ├── ui/              # Generic UI components
│   ├── common/          # Common components
│   └── index.ts         # Main components export
├── hooks/               # Custom React hooks
│   ├── useAudioActions.ts
│   ├── useRecordingController.ts
│   ├── useOutboxPlayer.ts
│   ├── useCallDetection.ts
│   ├── useRecordingPlayback.ts
│   ├── usePhotoUpload.ts
│   └── index.ts
├── services/            # Business logic services
│   ├── audioService.ts
│   └── index.ts
├── utils/               # Utility functions
│   └── index.ts
├── contexts/            # React contexts
├── constants/           # App constants
└── app/                 # Screen components
```

## Key Modules

### 🎵 Audio Module (`components/audio/`)
**Purpose**: All audio-related UI components
- **AudioCard**: Reusable card component for displaying audio recordings
- **AudioPlayer**: Playback controls component
- **WaveformVisualizer**: Real-time waveform visualization during recording
- **PlaybackWaveform**: Waveform display with seek functionality for playback
- **RecordingHeader**: Header component for recording screens
- **CallDetectionAlert**: Alert component for call detection notifications
- **RecordingInfoCard**: Information card for auto-saved recordings
- **ActionButtons**: Action button row for recording operations
- **UploadModal**: Modal for photo upload functionality

### 🎛️ Hooks Module (`hooks/`)
**Purpose**: Custom React hooks for logic separation
- **useRecordingController**: Manages recording state and logic
- **useAudioActions**: Handles audio actions (share, send, delete)
- **useOutboxPlayer**: Manages outbox playback functionality
- **useCallDetection**: Handles call detection logic
- **useRecordingPlayback**: Manages recording playback logic and state
- **usePhotoUpload**: Handles photo upload functionality

### 🔧 Services Module (`services/`)
**Purpose**: Business logic and external integrations
- **AudioService**: Audio-related business logic (sharing, sending, deleting)

### 🛠️ Utils Module (`utils/`)
**Purpose**: Pure utility functions
- **formatDuration**: Format seconds to MM:SS
- **generateWaveform**: Generate waveform data for visualization
- **getMostRecentRecording**: Get most recent recording logic

## Benefits of This Architecture

### ✅ **Separation of Concerns**
- UI components are purely presentational
- Business logic is in services
- State management is in hooks
- Utilities are pure functions

### ✅ **Reusability**
- AudioCard can be used in multiple screens
- Hooks can be shared across components
- Services can be used anywhere in the app

### ✅ **Maintainability**
- Easy to find and modify specific functionality
- Clear dependencies between modules
- Reduced code duplication

### ✅ **Testability**
- Pure functions in utils are easy to test
- Hooks can be tested independently
- Services can be mocked for testing

### ✅ **Scalability**
- Easy to add new audio features
- Clear patterns for new components
- Modular structure supports team development

## Usage Examples

### Using Audio Components
```typescript
import { AudioCard, AudioPlayer } from '../../components/audio';

// In your component
<AudioCard
  id={recording.id}
  title={recording.title}
  isPlaying={isPlaying}
  onPlayPause={handlePlayPause}
  // ... other props
/>
```

### Refactored Audio Recording Screen
The audio recording screen has been completely modularized:

```typescript
// Before: 740 lines of mixed logic and UI
// After: Clean, modular structure

import {
  PlaybackWaveform,
  RecordingHeader,
  CallDetectionAlert,
  RecordingInfoCard,
  ActionButtons,
  UploadModal,
} from "../../components/audio";
import { useRecordingPlayback, usePhotoUpload } from "../../hooks";

const AudioRecordingScreen = () => {
  // Logic separated into custom hooks
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

  return (
    <View style={styles.container}>
      <RecordingHeader title="Recording Playback" />
      <CallDetectionAlert visible={callDetected} onBackToRecord={handleBackToRecord} />
      <RecordingInfoCard {...recordingInfo} />
      <PlaybackWaveform {...waveformProps} />
      <ActionButtons {...actionProps} />
      <UploadModal {...modalProps} />
    </View>
  );
};
```

**Benefits of the refactoring:**
- **Reduced from 740 lines to ~150 lines** in the main screen component
- **Logic separated into reusable hooks** (`useRecordingPlayback`, `usePhotoUpload`)
- **UI components are pure and reusable** across different screens
- **Easy to test** individual components and hooks
- **Clear separation of concerns** between UI, logic, and state management

### Using Custom Hooks
```typescript
import { useRecordingController } from '../../hooks/useRecordingController';

// In your component
const {
  recorderState,
  startRecording,
  stopRecording,
  getRecordingStateText
} = useRecordingController(router);
```

### Using Services
```typescript
import { AudioService } from '../../services/audioService';

// Share a recording
await AudioService.shareRecording(recordingId, recording);

// Format duration
const formatted = AudioService.formatDuration(seconds);
```

### Using Utils
```typescript
import { formatDuration, generateWaveform } from '../../utils';

// Format time
const time = formatDuration(125); // "02:05"

// Generate waveform
const waveform = generateWaveform("recording-123");
```

## Migration Guide

### Before (Monolithic)
- All logic mixed in screen components
- Duplicate code across files
- Hard to test and maintain

### After (Modular)
- Clear separation of UI, logic, and utilities
- Reusable components and hooks
- Easy to test and extend

## Best Practices

1. **Keep components pure**: Components should only handle UI logic
2. **Use hooks for state**: Complex state management goes in custom hooks
3. **Services for business logic**: External integrations and complex operations
4. **Utils for pure functions**: No side effects, easy to test
5. **Consistent naming**: Follow established patterns
6. **Type safety**: Use TypeScript interfaces for all props and data

## Future Enhancements

- Add unit tests for utils and services
- Create more specialized hooks for different features
- Add error boundaries for better error handling
- Implement proper state management (Redux/Zustand) if needed
- Add performance optimizations (React.memo, useMemo, useCallback) 