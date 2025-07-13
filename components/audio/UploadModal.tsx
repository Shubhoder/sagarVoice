import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants';

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onClose,
  onTakePhoto,
  onChoosePhoto,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Ionicons name="cloud-upload-outline" size={26} color="#999" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.modalTitle}>Upload files</Text>
              <Text style={styles.modalSubtitle}>
                Select and upload the files of your choice
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{ marginLeft: "auto" }}
            >
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.uploadOptions}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onTakePhoto}
            >
              <Ionicons name="camera-outline" size={28} color="#333" />
              <Text style={styles.uploadButtonText}>Take photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onChoosePhoto}
            >
              <Ionicons name="image-outline" size={28} color="#333" />
              <Text style={styles.uploadButtonText}>Choose photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#777",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 16,
  },
  uploadOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  uploadButton: {
    backgroundColor: "#F0F8FF",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    width: "45%",
  },
  uploadButtonText: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
  },
}); 