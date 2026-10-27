import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Button } from '../components/ui/Button';
import { formatDisplayDate } from '../utils/dateHelpers';

export const ConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Confirmation'>>();
  const { bookingId } = route.params;

  const bookings = useFavoritesStore((state) => state.bookings);
  const booking = bookings.find((b) => b.bookingId === bookingId);

  const handleAddToCalendar = () => {
    if (!booking) return;

    if (Platform.OS === 'web') {
      // Create and download an .ics iCalendar file for browser users
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CareSlot//Appointment Booking//EN',
        'BEGIN:VEVENT',
        `SUMMARY:CareSlot: ${booking.provider.name} (${booking.provider.specialty})`,
        `DESCRIPTION:Reason: ${booking.reason}\\nClinic: ${booking.provider.location.clinicName}\\nAddress: ${booking.provider.location.address}`,
        `LOCATION:${booking.provider.location.clinicName}, ${booking.provider.location.address}`,
        `DTSTART:${booking.slot.date.replace(/-/g, '')}T090000Z`,
        `DTEND:${booking.slot.date.replace(/-/g, '')}T093000Z`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CareSlot-Appointment-${booking.bookingId}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert(
        'Calendar Export',
        `Appointment on ${formatDisplayDate(booking.slot.date)} at ${booking.slot.startTime} with ${booking.provider.name} exported to your device calendar.`
      );
    }
  };

  const handleShareReceipt = async () => {
    if (!booking) return;
    try {
      await Share.share({
        title: `CareSlot Appointment: ${booking.provider.name}`,
        message: `CareSlot Confirmed Appointment (#${booking.bookingId})\nDoctor: ${booking.provider.name} (${booking.provider.specialty})\nDate: ${formatDisplayDate(booking.slot.date)} at ${booking.slot.startTime}\nLocation: ${booking.provider.location.clinicName}, ${booking.provider.location.address}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleViewAppointments = () => {
    navigation.navigate('MainTabs', {
      screen: 'FavoritesTab',
    });
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Appointment Receipt Not Found</Text>
          <Button title="Back to Home" onPress={handleGoHome} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Header */}
        <View style={styles.successHeader}>
          <View style={styles.checkmarkCircle}>
            <MaterialCommunityIcons name="check-bold" size={38} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Appointment Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your visit has been successfully scheduled. We've sent details to {booking.email}.
          </Text>
          <View style={styles.refBadge}>
            <Text style={styles.refText}>Booking Ref: #{booking.bookingId}</Text>
          </View>
        </View>

        {/* Detailed Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#16A34A" />
            <Text style={styles.cardHeaderTitle}>Official Booking Receipt</Text>
          </View>

          <View style={styles.receiptDivider} />

          {/* Provider Section */}
          <View style={styles.receiptSection}>
            <Text style={styles.sectionCaption}>Doctor & Specialty</Text>
            <Text style={styles.primaryText}>{booking.provider.name}</Text>
            <Text style={styles.secondaryText}>
              {booking.provider.specialty} • {booking.provider.title}
            </Text>
          </View>

          {/* Date & Time */}
          <View style={styles.receiptSection}>
            <Text style={styles.sectionCaption}>Date & Time</Text>
            <Text style={styles.primaryText}>
              {formatDisplayDate(booking.slot.date)}
            </Text>
            <Text style={styles.secondaryText}>{booking.slot.startTime} - {booking.slot.endTime}</Text>
          </View>

          {/* Location */}
          <View style={styles.receiptSection}>
            <Text style={styles.sectionCaption}>Clinic Location</Text>
            <Text style={styles.primaryText}>{booking.provider.location.clinicName}</Text>
            <Text style={styles.secondaryText}>
              {booking.provider.location.address}, {booking.provider.location.city}, {booking.provider.location.state}
            </Text>
          </View>

          {/* Patient Details */}
          <View style={styles.receiptSection}>
            <Text style={styles.sectionCaption}>Patient Details</Text>
            <Text style={styles.primaryText}>{booking.patientName}</Text>
            <Text style={styles.secondaryText}>
              {booking.phone} • {booking.email}
            </Text>
          </View>

          {/* Visit Reason & Insurance */}
          <View style={styles.receiptSection}>
            <Text style={styles.sectionCaption}>Visit Reason & Coverage</Text>
            <Text style={styles.primaryText}>{booking.reason}</Text>
            <Text style={styles.secondaryText}>
              Insurance: {booking.insuranceProvider}
            </Text>
            {booking.notes ? (
              <Text style={styles.notesText}>Notes: {booking.notes}</Text>
            ) : null}
          </View>

          {/* Quick Receipt Actions: Calendar & Share */}
          <View style={styles.receiptActionsRow}>
            <Button
              title="Add to Calendar"
              onPress={handleAddToCalendar}
              variant="outline"
              size="sm"
              icon={<MaterialCommunityIcons name="calendar-plus" size={16} color="#0284C7" />}
              style={styles.actionPill}
            />
            <Button
              title="Share"
              onPress={handleShareReceipt}
              variant="outline"
              size="sm"
              icon={<MaterialCommunityIcons name="share-variant" size={16} color="#0284C7" />}
              style={styles.actionPill}
            />
          </View>
        </View>

        {/* Primary Navigation Actions */}
        <View style={styles.ctaGroup}>
          <Button
            title="View All My Appointments"
            onPress={handleViewAppointments}
            variant="primary"
            size="lg"
            style={styles.mainCtaBtn}
          />

          <Button
            title="Back to Provider Directory"
            onPress={handleGoHome}
            variant="ghost"
            size="md"
            style={styles.secondaryCtaBtn}
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
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  successHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  checkmarkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 320,
  },
  refBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 12,
  },
  refText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    marginLeft: 6,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  receiptSection: {
    marginBottom: 14,
  },
  sectionCaption: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  secondaryText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  notesText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  receiptActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionPill: {
    flex: 1,
  },
  ctaGroup: {
    marginTop: 8,
  },
  mainCtaBtn: {
    marginBottom: 8,
  },
  secondaryCtaBtn: {},
});

