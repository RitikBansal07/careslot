import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RootStackParamList } from '../types/navigation';
import { useProviderDetail, useBookSlot } from '../api/queries';
import {
  bookingFormSchema,
  BookingFormData,
  COMMON_VISIT_REASONS,
  INSURANCE_PROVIDERS,
} from '../utils/validation';
import { TextInputField } from '../components/ui/TextInputField';
import { Button } from '../components/ui/Button';
import { LoadingState, ErrorState } from '../components/ui/ScreenState';
import { formatDisplayDate } from '../utils/dateHelpers';

export const BookingFormScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'BookingForm'>>();
  const { providerId, slotId } = route.params;

  const { data, isLoading } = useProviderDetail(providerId);
  const bookSlotMutation = useBookSlot();

  const [bookingError, setBookingError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      patientName: '',
      email: '',
      phone: '',
      reason: '',
      insuranceProvider: 'Blue Cross Blue Shield',
      notes: '',
      agreeToTerms: false,
    },
  });

  const selectedInsurance = watch('insuranceProvider');
  const agreedToTerms = watch('agreeToTerms');

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Preparing booking request..." />
      </SafeAreaView>
    );
  }

  const { provider, slots } = data;
  const slot = slots.find((s) => s.id === slotId);

  if (!slot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState
          title="Slot Unavailable"
          message="The selected appointment slot could not be found or has expired."
          onRetry={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const onSubmit = async (formData: BookingFormData) => {
    setBookingError(null);
    try {
      const confirmation = await bookSlotMutation.mutateAsync({
        providerId: provider.id,
        slotId: slot.id,
        patientName: formData.patientName,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
        insuranceProvider: formData.insuranceProvider,
        notes: formData.notes,
      });

      // Navigate to confirmation receipt
      navigation.replace('Confirmation', { bookingId: confirmation.bookingId });
    } catch (err: any) {
      const msg = err?.message || 'An unexpected error occurred while booking. Please retry.';
      setBookingError(msg);
      Alert.alert('Booking Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Back to doctor details"
            style={styles.backBtn}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Details</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Appointment Summary Banner */}
          <View style={styles.summaryBanner}>
            <View style={styles.summaryTopRow}>
              <View style={styles.bannerIconBox}>
                <MaterialCommunityIcons name="calendar-check" size={24} color="#0284C7" />
              </View>
              <View style={styles.summaryTextCol}>
                <Text style={styles.bannerDoctorName}>{provider.name}</Text>
                <Text style={styles.bannerSpecialty}>{provider.specialty}</Text>
              </View>
            </View>

            <View style={styles.bannerDivider} />

            <View style={styles.summaryDetailsGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{formatDisplayDate(slot.date)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{slot.startTime}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Visit Type</Text>
                <Text style={styles.summaryValue}>In-Person</Text>
              </View>
            </View>
          </View>

          {/* Error Banner if API failed */}
          {bookingError && (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.errorBannerText}>{bookingError}</Text>
            </View>
          )}

          {/* Patient Information Form */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Patient Information</Text>

            <Controller
              control={control}
              name="patientName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Full Legal Name"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.patientName?.message}
                  leftIcon={<MaterialCommunityIcons name="account-outline" size={20} color="#64748B" />}
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Email Address"
                  required
                  placeholder="name@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<MaterialCommunityIcons name="email-outline" size={20} color="#64748B" />}
                  helperText="Appointment confirmation receipt will be sent here"
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Mobile Phone"
                  required
                  placeholder="(555) 234-5678"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                  leftIcon={<MaterialCommunityIcons name="phone-outline" size={20} color="#64748B" />}
                />
              )}
            />

            {/* Visit Reason with Suggestions */}
            <Controller
              control={control}
              name="reason"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInputField
                    label="Reason for Visit"
                    required
                    placeholder="Briefly describe your symptoms or visit goal..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.reason?.message}
                    multiline
                    numberOfLines={2}
                    leftIcon={<MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#64748B" />}
                  />
                  <Text style={styles.quickSelectLabel}>Quick suggestions:</Text>
                  <View style={styles.suggestionRow}>
                    {COMMON_VISIT_REASONS.slice(0, 4).map((item) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => setValue('reason', item, { shouldValidate: true })}
                        style={styles.suggestionPill}
                      >
                        <Text style={styles.suggestionPillText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            />

            {/* Insurance Provider Selector */}
            <View style={styles.insuranceBlock}>
              <Text style={styles.fieldLabel}>
                Insurance Provider <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.insuranceGrid}>
                {INSURANCE_PROVIDERS.map((ins) => {
                  const isSelected = selectedInsurance === ins;
                  return (
                    <TouchableOpacity
                      key={ins}
                      onPress={() => setValue('insuranceProvider', ins, { shouldValidate: true })}
                      accessible={true}
                      accessibilityRole={'button' as AccessibilityRole}
                      accessibilityLabel={`Insurance option: ${ins}`}
                      accessibilityState={{ selected: isSelected }}
                      style={[
                        styles.insuranceChip,
                        isSelected && styles.insuranceChipSelected,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                        size={18}
                        color={isSelected ? '#0284C7' : '#94A3B8'}
                      />
                      <Text
                        style={[
                          styles.insuranceChipText,
                          isSelected && styles.insuranceChipTextSelected,
                        ]}
                      >
                        {ins}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.insuranceProvider && (
                <Text style={styles.fieldError}>{errors.insuranceProvider.message}</Text>
              )}
            </View>

            {/* Additional Notes (Optional) */}
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Special Accommodations / Notes (Optional)"
                  placeholder="Wheelchair access, language translator, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.notes?.message}
                  multiline
                  numberOfLines={2}
                />
              )}
            />

            {/* Terms & Conditions Checkbox */}
            <Controller
              control={control}
              name="agreeToTerms"
              render={({ field: { onChange, value } }) => (
                <View style={styles.termsRow}>
                  <TouchableOpacity
                    onPress={() => onChange(!value)}
                    accessible={true}
                    accessibilityRole={'checkbox' as AccessibilityRole}
                    accessibilityState={{ checked: value }}
                    accessibilityLabel="I confirm that the details provided are accurate and agree to CareSlot demo booking policies."
                    style={styles.checkboxBtn}
                  >
                    <MaterialCommunityIcons
                      name={value ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={22}
                      color={value ? '#0284C7' : '#94A3B8'}
                    />
                  </TouchableOpacity>
                  <Text
                    style={styles.termsText}
                    onPress={() => onChange(!value)}
                  >
                    I confirm that the information provided is accurate and agree to CareSlot booking and cancellation policies.
                  </Text>
                </View>
              )}
            />
            {errors.agreeToTerms && (
              <Text style={styles.fieldError}>{errors.agreeToTerms.message}</Text>
            )}

            {/* Submit Button */}
            <Button
              title="Confirm Appointment"
              onPress={handleSubmit(onSubmit)}
              loading={bookSlotMutation.isPending}
              disabled={bookSlotMutation.isPending}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
              testID="submit-booking-btn"
            />
          </View>
        </ScrollView>
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
  header: {
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryBanner: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 20,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTextCol: {
    flex: 1,
  },
  bannerDoctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  bannerSpecialty: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
  },
  bannerDivider: {
    height: 1,
    backgroundColor: '#BAE6FD',
    marginVertical: 12,
  },
  summaryDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#B91C1C',
    marginLeft: 8,
    flex: 1,
  },
  formSection: {
    marginTop: 4,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  quickSelectLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    marginTop: -8,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  suggestionPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionPillText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  insuranceBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#DC2626',
  },
  insuranceGrid: {
    gap: 8,
  },
  insuranceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  insuranceChipSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0284C7',
  },
  insuranceChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginLeft: 8,
  },
  insuranceChipTextSelected: {
    color: '#0284C7',
    fontWeight: '600',
  },
  fieldError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    fontWeight: '500',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 14,
  },
  checkboxBtn: {
    marginRight: 10,
    marginTop: 1,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: 16,
  },
});

