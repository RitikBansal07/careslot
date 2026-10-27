import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Switch,
  ScrollView,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useDebugStore } from '../../store/useDebugStore';
import { careSlotKeys } from '../../api/queries';

export const DebugToolbar: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const {
    latencyMs,
    failureRate,
    forceEmptyState,
    forceLoadingState,
    setLatencyMs,
    setFailureRate,
    setForceEmptyState,
    setForceLoadingState,
    resetDefaults,
  } = useDebugStore();

  const isChaosActive =
    latencyMs > 400 || failureRate > 0 || forceEmptyState || forceLoadingState;

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: careSlotKeys.all });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <TouchableOpacity
        testID="debug-toolbar-trigger"
        onPress={() => setModalVisible(true)}
        accessible={true}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel="Open Chaos and API Demo Toolbar"
        style={[styles.floatingTrigger, isChaosActive && styles.floatingTriggerActive]}
      >
        <MaterialCommunityIcons
          name="tune-vertical"
          size={18}
          color={isChaosActive ? '#FFFFFF' : '#0284C7'}
        />
        <Text
          style={[styles.triggerText, isChaosActive && styles.triggerTextActive]}
        >
          {isChaosActive ? 'Chaos ON' : 'API Controls'}
        </Text>
      </TouchableOpacity>

      {/* Control Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.titleRow}>
                <MaterialCommunityIcons name="speedometer" size={24} color="#0284C7" />
                <Text style={styles.modalTitle}>Chaos & Demo Controls</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessibilityRole={'button' as AccessibilityRole}
                accessibilityLabel="Close controls modal"
                style={styles.closeBtn}
              >
                <MaterialCommunityIcons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollBody}>
              <Text style={styles.sectionSubtitle}>
                Simulate resilient async scenarios: loading skeletons, empty views, and error recovery states.
              </Text>

              {/* Latency Presets */}
              <View style={styles.cardSection}>
                <Text style={styles.settingLabel}>
                  Mock Network Latency: <Text style={styles.highlight}>{latencyMs}ms</Text>
                </Text>
                <View style={styles.presetRow}>
                  {[
                    { label: 'Fast (150ms)', val: 150 },
                    { label: 'Normal (350ms)', val: 350 },
                    { label: 'Slow (1500ms)', val: 1500 },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.val}
                      onPress={() => setLatencyMs(p.val)}
                      style={[
                        styles.presetChip,
                        latencyMs === p.val && styles.presetChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          latencyMs === p.val && styles.presetChipTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Simulated Failure Rate */}
              <View style={styles.cardSection}>
                <Text style={styles.settingLabel}>
                  Simulate Network Error: <Text style={styles.highlight}>{failureRate * 100}%</Text>
                </Text>
                <View style={styles.presetRow}>
                  {[
                    { label: '0% (Reliable)', val: 0 },
                    { label: '50% (Flaky)', val: 0.5 },
                    { label: '100% (Offline/Fail)', val: 1 },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.val}
                      onPress={() => {
                        setFailureRate(p.val);
                        handleRefreshData();
                      }}
                      style={[
                        styles.presetChip,
                        failureRate === p.val && styles.presetChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          failureRate === p.val && styles.presetChipTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Force Empty State */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.settingLabel}>Force Empty State</Text>
                  <Text style={styles.settingDesc}>
                    Forces provider queries to return 0 records to test empty state UI
                  </Text>
                </View>
                <Switch
                  value={forceEmptyState}
                  onValueChange={(val) => {
                    setForceEmptyState(val);
                    handleRefreshData();
                  }}
                  trackColor={{ false: '#CBD5E1', true: '#0284C7' }}
                />
              </View>

              {/* Force Loading Skeleton */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.settingLabel}>Force Skeleton Loading</Text>
                  <Text style={styles.settingDesc}>
                    Pauses mock API resolution to inspect loading skeletons
                  </Text>
                </View>
                <Switch
                  value={forceLoadingState}
                  onValueChange={(val) => {
                    setForceLoadingState(val);
                    handleRefreshData();
                  }}
                  trackColor={{ false: '#CBD5E1', true: '#0284C7' }}
                />
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => {
                  resetDefaults();
                  handleRefreshData();
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Reset Defaults</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleRefreshData();
                  setModalVisible(false);
                }}
                style={styles.applyBtn}
              >
                <Text style={styles.applyBtnText}>Apply & Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingTrigger: {
    position: 'absolute',
    bottom: 24,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 999,
  },
  floatingTriggerActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  triggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    marginLeft: 6,
  },
  triggerTextActive: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    padding: 20,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  cardSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  settingDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 240,
  },
  highlight: {
    color: '#0284C7',
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  presetChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

