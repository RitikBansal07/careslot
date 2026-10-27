import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useProviders } from '../api/queries';
import { ProviderCard } from '../components/domain/ProviderCard';
import { Chip } from '../components/ui/Chip';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/ScreenState';
import { DebugToolbar } from '../components/domain/DebugToolbar';
import { SPECIALTIES } from '../api/mockData';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Specialty } from '../types/domain';
import { useAuthStore } from '../store/useAuthStore';

export const ProviderListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const { user, isAuthenticated } = useAuthStore();

  const {
    data: allProviders,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useProviders();

  // Instant zero-latency client-side filtering for search, specialty, and favorites
  const displayedProviders = useMemo(() => {
    if (!allProviders) return [];
    let list = allProviders;

    if (showOnlyFavorites) {
      list = list.filter((p) => favoriteIds.includes(p.id));
    }

    if (selectedSpecialty !== 'All') {
      list = list.filter(
        (p) => p.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.location.clinicName.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allProviders, showOnlyFavorites, favoriteIds, selectedSpecialty, searchQuery]);

  const handleProviderPress = (providerId: string) => {
    navigation.navigate('ProviderDetail', { providerId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header App Brand */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.brandTitle}>CareSlot</Text>
            </View>
            <Text style={styles.headerSubtitle}>Book trusted healthcare providers in seconds</Text>
          </View>

          {/* User Auth Portal / Login Button */}
          {isAuthenticated && user ? (
            <TouchableOpacity
              onPress={() => {
                if (user.role === 'doctor') navigation.navigate('DoctorPortal');
                else if (user.role === 'admin') navigation.navigate('AdminPortal');
                else navigation.navigate('Login');
              }}
              style={[
                styles.userPill,
                user.role === 'doctor'
                  ? styles.userPillDoctor
                  : user.role === 'admin'
                  ? styles.userPillAdmin
                  : styles.userPillPatient,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Logged in as ${user.name}`}
            >
              <MaterialCommunityIcons
                name={
                  user.role === 'doctor'
                    ? 'doctor'
                    : user.role === 'admin'
                    ? 'shield-crown'
                    : 'account-circle'
                }
                size={16}
                color={
                  user.role === 'doctor'
                    ? '#166534'
                    : user.role === 'admin'
                    ? '#6B21A8'
                    : '#0369A1'
                }
              />
              <Text
                style={[
                  styles.userPillText,
                  user.role === 'doctor'
                    ? styles.userPillTextDoctor
                    : user.role === 'admin'
                    ? styles.userPillTextAdmin
                    : styles.userPillTextPatient,
                ]}
                numberOfLines={1}
              >
                {user.role === 'doctor'
                  ? 'Dr. Portal'
                  : user.role === 'admin'
                  ? 'Admin'
                  : user.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginPill}
              accessibilityRole="button"
              accessibilityLabel="Sign in or test mock accounts"
            >
              <MaterialCommunityIcons name="login-variant" size={15} color="#0284C7" />
              <Text style={styles.loginPillText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search doctor, specialty, or clinic..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            clearButtonMode="while-editing"
            accessibilityLabel="Search healthcare providers"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Scroll: Specialties + Favorites Toggle */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {/* Quick Favorites Chip */}
            <Chip
              label={`Favorites (${favoriteIds.length})`}
              icon={
                <MaterialCommunityIcons
                  name="heart"
                  size={14}
                  color={showOnlyFavorites ? '#FFFFFF' : '#EF4444'}
                />
              }
              selected={showOnlyFavorites}
              onPress={() => setShowOnlyFavorites((prev) => !prev)}
            />

            {/* Specialty Pills */}
            {SPECIALTIES.map((spec) => (
              <Chip
                key={spec}
                label={spec}
                selected={!showOnlyFavorites && selectedSpecialty === spec}
                onPress={() => {
                  setShowOnlyFavorites(false);
                  setSelectedSpecialty(spec);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Body State Handling: Loading, Error, Empty, List */}
        {isLoading ? (
          <LoadingState message="Discovering top healthcare providers..." />
        ) : isError ? (
          <ErrorState
            title="Unable to Load Providers"
            message={
              error instanceof Error
                ? error.message
                : 'Failed to connect to the healthcare directory. Please check network settings or retry.'
            }
            onRetry={refetch}
          />
        ) : displayedProviders.length === 0 ? (
          <EmptyState
            icon="doctor"
            title="No Providers Found"
            description={
              showOnlyFavorites
                ? "You haven't saved any providers to your favorites yet. Tap the heart on any provider card to favorite them."
                : `We could not find any providers matching "${searchQuery || selectedSpecialty}". Try modifying your search or filters.`
            }
            actionTitle={showOnlyFavorites || searchQuery ? 'Reset Filters' : 'Refresh'}
            onAction={() => {
              setShowOnlyFavorites(false);
              setSearchQuery('');
              setSelectedSpecialty('All');
              refetch();
            }}
          />
        ) : (
          <FlatList
            data={displayedProviders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProviderCard
                provider={item}
                onPress={() => handleProviderPress(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => {
                  refetch();
                }}
                colors={['#0284C7']}
                tintColor="#0284C7"
              />
            }
            ListHeaderComponent={
              <Text style={styles.resultsCount}>
                Showing {displayedProviders.length} available specialist
                {displayedProviders.length === 1 ? '' : 's'}
              </Text>
            }
          />
        )}

        {/* Floating Debug Chaos Toolbar */}
        <DebugToolbar />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  userPillDoctor: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  userPillAdmin: {
    backgroundColor: '#F3E8FF',
    borderColor: '#E9D5FF',
  },
  userPillPatient: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  userPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  userPillTextDoctor: {
    color: '#166534',
  },
  userPillTextAdmin: {
    color: '#6B21A8',
  },
  userPillTextPatient: {
    color: '#0369A1',
  },
  loginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  loginPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  clearBtn: {
    padding: 4,
  },
  filterSection: {
    backgroundColor: '#F8FAFC',
    paddingBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // room for floating debug toolbar
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginVertical: 10,
  },
});
