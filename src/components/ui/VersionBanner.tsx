import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface VersionEntry {
  tag: string;
  version: string;
  commit: string;
  date: string;
  path: string;
  isLatest: boolean;
}

export const VersionBanner: React.FC = () => {
  const [archivedVersion, setArchivedVersion] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      // Check if URL matches /careslot/v/<tag>/
      const match = pathname.match(/\/careslot\/v\/([^/]+)/);
      if (match && match[1]) {
        setArchivedVersion(match[1]);
      }
    }
  }, []);

  if (!archivedVersion) return null;

  const handleSwitchToLatest = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/careslot/';
    }
  };

  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="history" size={18} color="#92400E" />
      <Text style={styles.bannerText}>
        Viewing archived version: <Text style={styles.versionHighlight}>{archivedVersion}</Text>
      </Text>
      <TouchableOpacity onPress={handleSwitchToLatest} style={styles.switchBtn}>
        <Text style={styles.switchBtnText}>Switch to Latest</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  bannerText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    flex: 1,
    marginLeft: 6,
  },
  versionHighlight: {
    fontWeight: '700',
  },
  switchBtn: {
    backgroundColor: '#92400E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  switchBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

