import React from 'react';
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
import { useFavoritesStore } from './src/store/useFavoritesStore';
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
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
