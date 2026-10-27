import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList, MainTabParamList } from './src/types/navigation';
import { ProviderListScreen } from './src/screens/ProviderListScreen';
import { ProviderDetailScreen } from './src/screens/ProviderDetailScreen';
import { BookingFormScreen } from './src/screens/BookingFormScreen';
import { ConfirmationScreen } from './src/screens/ConfirmationScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { TelehealthWaitingRoomScreen } from './src/screens/TelehealthWaitingRoomScreen';
import { TelehealthCallScreen } from './src/screens/TelehealthCallScreen';
import { TelehealthSummaryScreen } from './src/screens/TelehealthSummaryScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { DoctorPortalScreen } from './src/screens/DoctorPortalScreen';
import { AdminPortalScreen } from './src/screens/AdminPortalScreen';
import { useFavoritesStore } from './src/store/useFavoritesStore';
import { useAuthStore } from './src/store/useAuthStore';
import { VersionBanner } from './src/components/ui/VersionBanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins cache
      gcTime: 1000 * 60 * 30,
    },
  },
});

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabsNavigator() {
  const bookingsCount = useFavoritesStore((state) => state.bookings.length);
  const favoritesCount = useFavoritesStore((state) => state.favoriteIds.length);
  const totalHubBadge = bookingsCount + favoritesCount;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0284C7',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="ProvidersTab"
        component={ProviderListScreen}
        options={{
          tabBarLabel: 'Find Doctors',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="doctor" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'My Health Hub',
          tabBarBadge: totalHubBadge > 0 ? totalHubBadge : undefined,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-heart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={{ marginTop: 14, color: '#64748B', fontWeight: '700', fontSize: 14 }}>
            Starting CareSlot Portal...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <VersionBanner />
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            {!isAuthenticated ? (
              // ==========================================
              // AUTHENTICATION GATE:
              // Only Login & Signup accessible when unauthenticated
              // ==========================================
              <>
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ animation: 'fade' }}
                />
                <Stack.Screen
                  name="Signup"
                  component={SignupScreen}
                  options={{ animation: 'slide_from_right' }}
                />
              </>
            ) : user?.role === 'doctor' ? (
              // ==========================================
              // DOCTOR APPLICATION HIERARCHY
              // ==========================================
              <>
                <Stack.Screen
                  name="DoctorPortal"
                  component={DoctorPortalScreen}
                  options={{ animation: 'fade' }}
                />
                <Stack.Screen
                  name="TelehealthCall"
                  component={TelehealthCallScreen}
                  options={{ gestureEnabled: false, animation: 'fade' }}
                />
                <Stack.Screen
                  name="TelehealthSummary"
                  component={TelehealthSummaryScreen}
                  options={{ gestureEnabled: false, animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
                <Stack.Screen
                  name="ProviderDetail"
                  component={ProviderDetailScreen}
                  options={{ animation: 'slide_from_right' }}
                />
              </>
            ) : user?.role === 'admin' ? (
              // ==========================================
              // ADMIN APPLICATION HIERARCHY
              // ==========================================
              <>
                <Stack.Screen
                  name="AdminPortal"
                  component={AdminPortalScreen}
                  options={{ animation: 'fade' }}
                />
                <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
                <Stack.Screen
                  name="ProviderDetail"
                  component={ProviderDetailScreen}
                  options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="DoctorPortal"
                  component={DoctorPortalScreen}
                  options={{ animation: 'slide_from_right' }}
                />
              </>
            ) : (
              // ==========================================
              // PATIENT APPLICATION HIERARCHY (Default)
              // ==========================================
              <>
                <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
                <Stack.Screen
                  name="ProviderDetail"
                  component={ProviderDetailScreen}
                  options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="BookingForm"
                  component={BookingFormScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="Confirmation"
                  component={ConfirmationScreen}
                  options={{ gestureEnabled: false, animation: 'fade' }}
                />
                <Stack.Screen
                  name="TelehealthWaitingRoom"
                  component={TelehealthWaitingRoomScreen}
                  options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="TelehealthCall"
                  component={TelehealthCallScreen}
                  options={{ gestureEnabled: false, animation: 'fade' }}
                />
                <Stack.Screen
                  name="TelehealthSummary"
                  component={TelehealthSummaryScreen}
                  options={{ gestureEnabled: false, animation: 'slide_from_bottom' }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
