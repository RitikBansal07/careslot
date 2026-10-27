import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SlotPicker } from '../src/components/domain/SlotPicker';
import { TimeSlot } from '../src/types/domain';
import { getRelativeDateString } from '../src/utils/dateHelpers';

describe('SlotPicker Component', () => {
  const todayStr = getRelativeDateString(0);

  const mockSlots: TimeSlot[] = [
    {
      id: 'slot-1',
      providerId: 'p-1',
      date: todayStr,
      startTime: '09:00 AM',
      endTime: '09:30 AM',
      period: 'morning',
      isAvailable: true,
    },
    {
      id: 'slot-2',
      providerId: 'p-1',
      date: todayStr,
      startTime: '09:45 AM',
      endTime: '10:15 AM',
      period: 'morning',
      isAvailable: false, // Booked
    },
    {
      id: 'slot-3',
      providerId: 'p-1',
      date: todayStr,
      startTime: '01:30 PM',
      endTime: '02:00 PM',
      period: 'afternoon',
      isAvailable: true,
    },
  ];

  it('renders date selector and grouped morning/afternoon headers', async () => {
    const onSelectSlot = jest.fn();
    const { getByText, getByTestId } = await render(
      <SlotPicker
        slots={mockSlots}
        onSelectSlot={onSelectSlot}
      />
    );

    expect(getByText('Select Date')).toBeTruthy();
    expect(getByTestId('date-selector')).toBeTruthy();
    expect(getByText('Morning Slots')).toBeTruthy();
    expect(getByText('Afternoon Slots')).toBeTruthy();
  });

  it('allows selecting an available morning time slot', async () => {
    const onSelectSlot = jest.fn();
    const { getByTestId } = await render(
      <SlotPicker
        slots={mockSlots}
        onSelectSlot={onSelectSlot}
      />
    );

    const availableSlot = getByTestId('slot-slot-1');
    fireEvent.press(availableSlot);

    expect(onSelectSlot).toHaveBeenCalledTimes(1);
    expect(onSelectSlot).toHaveBeenCalledWith(mockSlots[0]);
  });

  it('prevents selecting a booked/unavailable slot', async () => {
    const onSelectSlot = jest.fn();
    const { getByTestId } = await render(
      <SlotPicker
        slots={mockSlots}
        onSelectSlot={onSelectSlot}
      />
    );

    const bookedSlot = getByTestId('slot-slot-2');
    fireEvent.press(bookedSlot);

    expect(onSelectSlot).not.toHaveBeenCalled();
  });
});

