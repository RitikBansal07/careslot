import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  AccessibilityRole,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { MOCK_ACCOUNTS } from '../api/mockAuthData';
import { UserRole } from '../types/auth';
import { TextInputField } from '../components/ui/TextInputField';
import { Button } from '../components/ui/Button';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, loginAsMock, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('patient@example.com');
  const [password, setPassword] = useState('patient123');
  const [showPassword, setShowPassword] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('patient');

  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    clearError();
    const account = MOCK_ACCOUNTS.find((a) => a.user.role === role);
    if (account) {
      setEmail(account.user.email);
      setPassword(account.password);
    }
  };

  const handleStandardLogin = async () => {
    try {
      const user = await login({ email, password });
      handleRedirectByRole(user.role);
    } catch {
      // Error handled in store
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    try {
      const user = await loginAsMock(role);
      handleRedirectByRole(user.role);
    } catch {
      // Error handled in store
    }
  };

  const handleRedirectByRole = (role: UserRole) => {
    if (role === 'doctor') {
      navigation.navigate('DoctorPortal');
    } else if (role === 'admin') {
      navigation.navigate('AdminPortal');
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.header}>
          {isAuthenticated && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel="Close sign in"
            >
              <MaterialCommunityIcons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          )}
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="shield-lock-outline" size={32} color="#0284C7" />
          </View>
          <Text style={styles.appTitle}>CareSlot Portal</Text>
          <Text style={styles.appSubtitle}>Secure Patient, Physician & Admin Authentication</Text>
        </View>

        {/* Role Selector Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => handleRoleTabChange('patient')}
            style={[styles.tabBtn, activeRoleTab === 'patient' && styles.tabBtnActive]}
          >
            <MaterialCommunityIcons
              name="account"
              size={18}
              color={activeRoleTab === 'patient' ? '#0284C7' : '#64748B'}
            />
            <Text style={[styles.tabText, activeRoleTab === 'patient' && styles.tabTextActive]}>
              Patient
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleTabChange('doctor')}
            style={[styles.tabBtn, activeRoleTab === 'doctor' && styles.tabBtnActive]}
          >
            <MaterialCommunityIcons
              name="doctor"
              size={18}
              color={activeRoleTab === 'doctor' ? '#16A34A' : '#64748B'}
            />
            <Text style={[styles.tabText, activeRoleTab === 'doctor' && styles.tabTextActive]}>
              Doctor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleTabChange('admin')}
            style={[styles.tabBtn, activeRoleTab === 'admin' && styles.tabBtnActive]}
          >
            <MaterialCommunityIcons
              name="shield-crown"
              size={18}
              color={activeRoleTab === 'admin' ? '#7C3AED' : '#64748B'}
            />
            <Text style={[styles.tabText, activeRoleTab === 'admin' && styles.tabTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Standard Credentials Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formCardTitle}>Sign In with Credentials</Text>

          {error && (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInputField
            label="Email Address"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              clearError();
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<MaterialCommunityIcons name="email-outline" size={20} color="#64748B" />}
          />

          <TextInputField
            label="Password"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              clearError();
            }}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            leftIcon={<MaterialCommunityIcons name="lock-outline" size={20} color="#64748B" />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            }
          />

          <Button
            title="Sign In to Account"
            onPress={handleStandardLogin}
            loading={isLoading}
            variant="primary"
            size="lg"
            style={styles.signInBtn}
          />

          {/* Sign Up Navigation Prompt */}
          <View style={styles.signupPromptRow}>
            <Text style={styles.signupPromptText}>Don't have an account yet?</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Signup', {
                  initialRole: activeRoleTab === 'doctor' ? 'doctor' : 'patient',
                })
              }
            >
              <Text style={styles.signupLinkText}>Sign Up (Patient or Doctor)</Text>
            </TouchableOpacity>
          </View>

          {/* Cookie Security Badge */}
          <View style={styles.cookieSecurityNote}>
            <MaterialCommunityIcons name="cookie-clock" size={16} color="#0284C7" />
            <Text style={styles.cookieSecurityText}>
              Session tokens stored securely in HTTP cookies with SameSite=Lax protection.
            </Text>
          </View>
        </View>

        {/* 1-Click Fast Mock Logins Section */}
        <View style={styles.mockSection}>
          <View style={styles.mockSectionHeader}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#EAB308" />
            <Text style={styles.mockSectionTitle}>1-Click Mock Demonstrations</Text>
          </View>
          <Text style={styles.mockSectionSub}>
            Instantly switch accounts and roles without typing credentials:
          </Text>

          {MOCK_ACCOUNTS.map((account) => (
            <TouchableOpacity
              key={account.user.id}
              onPress={() => handleQuickLogin(account.user.role)}
              style={styles.mockCard}
              disabled={isLoading}
            >
              <View style={styles.mockCardTop}>
                <View style={[styles.roleBadge, { backgroundColor: `${account.badgeColor}18` }]}>
                  <Text style={[styles.roleBadgeText, { color: account.badgeColor }]}>
                    {account.badgeLabel}
                  </Text>
                </View>
                <Text style={styles.mockCredentials}>
                  {account.user.email} / {account.password}
                </Text>
              </View>

              <View style={styles.mockCardBody}>
                <View style={styles.mockCardInfo}>
                  <Text style={styles.mockName}>{account.user.name}</Text>
                  <Text style={styles.mockDesc}>{account.description}</Text>
                </View>
                <View style={[styles.loginArrowBtn, { backgroundColor: account.badgeColor }]}>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 4,
    padding: 6,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    flex: 1,
  },
  signInBtn: {
    marginTop: 8,
    backgroundColor: '#0284C7',
  },
  signupPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  signupPromptText: {
    fontSize: 13,
    color: '#64748B',
  },
  signupLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  cookieSecurityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cookieSecurityText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    lineHeight: 16,
  },
  mockSection: {
    marginTop: 4,
  },
  mockSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  mockSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  mockSectionSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  mockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mockCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mockCredentials: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  mockCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mockCardInfo: {
    flex: 1,
  },
  mockName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  mockDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  loginArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

