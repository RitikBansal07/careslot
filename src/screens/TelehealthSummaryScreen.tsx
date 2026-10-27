import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { formatDisplayDate } from '../utils/dateHelpers';
import { Button } from '../components/ui/Button';

export const TelehealthSummaryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TelehealthSummary'>>();
  const { bookingId, durationSeconds } = route.params;

  const bookings = useFavoritesStore((state) => state.bookings);
  const booking = bookings.find((b) => b.bookingId === bookingId);

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    if (mins === 0) {
      return `${remainderSecs} seconds`;
    }
    return `${mins}m ${remainderSecs}s`;
  };

  const handleDownloadSummary = () => {
    setDownloadSuccess(true);
    const msg = `CareSlot Clinical Summary & Rx for ${booking?.patientName} has been generated.`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Summary Downloaded', msg);
    }
  };

  const handleBookFollowUp = () => {
    if (booking) {
      navigation.navigate('ProviderDetail', { providerId: booking.provider.id });
    }
  };

  const handleReturnHome = () => {
    navigation.navigate('MainTabs', { screen: 'FavoritesTab' });
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.errorTitle}>Summary Not Found</Text>
          <Button title="Go to Home" onPress={() => navigation.navigate('MainTabs')} />
        </View>
      </SafeAreaView>
    );
  }

  const defaultNotes =
    booking.consultationNotes ||
    'Patient attended scheduled telehealth consultation. Vital review conducted virtually. Patient advised to rest, maintain hydration, and monitor symptoms. Follow-up recommended if symptoms persist.';

  const prescriptions =
    booking.prescriptions && booking.prescriptions.length > 0
      ? booking.prescriptions
      : [
          'Amoxicillin 500mg - 1 capsule twice daily for 7 days',
          'Saline Nasal Spray - 2 sprays per nostril every 12 hours',
        ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.headerBox}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="check-circle" size={44} color="#16A34A" />
          </View>
          <Text style={styles.headerTitle}>Consultation Completed</Text>
          <Text style={styles.headerSub}>
            Your video appointment with {booking.provider.name} is successfully concluded.
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <MaterialCommunityIcons name="timer-outline" size={14} color="#0284C7" />
              <Text style={styles.metaText}>Duration: {formatDuration(durationSeconds)}</Text>
            </View>
            <View style={styles.metaBadge}>
              <MaterialCommunityIcons name="file-document-check" size={14} color="#16A34A" />
              <Text style={styles.metaText}>Status: Documented</Text>
            </View>
          </View>
        </View>

        {/* Doctor & Clinic Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="doctor" size={20} color="#0284C7" />
            <Text style={styles.cardHeaderTitle}>Attending Physician</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.doctorName}>{booking.provider.name}</Text>
          <Text style={styles.doctorSub}>
            {booking.provider.specialty} • {booking.provider.title}
          </Text>
          <Text style={styles.clinicText}>{booking.provider.location.clinicName}</Text>
          <Text style={styles.dateText}>
            Visit Date: {formatDisplayDate(booking.slot.date)} at {booking.slot.startTime}
          </Text>
        </View>

        {/* Clinical Assessment & Doctor Notes */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="clipboard-pulse-outline" size={20} color="#0284C7" />
            <Text style={styles.cardHeaderTitle}>Doctor's Clinical Notes</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.notesText}>{defaultNotes}</Text>
        </View>

        {/* Digital Prescriptions & Care Plan */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="pill" size={20} color="#0284C7" />
            <Text style={styles.cardHeaderTitle}>Digital Prescriptions (Rx)</Text>
          </View>
          <View style={styles.divider} />
          {prescriptions.map((rx, idx) => (
            <View key={idx} style={styles.rxItem}>
              <MaterialCommunityIcons name="medical-bag" size={18} color="#16A34A" />
              <View style={styles.rxTextCol}>
                <Text style={styles.rxTitle}>{rx}</Text>
                <Text style={styles.rxStatus}>Sent to: Patient Preferred Local Pharmacy</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Download Receipt / Summary CTA */}
        <View style={styles.actionSection}>
          <Button
            title={downloadSuccess ? 'Summary Saved to Records' : 'Download Clinical Summary (PDF)'}
            onPress={handleDownloadSummary}
            variant="outline"
            size="lg"
            icon={<MaterialCommunityIcons name="file-download" size={20} color="#0284C7" />}
            style={styles.downloadBtn}
          />

          <Button
            title="Book Follow-up Consultation"
            onPress={handleBookFollowUp}
            variant="primary"
            size="lg"
            icon={<MaterialCommunityIcons name="calendar-plus" size={20} color="#FFFFFF" />}
            style={styles.followUpBtn}
          />

          <Button
            title="Go to My Appointments"
            onPress={handleReturnHome}
            variant="ghost"
            size="md"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 420,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  doctorSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  clinicText: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  rxItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rxTextCol: {
    flex: 1,
  },
  rxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  rxStatus: {
    fontSize: 12,
    color: '#16A34A',
  },
  actionSection: {
    gap: 12,
    marginTop: 8,
  },
  downloadBtn: {
    backgroundColor: '#FFFFFF',
  },
  followUpBtn: {
    backgroundColor: '#0284C7',
  },
});
