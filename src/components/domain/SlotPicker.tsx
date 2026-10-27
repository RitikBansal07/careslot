import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TimeSlot } from '../../types/domain';
import { formatShortDay, getNextSevenDays } from '../../utils/dateHelpers';

interface SlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId?: string;
  onSelectSlot: (slot: TimeSlot) => void;
  testID?: string;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  testID = 'slot-picker',
}) => {
  const dates = useMemo(() => getNextSevenDays(), []);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0]);

  // Filter slots for the currently selected date
  const dateSlots = useMemo(() => {
    return slots.filter((slot) => slot.date === selectedDate);
  }, [slots, selectedDate]);

  const morningSlots = useMemo(() => {
    return dateSlots.filter((s) => s.period === 'morning');
  }, [dateSlots]);

  const afternoonSlots = useMemo(() => {
    return dateSlots.filter((s) => s.period === 'afternoon');
  }, [dateSlots]);

  return (
    <View style={styles.container} testID={testID}>
      {/* 1. Date Selector Scroll */}
      <Text style={styles.sectionTitle}>Select Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateScrollContent}
        testID="date-selector"
      >
        {dates.map((dateStr) => {
          const { dayName, dayNumber, monthName, isToday } = formatShortDay(dateStr);
          const isSelected = selectedDate === dateStr;

          return (
            <TouchableOpacity
              key={dateStr}
              testID={`date-pill-${dateStr}`}
              onPress={() => setSelectedDate(dateStr)}
              accessible={true}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel={`${isToday ? 'Today, ' : ''}${dayName} ${monthName} ${dayNumber}`}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.datePill,
                isSelected && styles.datePillSelected,
              ]}
            >
              <Text
                style={[
                  styles.datePillDayName,
                  isSelected && styles.datePillTextSelected,
                ]}
              >
                {isToday ? 'Today' : dayName}
              </Text>
              <Text
                style={[
                  styles.datePillDayNumber,
                  isSelected && styles.datePillTextSelected,
                ]}
              >
                {dayNumber}
              </Text>
              <Text
                style={[
                  styles.datePillMonth,
                  isSelected && styles.datePillTextSelected,
                ]}
              >
                {monthName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2. Grouped Morning Slots */}
      <View style={styles.groupContainer}>
        <View style={styles.groupHeader}>
          <MaterialCommunityIcons name="weather-sunny" size={18} color="#D97706" />
          <Text style={styles.groupTitle}>Morning Slots</Text>
        </View>

        {morningSlots.length === 0 ? (
          <Text style={styles.noSlotsText}>No morning slots available on this date.</Text>
        ) : (
          <View style={styles.slotsGrid}>
            {morningSlots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              const isAvailable = slot.isAvailable;

              return (
                <TouchableOpacity
                  key={slot.id}
                  testID={`slot-${slot.id}`}
                  disabled={!isAvailable}
                  onPress={() => isAvailable && onSelectSlot(slot)}
                  accessible={true}
                  accessibilityRole={'button' as AccessibilityRole}
                  accessibilityLabel={`${slot.startTime}, ${
                    isAvailable ? 'available' : 'booked and unavailable'
                  }`}
                  accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
                  style={[
                    styles.slotBtn,
                    isSelected && styles.slotBtnSelected,
                    !isAvailable && styles.slotBtnDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotTimeText,
                      isSelected && styles.slotTimeTextSelected,
                      !isAvailable && styles.slotTimeTextDisabled,
                    ]}
                  >
                    {slot.startTime}
                  </Text>
                  {!isAvailable && (
                    <Text style={styles.unavailableBadge}>Booked</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* 3. Grouped Afternoon Slots */}
      <View style={styles.groupContainer}>
        <View style={styles.groupHeader}>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={18} color="#2563EB" />
          <Text style={styles.groupTitle}>Afternoon Slots</Text>
        </View>

        {afternoonSlots.length === 0 ? (
          <Text style={styles.noSlotsText}>No afternoon slots available on this date.</Text>
        ) : (
          <View style={styles.slotsGrid}>
            {afternoonSlots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              const isAvailable = slot.isAvailable;

              return (
                <TouchableOpacity
                  key={slot.id}
                  testID={`slot-${slot.id}`}
                  disabled={!isAvailable}
                  onPress={() => isAvailable && onSelectSlot(slot)}
                  accessible={true}
                  accessibilityRole={'button' as AccessibilityRole}
                  accessibilityLabel={`${slot.startTime}, ${
                    isAvailable ? 'available' : 'booked and unavailable'
                  }`}
                  accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
                  style={[
                    styles.slotBtn,
                    isSelected && styles.slotBtnSelected,
                    !isAvailable && styles.slotBtnDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotTimeText,
                      isSelected && styles.slotTimeTextSelected,
                      !isAvailable && styles.slotTimeTextDisabled,
                    ]}
                  >
                    {slot.startTime}
                  </Text>
                  {!isAvailable && (
                    <Text style={styles.unavailableBadge}>Booked</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  dateScrollContent: {
    paddingRight: 16,
    paddingBottom: 4,
  },
  datePill: {
    width: 68,
    height: 78,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  datePillSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  datePillDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  datePillDayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 2,
  },
  datePillMonth: {
    fontSize: 11,
    color: '#94A3B8',
  },
  datePillTextSelected: {
    color: '#FFFFFF',
  },
  groupContainer: {
    marginTop: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 6,
  },
  noSlotsText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 96,
  },
  slotBtnSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  slotBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  slotTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284C7',
  },
  slotTimeTextSelected: {
    color: '#FFFFFF',
  },
  slotTimeTextDisabled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  unavailableBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
    textTransform: 'uppercase',
  },
});

