import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useProviderDetail } from '../api/queries';
import { SlotPicker } from '../components/domain/SlotPicker';
import { Button } from '../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/ScreenState';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { TimeSlot } from '../types/domain';
import { formatDisplayDate } from '../utils/dateHelpers';

export const ProviderDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProviderDetail'>>();
  const { providerId } = route.params;

  const { data, isLoading, isError, error, refetch } = useProviderDetail(providerId);

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const isFav = useFavoritesStore((state) => state.isFavorite(providerId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Loading doctor profile and available slots..." />
      </SafeAreaView>
    );
  }

  if (isError || !data || !data.provider) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState
          title="Provider Unavailable"
          message={error instanceof Error ? error.message : 'Could not retrieve provider details.'}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  const { provider, slots } = data;

  const handleContinueToBooking = () => {
    if (!selectedSlot) return;
    navigation.navigate('BookingForm', {
      providerId: provider.id,
      slotId: selectedSlot.id,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Back to provider list"
            style={styles.backBtn}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topHeaderTitle}>Doctor Details</Text>
          <TouchableOpacity
            onPress={() => toggleFavorite(provider.id)}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
            style={styles.favBtn}
          >
            <MaterialCommunityIcons
              name={isFav ? 'heart' : 'heart-outline'}
              size={24}
              color={isFav ? '#EF4444' : '#64748B'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Provider Overview Card */}
          <View style={styles.heroCard}>
            <Image
              source={{ uri: avatarUri || provider.avatarUrl }}
              onError={() => {
                setAvatarUri(
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    provider.name
                  )}&background=0284C7&color=fff&size=160`
                );
              }}
              style={styles.heroAvatar}
              accessibilityLabel={`Photo of ${provider.name}`}
            />
            <View style={styles.heroInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerCredentials}>
                {provider.specialty} • {provider.title}
              </Text>

              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingScore}>{provider.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({provider.reviewCount} patient reviews)</Text>
              </View>
            </View>
          </View>

          {/* Key Metrics Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="briefcase-clock" size={20} color="#0284C7" />
              <Text style={styles.statVal}>{provider.experienceYears}+ yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color="#0284C7" />
              <Text style={styles.statVal}>{provider.location.distanceMiles} mi</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="cash" size={20} color="#0284C7" />
              <Text style={styles.statVal}>${provider.consultationFee}</Text>
              <Text style={styles.statLabel}>Standard Fee</Text>
            </View>
          </View>

          {/* About / Bio */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeader}>About</Text>
            <Text style={styles.bioText}>{provider.bio}</Text>
          </View>

          {/* Clinic & Location */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeader}>Location & Clinic</Text>
            <View style={styles.clinicCard}>
              <MaterialCommunityIcons name="hospital-building" size={24} color="#0284C7" style={styles.clinicIcon} />
              <View style={styles.clinicTextCol}>
                <Text style={styles.clinicName}>{provider.location.clinicName}</Text>
                <Text style={styles.clinicAddress}>
                  {provider.location.address}, {provider.location.city}, {provider.location.state}
                </Text>
              </View>
            </View>
          </View>

          {/* Languages Spoken */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeader}>Languages</Text>
            <View style={styles.chipsWrap}>
              {provider.languages.map((lang) => (
                <View key={lang} style={styles.langPill}>
                  <Text style={styles.langText}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Accepted Insurances */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeader}>Accepted Insurances</Text>
            <View style={styles.chipsWrap}>
              {provider.acceptedInsurances.map((ins) => (
                <View key={ins} style={styles.insPill}>
                  <MaterialCommunityIcons name="shield-check" size={14} color="#16A34A" />
                  <Text style={styles.insText}>{ins}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Interactive Slot Picker */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeader}>Available Appointment Slots</Text>
            <SlotPicker
              slots={slots}
              selectedSlotId={selectedSlot?.id}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar CTA */}
        <View style={styles.bottomBar}>
          <View style={styles.slotSummaryCol}>
            <Text style={styles.selectedSlotLabel}>Selected Slot</Text>
            {selectedSlot ? (
              <Text style={styles.selectedSlotValue}>
                {formatDisplayDate(selectedSlot.date)} • {selectedSlot.startTime}
              </Text>
            ) : (
              <Text style={styles.unselectedSlotText}>Please pick a time above</Text>
            )}
          </View>
          <Button
            title="Book Now"
            disabled={!selectedSlot}
            onPress={handleContinueToBooking}
            variant="primary"
            size="md"
            style={styles.bookCtaBtn}
            testID="continue-to-booking-btn"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 6,
  },
  topHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  favBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // accommodate bottom bar
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
  },
  heroInfo: {
    flex: 1,
    marginLeft: 16,
  },
  providerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  providerCredentials: {
    fontSize: 14,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  clinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clinicIcon: {
    marginRight: 12,
  },
  clinicTextCol: {
    flex: 1,
  },
  clinicName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  clinicAddress: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  insPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  insText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#166534',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  slotSummaryCol: {
    flex: 1,
    marginRight: 16,
  },
  selectedSlotLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  selectedSlotValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 2,
  },
  unselectedSlotText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  bookCtaBtn: {
    minWidth: 130,
  },
});

