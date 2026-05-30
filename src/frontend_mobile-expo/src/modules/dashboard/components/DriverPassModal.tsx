import React from 'react';
import { View, Text, Modal, Image, Pressable, StyleSheet, Platform } from 'react-native';
import styles from '../style/Dashboard.style';

type Profile = {
  fullName: string;
  license: string;
  company?: string;
  avatarUrl?: string;
  vehicleNumber?: string;
  parkingZone?: string;
  parkingSlot?: string;
};

type Appointment = {
  code: string;
  time?: string;
};

export default function DriverPassModal({
  visible,
  onClose,
  profile,
  appointment,
  verified,
}: {
  visible: boolean;
  onClose: () => void;
  profile: Profile;
  appointment?: Appointment;
  verified?: boolean;
}) {
  const showParkingInfo = Boolean(verified);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.qrModalOverlay}>
        <View style={[styles.qrModalInner, localStyles.passContainer]}>
          <View style={[styles.qrModalFrame, localStyles.passFrame]}>
            <Image
              source={require('../../../../assets/images/qr.png')}
              style={localStyles.passQr}
              resizeMode="contain"
            />
            <View style={localStyles.passBadge}>
              <Text style={localStyles.passBadgeText}>PORT DRIVER PASS</Text>
            </View>
            <View style={localStyles.infoPanel}>
              <Text style={localStyles.infoLabel}>MÃ LỊCH HẸN</Text>
              <Text style={localStyles.infoValue}>{appointment?.code ?? 'AP-1024'}</Text>

              <Text style={localStyles.infoLabel}>TÀI XẾ</Text>
              <Text style={localStyles.infoValue}>{profile.fullName}</Text>

              <Text style={localStyles.infoLabel}>BIỂN SỐ</Text>
              <Text style={localStyles.infoValue}>{profile.vehicleNumber ?? '-'}</Text>

              <Text style={localStyles.infoLabel}>KHUNG GIỜ</Text>
              <Text style={localStyles.infoValue}>{appointment?.time ?? '09:30'}</Text>
            </View>

            {showParkingInfo && (
              <View style={localStyles.parkingPanel}>
                <Text style={localStyles.parkingTitle}>THÔNG TIN Ô ĐỖ XE</Text>
                <View style={localStyles.parkingGrid}>
                  <View style={localStyles.parkingItem}>
                    <Text style={localStyles.parkingLabel}>KHU ĐỖ XE</Text>
                    <Text style={localStyles.parkingValue}>{profile.parkingZone ?? 'Khu A'}</Text>
                  </View>
                  <View style={localStyles.parkingItem}>
                    <Text style={localStyles.parkingLabel}>Ô ĐỖ XE</Text>
                    <Text style={localStyles.parkingValue}>{profile.parkingSlot ?? 'A-18'}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <Pressable style={[styles.resetButton, localStyles.closeButton]} onPress={onClose} accessibilityRole="button">
            <Text style={[styles.resetButtonText, localStyles.closeButtonText]}>Đóng</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  passContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  passFrame: {
    width: 340,
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#0b1220',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(246, 192, 106, 0.28)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 14,
  },
  passQr: {
    width: 240,
    height: 240,
    borderRadius: 12,
    backgroundColor: '#f7f0e4',
    padding: 12,
  },
  passBadge: {
    marginTop: 10,
    backgroundColor: '#071426',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 22,
    alignSelf: 'center',
  },
  passBadgeText: {
    color: '#f6c06a',
    fontWeight: '900',
    letterSpacing: 1.3,
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Avenir Next Condensed', android: 'sans-serif-condensed', default: undefined }),
  },
  infoPanel: { marginTop: 18, width: '100%', paddingHorizontal: 6 },
  infoLabel: {
    color: '#92a4c6',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: 1.3,
    fontFamily: Platform.select({ ios: 'Avenir Next Condensed', android: 'sans-serif-condensed', default: undefined }),
  },
  infoValue: {
    color: '#f6f7fb',
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '800' : '700',
    marginTop: 2,
    lineHeight: 21,
  },
  parkingPanel: {
    width: '100%',
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(246, 192, 106, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(246, 192, 106, 0.22)',
  },
  parkingTitle: {
    color: '#f6c06a',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 10,
    fontFamily: Platform.select({ ios: 'Avenir Next Condensed', android: 'sans-serif-condensed', default: undefined }),
  },
  parkingGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  parkingItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(7, 20, 38, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(185, 204, 234, 0.12)',
  },
  parkingLabel: {
    color: '#9cb0d1',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  parkingValue: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
  },
  closeButton: {
    backgroundColor: '#f6a313',
    shadowColor: '#f6a313',
    shadowOpacity: 0.25,
  },
  closeButtonText: {
    color: '#071122',
    fontWeight: '900',
  },
});
