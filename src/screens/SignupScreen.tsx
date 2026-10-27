import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  AccessibilityRole,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { TextInputField } from '../components/ui/TextInputField';
import { Button } from '../components/ui/Button';
import { SPECIALTIES } from '../api/mockData';
import { Specialty } from '../types/domain';

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Signup'>>();
  const initialRole = route.params?.initialRole || 'patient';

  const { signup, isLoading, error, clearError } = useAuthStore();

  const [role, setRole] = useState<'patient' | 'doctor'>(initialRole);

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Doctor specific fields
  const [specialty, setSpecialty] = useState<Specialty>('Primary Care');
  const [clinicName, setClinicName] = useState('Metro Health Center');
  const [licenseNumber, setLicenseNumber] = useState('MD-NY-74829');
  const [consultationFee, setConsultationFee] = useState('120');

  const [formValidationErr, setFormValidationErr] = useState<string | null>(null);

  const handleRoleChange = (newRole: 'patient' | 'doctor') => {
    setRole(newRole);
    setFormValidationErr(null);
    clearError();
  };

  const handleSignup = async () => {
    setFormValidationErr(null);
    clearError();

    // Validation
    if (!name.trim()) {
      setFormValidationErr('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormValidationErr('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setFormValidationErr('Please enter your contact phone number.');
      return;
    }
    if (password.length < 6) {
      setFormValidationErr('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormValidationErr('Passwords do not match.');
      return;
    }

    try {
      if (role === 'doctor') {
        if (!clinicName.trim() || !licenseNumber.trim()) {
          setFormValidationErr('Please enter clinic name and license number.');
          return;
        }

        await signup({
          role: 'doctor',
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          specialty,
          clinicName: clinicName.trim(),
          licenseNumber: licenseNumber.trim(),
          consultationFee: parseInt(consultationFee, 10) || 120,
        });

        navigation.navigate('DoctorPortal');
      } else {
        await signup({
          role: 'patient',
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
        });

        navigation.navigate('MainTabs');
      }
    } catch {
      // Error is caught and surfaced in useAuthStore
    }
  };

  const availableSpecialties = SPECIALTIES.filter((s) => s !== 'All');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.backBtn}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Back to sign in"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="account-plus-outline" size={32} color="#0284C7" />
          </View>
          <Text style={styles.appTitle}>Create Account</Text>
          <Text style={styles.appSubtitle}>Join CareSlot as a Patient or Attending Physician</Text>
        </View>

        {/* Role Toggle: Patient vs Doctor ONLY */}
        <View style={styles.roleTabsRow}>
          <TouchableOpacity
            onPress={() => handleRoleChange('patient')}
            style={[styles.roleTab, role === 'patient' && styles.roleTabActive]}
            accessibilityRole={'button' as AccessibilityRole}
          >
            <MaterialCommunityIcons
              name="account"
              size={18}
              color={role === 'patient' ? '#0284C7' : '#64748B'}
            />
            <Text style={[styles.roleTabText, role === 'patient' && styles.roleTabTextActive]}>
              Patient Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleChange('doctor')}
            style={[styles.roleTab, role === 'doctor' && styles.roleTabActiveDoctor]}
            accessibilityRole={'button' as AccessibilityRole}
          >
            <MaterialCommunityIcons
              name="doctor"
              size={18}
              color={role === 'doctor' ? '#16A34A' : '#64748B'}
            />
            <Text style={[styles.roleTabText, role === 'doctor' && styles.roleTabTextActiveDoctor]}>
              Doctor / Physician
            </Text>
          </TouchableOpacity>
        </View>

        {/* Admin Policy Notice */}
        <View style={styles.adminNoticeBox}>
          <MaterialCommunityIcons name="shield-lock-outline" size={16} color="#7C3AED" />
          <Text style={styles.adminNoticeText}>
            Administrator accounts cannot be registered publicly and require privileged system provisioning.
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formCardTitle}>
            {role === 'doctor' ? 'Physician Credentials & Clinic Details' : 'Patient Registration Details'}
          </Text>

          {(formValidationErr || error) && (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{formValidationErr || error}</Text>
            </View>
          )}

          <TextInputField
            label={role === 'doctor' ? 'Physician Full Name (e.g. Dr. Jane Doe)' : 'Full Name'}
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              setFormValidationErr(null);
            }}
            placeholder={role === 'doctor' ? 'Dr. Jane Smith, MD' : 'Alex Morgan'}
            leftIcon={<MaterialCommunityIcons name="account-outline" size={20} color="#64748B" />}
          />

          <TextInputField
            label="Email Address"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              setFormValidationErr(null);
            }}
            placeholder={role === 'doctor' ? 'doctor@clinic.com' : 'patient@example.com'}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<MaterialCommunityIcons name="email-outline" size={20} color="#64748B" />}
          />

          <TextInputField
            label="Phone Number"
            value={phone}
            onChangeText={(txt) => {
              setPhone(txt);
              setFormValidationErr(null);
            }}
            placeholder="(555) 000-0000"
            keyboardType="phone-pad"
            leftIcon={<MaterialCommunityIcons name="phone-outline" size={20} color="#64748B" />}
          />

          {/* Doctor-Specific Fields */}
          {role === 'doctor' && (
            <>
              {/* Specialty Picker */}
              <View style={styles.fieldBlock}>
                <Text style={styles.inputLabel}>Medical Specialty</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.specialtyScroll}
                >
                  {availableSpecialties.map((spec) => (
                    <TouchableOpacity
                      key={spec}
                      onPress={() => setSpecialty(spec)}
                      style={[
                        styles.specialtyChip,
                        specialty === spec && styles.specialtyChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.specialtyChipText,
                          specialty === spec && styles.specialtyChipTextActive,
                        ]}
                      >
                        {spec}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TextInputField
                label="Clinic or Hospital Name"
                value={clinicName}
                onChangeText={setClinicName}
                placeholder="Metropolitan Health Clinic"
                leftIcon={<MaterialCommunityIcons name="hospital-building" size={20} color="#64748B" />}
              />

              <TextInputField
                label="State Medical License Number"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                placeholder="MD-CA-12345"
                leftIcon={<MaterialCommunityIcons name="certificate-outline" size={20} color="#64748B" />}
              />

              <TextInputField
                label="Standard Consultation Fee ($ USD)"
                value={consultationFee}
                onChangeText={setConsultationFee}
                placeholder="120"
                keyboardType="numeric"
                leftIcon={<MaterialCommunityIcons name="currency-usd" size={20} color="#64748B" />}
              />
            </>
          )}

          <TextInputField
            label="Password"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setFormValidationErr(null);
            }}
            placeholder="At least 6 characters"
            secureTextEntry
            leftIcon={<MaterialCommunityIcons name="lock-outline" size={20} color="#64748B" />}
          />

          <TextInputField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              setFormValidationErr(null);
            }}
            placeholder="Repeat your password"
            secureTextEntry
            leftIcon={<MaterialCommunityIcons name="lock-check-outline" size={20} color="#64748B" />}
          />

          <Button
            title={role === 'doctor' ? 'Register Physician & Launch Portal' : 'Create Patient Account'}
            onPress={handleSignup}
            loading={isLoading}
            variant="primary"
            size="lg"
            style={role === 'doctor' ? styles.signupBtnDoctor : styles.signupBtn}
          />

          {/* Cookie Notice */}
          <View style={styles.cookieSecurityNote}>
            <MaterialCommunityIcons name="cookie-clock" size={16} color="#0284C7" />
            <Text style={styles.cookieSecurityText}>
              Your session will be saved in an HTTP cookie for secure, persistent authentication.
            </Text>
          </View>
        </View>

        {/* Back to Sign In Link */}
        <View style={styles.loginLinkRow}>
          <Text style={styles.loginPrompt}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In Here</Text>
          </TouchableOpacity>
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
    marginBottom: 16,
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
    marginBottom: 10,
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
  roleTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabActiveDoctor: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  roleTabTextActiveDoctor: {
    color: '#16A34A',
    fontWeight: '700',
  },
  adminNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    marginBottom: 16,
  },
  adminNoticeText: {
    fontSize: 11,
    color: '#6B21A8',
    flex: 1,
    lineHeight: 15,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
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
  fieldBlock: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  specialtyScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  specialtyChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specialtyChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  specialtyChipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  specialtyChipTextActive: {
    color: '#166534',
    fontWeight: '700',
  },
  signupBtn: {
    marginTop: 10,
    backgroundColor: '#0284C7',
  },
  signupBtnDoctor: {
    marginTop: 10,
    backgroundColor: '#16A34A',
  },
  cookieSecurityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
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
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  loginPrompt: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
});
