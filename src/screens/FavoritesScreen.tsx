import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  AccessibilityRole,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useProviders } from '../api/queries';
import { ProviderCard } from '../components/domain/ProviderCard';
import { EmptyState } from '../components/ui/ScreenState';
import { Button } from '../components/ui/Button';
import { formatDisplayDate } from '../utils/dateHelpers';
import { BookingConfirmation } from '../types/domain';

type ActiveTab = 'appointments' | 'favorites';

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<ActiveTab>('appointments');

  const { bookings, favoriteIds, cancelBooking } = useFavoritesStore();
  const { data: allProviders } = useProviders();

  const favoriteProviders = (allProviders || []).filter((p) =>
    favoriteIds.includes(p.id)
  );

  const handleCancelBooking = (booking: BookingConfirmation) => {
    const confirmationPrompt = `Are you sure you want to cancel your visit with ${booking.provider.name} on ${formatDisplayDate(booking.slot.date)}?`;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(confirmationPrompt)) {
        cancelBooking(booking.bookingId);
      }
    } else {
      Alert.alert('Cancel Appointment', confirmationPrompt, [
        { text: 'Keep Appointment', style: 'cancel' },
        {
          text: 'Cancel Visit',
          style: 'destructive',
          onPress: () => cancelBooking(booking.bookingId),
        },
      ]);
    }
  };

  const handleGoToProviders = () => {
    navigation.navigate('MainTabs', {
      screen: 'ProvidersTab',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Health Hub</Text>
          <Text style={styles.headerSubtitle}>
            Manage your booked visits and saved doctor profiles
          </Text>
        </View>

        {/* Segmented Control Tabs */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('appointments')}
            accessible={true}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityState={{ selected: activeTab === 'appointments' }}
            style={[
              styles.segmentBtn,
              activeTab === 'appointments' && styles.segmentBtnActive,
            ]}
          >
            <MaterialCommunityIcons
              name="calendar-month"
              size={18}
              color={activeTab === 'appointments' ? '#0284C7' : '#64748B'}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'appointments' && styles.segmentTextActive,
              ]}
            >
              Appointments ({bookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('favorites')}
            accessible={true}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityState={{ selected: activeTab === 'favorites' }}
            style={[
              styles.segmentBtn,
              activeTab === 'favorites' && styles.segmentBtnActive,
            ]}
          >
            <MaterialCommunityIcons
              name="heart"
              size={18}
              color={activeTab === 'favorites' ? '#EF4444' : '#64748B'}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'favorites' && styles.segmentTextActive,
              ]}
            >
              Saved ({favoriteProviders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'appointments' ? (
          bookings.length === 0 ? (
            <EmptyState
              icon="calendar-blank"
              title="No Appointments Scheduled"
              description="You have no upcoming or past appointments on file. Explore our specialist directory to book a visit in seconds."
              actionTitle="Browse Doctors"
              onAction={handleGoToProviders}
            />
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item.bookingId}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isCancelled = item.status === 'cancelled';
                return (
                  <View style={styles.bookingCard}>
                    <View style={styles.bookingTopRow}>
                      <View style={styles.doctorInfoCol}>
                        <Text style={styles.bookingDoctorName}>{item.provider.name}</Text>
                        <Text style={styles.bookingSpecialty}>{item.provider.specialty}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isCancelled ? styles.statusCancelled : styles.statusConfirmed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            isCancelled ? styles.statusTextCancelled : styles.statusTextConfirmed,
                          ]}
                        >
                          {isCancelled ? 'Cancelled' : 'Confirmed'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.bookingDivider} />

                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color="#0284C7" />
                      <Text style={styles.metaText}>
                        {formatDisplayDate(item.slot.date)} at {item.slot.startTime}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={16} color="#64748B" />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.provider.location.clinicName}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="clipboard-pulse-outline" size={16} color="#64748B" />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.reason}
                      </Text>
                    </View>

                    <View style={styles.bookingFooterRow}>
                      <Text style={styles.refCode}>Ref: #{item.bookingId}</Text>
                      {!isCancelled && (
                        <Button
                          title="Cancel Visit"
                          onPress={() => handleCancelBooking(item)}
                          variant="ghost"
                          size="sm"
                          textStyle={styles.cancelBtnText}
                        />
                      )}
                    </View>
                  </View>
                );
              }}
            />
          )
        ) : favoriteProviders.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="No Saved Providers"
            description="You haven't saved any doctors to your favorites list yet. Tap the heart on any doctor card to access them quickly here."
            actionTitle="Find Providers"
            onAction={handleGoToProviders}
          />
        ) : (
          <FlatList
            data={favoriteProviders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ProviderCard
                provider={item}
                onPress={() => navigation.navigate('ProviderDetail', { providerId: item.id })}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doctorInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  bookingDoctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  bookingSpecialty: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextConfirmed: {
    color: '#166534',
  },
  statusTextCancelled: {
    color: '#991B1B',
  },
  bookingDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#334155',
    marginLeft: 8,
    flex: 1,
  },
  bookingFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  refCode: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 13,
  },
});

