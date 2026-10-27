import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { telehealthService } from '../services/telehealthService';
import { Button } from '../components/ui/Button';

export const TelehealthCallScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TelehealthCall'>>();
  const { bookingId } = route.params;

  const bookings = useFavoritesStore((state) => state.bookings);
  const booking = bookings.find((b) => b.bookingId === bookingId);

  const [callDuration, setCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [audioLevel, setAudioLevel] = useState(4);
  const [showInCallNotes, setShowInCallNotes] = useState(false);

  const selfVideoRef = useRef<any>(null);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Audio waveform animation simulation
  useEffect(() => {
    const waveTimer = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 5) + 2);
    }, 400);

    return () => clearInterval(waveTimer);
  }, []);

  // Initialize patient's local camera stream
  useEffect(() => {
    if (Platform.OS === 'web' && selfVideoRef.current) {
      telehealthService.startLocalPreview(selfVideoRef.current);
    }

    return () => {
      telehealthService.stopLocalPreview();
    };
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleEndCall = () => {
    telehealthService.stopLocalPreview();
    navigation.replace('TelehealthSummary', {
      bookingId,
      durationSeconds: Math.max(callDuration, 1),
    });
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.errorTitle}>Session Not Found</Text>
          <Button title="Back to Appointments" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Floating Telehealth Header */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.timerBadge}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#FFFFFF" />
              <Text style={styles.timerText}>{formatTimer(callDuration)}</Text>
            </View>
          </View>

          <View style={styles.securityBadge}>
            <MaterialCommunityIcons name="lock" size={13} color="#22C55E" />
            <Text style={styles.securityText}>AES-256 Encrypted</Text>
          </View>
        </View>

        {/* Doctor Main Video Stream Viewport */}
        <View style={styles.doctorViewport}>
          <Image
            source={{ uri: booking.provider.avatarUrl }}
            style={styles.doctorBackgroundBlur}
            blurRadius={20}
          />
          <View style={styles.doctorVideoOverlay}>
            <Image
              source={{ uri: booking.provider.avatarUrl }}
              style={styles.doctorMainAvatar}
            />
            <View style={styles.doctorInfoCard}>
              <View style={styles.doctorNameRow}>
                <Text style={styles.doctorName}>{booking.provider.name}</Text>
                <MaterialCommunityIcons name="check-decagram" size={18} color="#0284C7" />
              </View>
              <Text style={styles.doctorSpecialty}>
                {booking.provider.specialty} • {booking.provider.title}
              </Text>
              
              {/* Doctor Talking Audio Visualizer */}
              <View style={styles.audioWaveContainer}>
                {[1, 2, 3, 4, 5].map((bar) => (
                  <View
                    key={bar}
                    style={[
                      styles.audioWaveBar,
                      {
                        height: bar <= audioLevel ? 14 + (bar % 3) * 6 : 4,
                        backgroundColor: bar <= audioLevel ? '#0284C7' : '#475569',
                      },
                    ]}
                  />
                ))}
                <Text style={styles.speakingLabel}>Speaking...</Text>
              </View>
            </View>
          </View>

          {/* Floating Self-View (Picture in Picture) */}
          <View style={styles.selfPipBox}>
            {Platform.OS === 'web' ? (
              // @ts-ignore
              <video
                ref={selfVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: isCamOff ? 'none' : 'block',
                }}
              />
            ) : null}

            {isCamOff && (
              <View style={styles.selfCamOffView}>
                <MaterialCommunityIcons name="camera-off" size={24} color="#94A3B8" />
                <Text style={styles.selfCamOffText}>Camera Off</Text>
              </View>
            )}

            <View style={styles.selfPipBadge}>
              <Text style={styles.selfPipName}>{booking.patientName} (You)</Text>
              {isMicMuted && (
                <MaterialCommunityIcons name="microphone-off" size={12} color="#EF4444" />
              )}
            </View>
          </View>

          {/* In-Call Doctor Notes Drawer Overlay */}
          {showInCallNotes && (
            <View style={styles.notesDrawer}>
              <View style={styles.notesDrawerHeader}>
                <Text style={styles.notesDrawerTitle}>Live Consultation Agenda</Text>
                <TouchableOpacity
                  onPress={() => setShowInCallNotes(false)}
                  accessibilityRole={'button' as AccessibilityRole}
                  accessibilityLabel="Close consultation agenda"
                >
                  <MaterialCommunityIcons name="close" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.noteLabel}>Patient Reason for Visit:</Text>
              <Text style={styles.noteContent}>"{booking.reason}"</Text>
              <View style={styles.agendaItem}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#16A34A" />
                <Text style={styles.agendaText}>Symptom review & history check</Text>
              </View>
              <View style={styles.agendaItem}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#0284C7" />
                <Text style={styles.agendaText}>Clinical evaluation in progress</Text>
              </View>
              <View style={styles.agendaItem}>
                <MaterialCommunityIcons name="circle-outline" size={16} color="#64748B" />
                <Text style={styles.agendaText}>Prescription & recommendations</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Call Controls Toolbar */}
        <View style={styles.bottomControlsBar}>
          {/* Mute Mic */}
          <TouchableOpacity
            onPress={handleToggleMic}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
            style={[styles.controlButton, isMicMuted && styles.controlButtonDanger]}
          >
            <MaterialCommunityIcons
              name={isMicMuted ? 'microphone-off' : 'microphone'}
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.controlLabel}>{isMicMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          {/* Camera Toggle */}
          <TouchableOpacity
            onPress={handleToggleCam}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel={isCamOff ? 'Turn camera on' : 'Turn camera off'}
            style={[styles.controlButton, isCamOff && styles.controlButtonDanger]}
          >
            <MaterialCommunityIcons
              name={isCamOff ? 'camera-off' : 'camera'}
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.controlLabel}>{isCamOff ? 'Start Cam' : 'Stop Cam'}</Text>
          </TouchableOpacity>

          {/* Agenda / Notes */}
          <TouchableOpacity
            onPress={() => setShowInCallNotes(!showInCallNotes)}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Toggle consultation notes"
            style={[styles.controlButton, showInCallNotes && styles.controlButtonActive]}
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.controlLabel}>Agenda</Text>
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            onPress={handleEndCall}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="End consultation"
            style={styles.endCallButton}
          >
            <MaterialCommunityIcons name="phone-hangup" size={26} color="#FFFFFF" />
            <Text style={styles.endCallLabel}>End Visit</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    zIndex: 10,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  securityText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '600',
  },
  doctorViewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  doctorBackgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  doctorVideoOverlay: {
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: 20,
  },
  doctorMainAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#0284C7',
    marginBottom: 16,
    backgroundColor: '#1E293B',
  },
  doctorInfoCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
  },
  audioWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
    marginTop: 4,
  },
  audioWaveBar: {
    width: 4,
    borderRadius: 2,
  },
  speakingLabel: {
    marginLeft: 8,
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  selfPipBox: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0284C7',
    backgroundColor: '#1E293B',
    zIndex: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  selfCamOffView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    gap: 6,
  },
  selfCamOffText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  selfPipBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selfPipName: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notesDrawer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    zIndex: 30,
    elevation: 10,
  },
  notesDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  notesDrawerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  noteLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  noteContent: {
    fontSize: 13,
    color: '#38BDF8',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  agendaText: {
    fontSize: 13,
    color: '#E2E8F0',
  },
  bottomControlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    gap: 4,
  },
  controlButtonActive: {
    backgroundColor: '#0284C7',
  },
  controlButtonDanger: {
    backgroundColor: '#DC2626',
  },
  controlLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  endCallButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 78,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    gap: 4,
  },
  endCallLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
