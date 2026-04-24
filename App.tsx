import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeedScreen } from './src/screens/FeedScreen';
import { MatchScreen } from './src/screens/MatchScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { Colors, Typography } from './src/theme/colors';
import { useWetoStore } from './src/store/useWetoStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, string> = {
  Feed: '⊞',
  Match: '♡',
  Chat: '◯',
  Profil: '人',
};

const TAB_ICONS_ACTIVE: Record<string, string> = {
  Feed: '⊞',
  Match: '♥',
  Chat: '◉',
  Profil: '人',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const { matches, chats } = useWetoStore();
  const unreadChats = Object.values(chats).filter((c) => c.unread).length;
  const showBadge = (name === 'Match' && matches.length > 0) || (name === 'Chat' && unreadChats > 0);
  const badgeCount = name === 'Match' ? matches.length : unreadChats;

  return (
    <View style={tabStyles.iconWrap}>
      <View style={tabStyles.iconInner}>
        <Text style={[tabStyles.iconText, focused && tabStyles.iconActive]}>
          {focused ? TAB_ICONS_ACTIVE[name] : TAB_ICONS[name]}
        </Text>
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
  iconText: {
    fontSize: 22,
    color: Colors.tabInactive,
  },
  iconActive: {
    color: Colors.tabActive,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.accent,
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
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
