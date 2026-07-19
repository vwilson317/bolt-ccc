import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { BadgesScreen } from '../screens/BadgesScreen';
import { TicketsScreen } from '../screens/TicketsScreen';
import { QRScannerScreen } from '../screens/QRScannerScreen';
import { BadgeDetailScreen } from '../screens/BadgeDetailScreen';
import { TicketDetailScreen } from '../screens/TicketDetailScreen';
import { ClaimBadgeScreen } from '../screens/ClaimBadgeScreen';
import { getIdentifier } from '../services/storage';
import { Colors } from '../constants/colors';
import type { RootStackParamList, MainTabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = { Badges: '🏅', Scanner: '📷', Tickets: '🎟️' };
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name]}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Badges" component={BadgesScreen} options={{ title: 'Badges' }} />
      <Tab.Screen name="Scanner" component={QRScannerScreen} options={{ title: 'Scan' }} />
      <Tab.Screen name="Tickets" component={TicketsScreen} options={{ title: 'Tickets' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasIdentifier, setHasIdentifier] = useState(false);

  useEffect(() => {
    getIdentifier()
      .then((stored) => setHasIdentifier(!!stored))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasIdentifier ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : null}
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="BadgeDetail"
        component={BadgeDetailScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="ClaimBadge"
        component={ClaimBadgeScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
