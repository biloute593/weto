import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeedScreen } from './src/screens/FeedScreen';
import { MatchScreen } from './src/screens/MatchScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { WebLandingScreen } from './src/screens/WebLandingScreen';
import { Colors, Typography } from './src/theme/colors';
import { useWetoStore } from './src/store/useWetoStore';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Feed: 'home-outline',
  Match: 'heart-outline',
  Chat: 'chatbubble-outline',
  Profil: 'person-outline',
};

const TAB_ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  Feed: 'home',
  Match: 'heart',
  Chat: 'chatbubble',
  Profil: 'person',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const { matches, chats } = useWetoStore();
  const unreadChats = Object.values(chats).filter((c) => c.unread).length;
  const showBadge = (name === 'Match' && matches.length > 0) || (name === 'Chat' && unreadChats > 0);
  const badgeCount = name === 'Match' ? matches.length : unreadChats;

  return (
    <View style={tabStyles.iconWrap}>
      <View style={tabStyles.iconInner}>
        <Ionicons
          name={focused ? TAB_ICONS_ACTIVE[name] : TAB_ICONS[name]}
          size={24}
          color={focused ? Colors.tabActive : Colors.tabInactive}
        />
        {showBadge && (
          <View style={tabStyles.badge}>
            <Text style={tabStyles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          ...Platform.select({
            web: { boxShadow: '0 -2px 16px rgba(0,0,0,0.06)' },
          }),
        },
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          ...Typography.small,
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Match" component={MatchScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const hasCompletedOnboarding = useWetoStore((state) => state.hasCompletedOnboarding);

  if (Platform.OS === 'web') {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <WebLandingScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {hasCompletedOnboarding ? (
              <>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
              </>
            ) : (
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
