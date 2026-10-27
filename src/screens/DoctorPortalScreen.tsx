import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Button } from '../components/ui/Button';
import { formatDisplayDate } from '../utils/dateHelpers';

export const DoctorPortalScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuthStore();
  const bookings = useFavoritesStore((state) => state.bookings);

  const handleLogout = async () => {
    await logout();
    navigation.navigate('MainTabs');
  };

  const handleLaunchTelehealth = (bookingId: string) => {
    navigation.navigate('TelehealthCall', { bookingId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.backBtn}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Back to directory"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Physician Clinical Portal</Text>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Sign out"
          >
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Doctor Identity Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorAvatarBox}>
            <MaterialCommunityIcons name="doctor" size={36} color="#FFFFFF" />
          </View>
          <View style={styles.doctorInfoCol}>
            <View style={styles.doctorNameRow}>
              <Text style={styles.doctorName}>{user?.name || 'Dr. Sarah Jenkins'}</Text>
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-decagram" size={16} color="#16A34A" />
                <Text style={styles.verifiedText}>Verified MD</Text>
              </View>
            </View>
            <Text style={styles.doctorSpecialty}>
              {user?.specialty || 'Primary Care & Family Medicine'}
            </Text>
            <Text style={styles.doctorLicense}>License: {user?.licenseNumber || 'MD-CA-94821'}</Text>
          </View>
        </View>

        {/* Practice Metrics Bar */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>
              {bookings.filter((b) => b.status === 'confirmed').length}
            </Text>
            <Text style={styles.metricLabel}>Appointments</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>
              {bookings.filter((b) => b.visitType === 'telehealth' && b.status === 'confirmed').length}
            </Text>
            <Text style={styles.metricLabel}>Telehealth Rooms</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>4.95 ★</Text>
            <Text style={styles.metricLabel}>Patient Rating</Text>
          </View>
        </View>

        {/* Patient Appointment Queue */}
        <View style={styles.sectionHeaderRow}>
          <MaterialCommunityIcons name="calendar-clock" size={20} color="#0284C7" />
          <Text style={styles.sectionTitle}>Patient Consultation Queue</Text>
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Consultations in Queue</Text>
            <Text style={styles.emptySub}>
              Book an appointment using patient mode or the directory to simulate doctor-patient telehealth visits.
            </Text>
            <Button
              title="Switch to Patient View"
              onPress={() => navigation.navigate('MainTabs')}
              variant="outline"
              size="sm"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          bookings.map((booking) => {
            const isTelehealth = booking.visitType === 'telehealth';
            const isCancelled = booking.status === 'cancelled';

            return (
              <View key={booking.bookingId} style={styles.patientCard}>
                <View style={styles.patientCardHeader}>
                  <View>
                    <Text style={styles.patientName}>{booking.patientName}</Text>
                    <Text style={styles.patientContact}>
                      {booking.phone} • {booking.insuranceProvider}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.visitBadge,
                      isTelehealth ? styles.telehealthBadge : styles.inPersonBadge,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={isTelehealth ? 'video' : 'hospital-building'}
                      size={12}
                      color={isTelehealth ? '#0284C7' : '#0F766E'}
                    />
                    <Text
                      style={[
                        styles.visitBadgeText,
                        isTelehealth ? styles.telehealthBadgeText : styles.inPersonBadgeText,
                      ]}
                    >
                      {isTelehealth ? 'Telehealth HD' : 'In-Person'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <Text style={styles.reasonLabel}>Clinical Chief Complaint:</Text>
                <Text style={styles.reasonText}>"{booking.reason}"</Text>

                <View style={styles.timeRow}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
                  <Text style={styles.timeText}>
                    {formatDisplayDate(booking.slot.date)} at {booking.slot.startTime}
                  </Text>
                </View>

                {!isCancelled && isTelehealth && (
                  <Button
                    title="Launch Consultation as Attending Doctor"
                    onPress={() => handleLaunchTelehealth(booking.bookingId)}
                    variant="primary"
                    size="md"
                    icon={<MaterialCommunityIcons name="video-account" size={18} color="#FFFFFF" />}
                    style={styles.launchCallBtn}
                  />
                )}
              </View>
            );
          })
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  logoutBtn: {
    padding: 6,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 16,
  },
  doctorAvatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfoCol: {
    flex: 1,
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  doctorLicense: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  patientCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  patientContact: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  visitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  telehealthBadge: {
    backgroundColor: '#E0F2FE',
  },
  inPersonBadge: {
    backgroundColor: '#CCFBF1',
  },
  visitBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  telehealthBadgeText: {
    color: '#0284C7',
  },
  inPersonBadgeText: {
    color: '#0F766E',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  reasonText: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  launchCallBtn: {
    backgroundColor: '#16A34A',
  },
});
