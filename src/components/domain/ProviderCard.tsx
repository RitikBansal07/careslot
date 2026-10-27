import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Provider } from '../../types/domain';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { formatDisplayDate } from '../../utils/dateHelpers';

interface ProviderCardProps {
  provider: Provider;
  onPress: () => void;
  testID?: string;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onPress,
  testID,
}) => {
  const [avatarUri, setAvatarUri] = useState(provider.avatarUrl);
  const isFav = useFavoritesStore((state) => state.isFavorite(provider.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleFavoritePress = (e: any) => {
    e.stopPropagation?.();
    toggleFavorite(provider.id);
  };

  const handleImageError = () => {
    setAvatarUri(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        provider.name
      )}&background=0284C7&color=fff&size=160`
    );
  };

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.88}
      accessible={true}
      accessibilityLabel={`${provider.name}, ${provider.specialty}, rated ${provider.rating} stars`}
      accessibilityHint="Double tap to view provider details and select appointment slots"
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Image
          source={{ uri: avatarUri }}
          onError={handleImageError}
          style={styles.avatar}
          accessibilityRole={'image' as AccessibilityRole}
          accessibilityLabel={`Profile photo of ${provider.name}`}
        />

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {provider.name}
            </Text>
            <TouchableOpacity
              onPress={handleFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel={isFav ? 'Remove from favorites' : 'Save to favorites'}
              accessibilityState={{ selected: isFav }}
              style={styles.favBtn}
            >
              <MaterialCommunityIcons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={isFav ? '#EF4444' : '#94A3B8'}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.titleSpecialty}>
            {provider.specialty} • {provider.title}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({provider.reviewCount})</Text>
            </View>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.distanceText}>
              {provider.location.distanceMiles} mi away
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.badgeWrapper}>
          <MaterialCommunityIcons name="calendar-clock" size={15} color="#0369A1" />
          <Text style={styles.nextSlotText}>
            Next: {formatDisplayDate(provider.nextAvailableDate)}
          </Text>
        </View>

        <View style={styles.feeWrapper}>
          <Text style={styles.feeLabel}>Visit from</Text>
          <Text style={styles.feeAmount}>${provider.consultationFee}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  favBtn: {
    padding: 2,
  },
  titleSpecialty: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 3,
  },
  reviewCount: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 2,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: '#CBD5E1',
  },
  distanceText: {
    fontSize: 12,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  nextSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    marginLeft: 4,
  },
  feeWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  feeLabel: {
    fontSize: 11,
    color: '#64748B',
    marginRight: 4,
  },
  feeAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
});

