import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { cookieStorage, AUTH_COOKIE_NAME } from '../services/cookieStorage';
import { Button } from '../components/ui/Button';

export const AdminPortalScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, token, logout } = useAuthStore();

  const [cookieValue, setCookieValue] = useState<string | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [telehealthGatewayActive, setTelehealthGatewayActive] = useState(true);

  useEffect(() => {
    cookieStorage.getCookie(AUTH_COOKIE_NAME).then((val) => {
      setCookieValue(val);
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.navigate('MainTabs');
  };

  const decodedToken = token ? cookieStorage.decodeAuthToken(token) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.backBtn}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Back to app"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Platform Admin Console</Text>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Sign out"
          >
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Admin Card */}
        <View style={styles.adminCard}>
          <View style={styles.adminAvatarBox}>
            <MaterialCommunityIcons name="shield-crown" size={36} color="#FFFFFF" />
          </View>
          <View style={styles.adminInfoCol}>
            <View style={styles.adminNameRow}>
              <Text style={styles.adminName}>{user?.name || 'Platform Administrator'}</Text>
              <View style={styles.superBadge}>
                <Text style={styles.superBadgeText}>SUPERUSER</Text>
              </View>
            </View>
            <Text style={styles.adminEmail}>{user?.email || 'admin@careslot.com'}</Text>
            <Text style={styles.adminScope}>Access Scope: Global Clinic & Telehealth Infrastructure</Text>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>12</Text>
            <Text style={styles.metricDesc}>Active Physicians</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>148</Text>
            <Text style={styles.metricDesc}>Total Bookings</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#16A34A' }]}>99.98%</Text>
            <Text style={styles.metricDesc}>System Uptime</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: '#0284C7' }]}>$24.8k</Text>
            <Text style={styles.metricDesc}>Consultation Vol</Text>
          </View>
        </View>

        {/* HTTP Cookie & Token Security Inspector */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="cookie-check" size={20} color="#7C3AED" />
            <Text style={styles.sectionTitle}>HTTP Cookie & Token Inspector</Text>
          </View>
          <Text style={styles.sectionSub}>
            CareSlot persists authentication using browser HTTP cookies (`SameSite=Lax`).
          </Text>

          <View style={styles.tokenBox}>
            <Text style={styles.tokenLabel}>Active Cookie ({AUTH_COOKIE_NAME}):</Text>
            <Text style={styles.tokenContent} numberOfLines={2} ellipsizeMode="middle">
              {cookieValue || 'No active cookie stored'}
            </Text>
          </View>

          {decodedToken && (
            <View style={styles.payloadBox}>
              <Text style={styles.payloadLabel}>Decoded JWT Claims:</Text>
              <Text style={styles.payloadText}>
                Subject (User ID): {decodedToken.sub}
              </Text>
              <Text style={styles.payloadText}>
                Authorized Role: {decodedToken.role}
              </Text>
              <Text style={styles.payloadText}>
                Expires At: {new Date(decodedToken.exp * 1000).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* System Controls */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="tune" size={20} color="#0284C7" />
            <Text style={styles.sectionTitle}>System Operational Controls</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>HD Telehealth Video Gateway</Text>
              <Text style={styles.toggleDesc}>
                Route video consultations through WebRTC mesh servers.
              </Text>
            </View>
            <Switch
              value={telehealthGatewayActive}
              onValueChange={setTelehealthGatewayActive}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={telehealthGatewayActive ? '#0284C7' : '#94A3B8'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Emergency Maintenance Mode</Text>
              <Text style={styles.toggleDesc}>
                Display maintenance banner across patient booking flows.
              </Text>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenanceMode}
              trackColor={{ false: '#CBD5E1', true: '#FCA5A5' }}
              thumbColor={maintenanceMode ? '#EF4444' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Audit Log */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="history" size={20} color="#64748B" />
            <Text style={styles.sectionTitle}>Platform Audit Log</Text>
          </View>
          <View style={styles.auditItem}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#16A34A" />
            <Text style={styles.auditText}>Admin authenticated via HTTP Cookie session</Text>
            <Text style={styles.auditTime}>Just now</Text>
          </View>
          <View style={styles.auditItem}>
            <MaterialCommunityIcons name="video-check" size={16} color="#0284C7" />
            <Text style={styles.auditText}>Telehealth WebRTC channels operational</Text>
            <Text style={styles.auditTime}>2m ago</Text>
          </View>
          <View style={styles.auditItem}>
            <MaterialCommunityIcons name="server-network" size={16} color="#64748B" />
            <Text style={styles.auditText}>In-memory provider database synced</Text>
            <Text style={styles.auditTime}>10m ago</Text>
          </View>
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
  adminCard: {
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
  adminAvatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminInfoCol: {
    flex: 1,
  },
  adminNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  superBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  superBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
  },
  adminEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  adminScope: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  tokenBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  tokenContent: {
    fontSize: 11,
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  payloadBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  payloadLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 4,
  },
  payloadText: {
    fontSize: 11,
    color: '#581C87',
    marginBottom: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  toggleDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  auditText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
  },
  auditTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
