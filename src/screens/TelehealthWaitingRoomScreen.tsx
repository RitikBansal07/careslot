import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Button } from '../components/ui/Button';
import { telehealthService } from '../services/telehealthService';

export const TelehealthWaitingRoomScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TelehealthWaitingRoom'>>();
  const { bookingId } = route.params;

  const bookings = useFavoritesStore((state) => state.bookings);
  const booking = bookings.find((b) => b.bookingId === bookingId);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [camAllowed, setCamAllowed] = useState(true);
  const [micAllowed, setMicAllowed] = useState(true);

  const videoRef = useRef<any>(null);

  useEffect(() => {
    // Run diagnostics and start local camera mirror
    telehealthService.runPreCallDiagnostics().then((diag) => {
      setCamAllowed(diag.cameraGranted);
      setMicAllowed(diag.microphoneGranted);
    });

    if (Platform.OS === 'web' && videoRef.current) {
      telehealthService.startLocalPreview(videoRef.current);
    }

    return () => {
      telehealthService.stopLocalPreview();
    };
  }, []);

  const handleToggleMic = () => {
    const nextState = !isMicMuted;
    setIsMicMuted(nextState);
    telehealthService.toggleMicrophone(nextState);
  };

  const handleToggleCam = () => {
    const nextState = !isCamOff;
    setIsCamOff(nextState);
    telehealthService.toggleCamera(nextState);
  };

  const handleJoinCall = () => {
    navigation.replace('TelehealthCall', { bookingId });
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.errorTitle}>Appointment Not Found</Text>
          <Button title="Back to Home" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Back to appointment"
            style={styles.backBtn}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Virtual Waiting Room</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.content}>
          {/* Doctor Status Banner */}
          <View style={styles.doctorStatusCard}>
            <View style={styles.pulsingDot} />
            <View style={styles.doctorStatusTextCol}>
              <Text style={styles.doctorStatusTitle}>
                {booking.provider.name} is in the clinic
              </Text>
              <Text style={styles.doctorStatusSub}>
                Doctor is reviewing your visit reason: "{booking.reason}"
              </Text>
            </View>
          </View>

          {/* Camera Preview Mirror */}
          <View style={styles.previewContainer}>
            {Platform.OS === 'web' ? (
              // @ts-ignore
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // mirror for natural selfie preview
                  backgroundColor: '#0F172A',
                  display: isCamOff ? 'none' : 'block',
                }}
              />
            ) : null}

            {isCamOff && (
              <View style={styles.camOffPlaceholder}>
                <MaterialCommunityIcons name="camera-off" size={48} color="#94A3B8" />
                <Text style={styles.camOffText}>Camera is paused</Text>
              </View>
            )}

            {/* In-Preview Hardware Control Floating Bar */}
            <View style={styles.previewControls}>
              <TouchableOpacity
                onPress={handleToggleMic}
                style={[styles.circleBtn, isMicMuted && styles.circleBtnDanger]}
              >
                <MaterialCommunityIcons
                  name={isMicMuted ? 'microphone-off' : 'microphone'}
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleToggleCam}
                style={[styles.circleBtn, isCamOff && styles.circleBtnDanger]}
              >
                <MaterialCommunityIcons
                  name={isCamOff ? 'video-off' : 'video'}
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pre-Call Hardware Diagnostics */}
          <View style={styles.diagnosticsCard}>
            <Text style={styles.diagnosticsHeader}>Hardware Readiness Check</Text>

            <View style={styles.diagRow}>
              <View style={styles.diagItem}>
                <MaterialCommunityIcons
                  name={camAllowed && !isCamOff ? 'check-circle' : 'alert-circle'}
                  size={18}
                  color={camAllowed && !isCamOff ? '#16A34A' : '#F59E0B'}
                />
                <Text style={styles.diagText}>
                  Camera: {camAllowed ? (isCamOff ? 'Muted' : 'Ready') : 'Check Permission'}
                </Text>
              </View>

              <View style={styles.diagItem}>
                <MaterialCommunityIcons
                  name={micAllowed && !isMicMuted ? 'check-circle' : 'alert-circle'}
                  size={18}
                  color={micAllowed && !isMicMuted ? '#16A34A' : '#F59E0B'}
                />
                <Text style={styles.diagText}>
                  Mic: {micAllowed ? (isMicMuted ? 'Muted' : 'Ready') : 'Check Permission'}
                </Text>
              </View>
            </View>

            <View style={styles.hipaaBadge}>
              <MaterialCommunityIcons name="shield-lock-outline" size={14} color="#0369A1" />
              <Text style={styles.hipaaText}>
                Encrypted Peer-to-Peer Telehealth Stream (HIPAA Compliant)
              </Text>
            </View>
          </View>

          {/* Enter Room CTA Button */}
          <Button
            title="Join Video Consultation"
            onPress={handleJoinCall}
            variant="primary"
            size="lg"
            icon={<MaterialCommunityIcons name="video" size={20} color="#FFFFFF" />}
            style={styles.joinBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  doctorStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  doctorStatusTextCol: {
    flex: 1,
  },
  doctorStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doctorStatusSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  previewContainer: {
    flex: 1,
    maxHeight: 320,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camOffPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  camOffText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
  },
  previewControls: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    gap: 16,
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnDanger: {
    backgroundColor: '#EF4444',
  },
  diagnosticsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  diagnosticsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  diagItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagText: {
    color: '#CBD5E1',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  hipaaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  hipaaText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  joinBtn: {
    backgroundColor: '#0284C7',
    marginBottom: 8,
  },
});
