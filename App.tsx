import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Platform, StyleSheet, useWindowDimensions, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedScreen } from './src/screens/FeedScreen';
import { MatchScreen } from './src/screens/MatchScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { ContactProfileScreen } from './src/screens/ContactProfileScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { WebLandingScreen } from './src/screens/WebLandingScreen';
import { QuickRegisterModal } from './src/components/QuickRegisterModal';
import { Colors, Typography, getThemeColors } from './src/theme/colors';
import { useWetoStore } from './src/store/useWetoStore';
import { Ionicons } from '@expo/vector-icons';
import { waitForRealtimeChange } from './src/services/wetoApi';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const DESKTOP_LANDING_MIN_WIDTH = 980;
const WEB_TABLET_BREAKPOINT = 768;
const WEB_DESKTOP_BREAKPOINT = 1200;

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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const themeMode = useWetoStore((state) => state.themeMode);
  const palette = getThemeColors(themeMode);
  const isCompactScreen = width < 390;
  const bottomInset = Platform.OS === 'ios'
    ? Math.max(insets.bottom, 12)
    : Math.max(insets.bottom, Platform.OS === 'web' ? 16 : 8);
  const tabBarBaseHeight = isCompactScreen ? 64 : width >= WEB_TABLET_BREAKPOINT ? 72 : 68;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneContainerStyle: {
          backgroundColor: palette.background,
        },
        tabBarStyle: {
          backgroundColor: palette.tabBar,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: tabBarBaseHeight + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: isCompactScreen ? 6 : 8,
          paddingHorizontal: 4,
          ...Platform.select({
            web: { boxShadow: '0 -2px 16px rgba(0,0,0,0.06)' },
          }),
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
        tabBarActiveTintColor: palette.tabActive,
        tabBarInactiveTintColor: palette.tabInactive,
        tabBarLabelStyle: {
          ...Typography.small,
          fontSize: isCompactScreen ? 10 : 11,
          lineHeight: isCompactScreen ? 12 : 13,
          marginTop: 2,
          marginBottom: 1,
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
  const sessionToken = useWetoStore((state) => state.sessionToken);
  const hasQuickRegistered = useWetoStore((state) => state.hasQuickRegistered);
  const guestMatchTeaser = useWetoStore((state) => state.guestMatchTeaser);
  const themeMode = useWetoStore((state) => state.themeMode);
  const createGuestSession = useWetoStore((state) => state.createGuestSession);
  const bootstrapSession = useWetoStore((state) => state.bootstrapSession);
  const refreshRemoteState = useWetoStore((state) => state.refreshRemoteState);
  const syncVersion = useWetoStore((state) => state.syncVersion);
  const [showWelcomeFromLanding, setShowWelcomeFromLanding] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const syncVersionRef = useRef(syncVersion);
  const palette = getThemeColors(themeMode);

  const shouldShowDesktopLanding =
    Platform.OS === 'web' &&
    windowWidth >= DESKTOP_LANDING_MIN_WIDTH &&
    !sessionToken &&
    !showWelcomeFromLanding;
  const isWebPhone = windowWidth < WEB_TABLET_BREAKPOINT;
  const isWebTablet = windowWidth >= WEB_TABLET_BREAKPOINT && windowWidth < WEB_DESKTOP_BREAKPOINT;

  useEffect(() => {
    syncVersionRef.current = syncVersion;
  }, [syncVersion]);

  useEffect(() => {
    if (hasCompletedOnboarding || sessionToken) {
      setShowWelcomeFromLanding(false);
    }
  }, [hasCompletedOnboarding, sessionToken]);

  // Création silencieuse d'une session anonyme si aucune session n'existe
  useEffect(() => {
    if (!sessionToken) {
      void createGuestSession();
    }
  }, [createGuestSession, sessionToken]);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }
    void bootstrapSession();
  }, [bootstrapSession, sessionToken]);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }

    let cancelled = false;

    const runRealtimeLoop = async () => {
      while (!cancelled) {
        try {
          const change = await waitForRealtimeChange(sessionToken, syncVersionRef.current);
          if (cancelled) {
            return;
          }

          syncVersionRef.current = Math.max(syncVersionRef.current, change.syncVersion);

          if (change.changed) {
            await refreshRemoteState();
            syncVersionRef.current = useWetoStore.getState().syncVersion;
          }
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error('realtime sync failed', error);
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }
    };

    void runRealtimeLoop();

    return () => {
      cancelled = true;
    };
  }, [refreshRemoteState, sessionToken]);

  const appContent = (
    <NavigationContainer>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={palette.background}
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <Stack.Screen name="ContactProfile" component={ContactProfileScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      </Stack.Navigator>
      {guestMatchTeaser && !hasQuickRegistered && <QuickRegisterModal />}
    </NavigationContainer>
  );

  if (shouldShowDesktopLanding) {
    return (
      <GestureHandlerRootView style={[styles.webLandingRoot, { backgroundColor: palette.background }]}>
        <SafeAreaProvider>
          <WebLandingScreen onStart={() => setShowWelcomeFromLanding(true)} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (Platform.OS === 'web') {
    const frameWidth = isWebPhone
      ? windowWidth
      : isWebTablet
        ? Math.min(windowWidth - 20, 820)
        : Math.min(windowWidth - 36, 1120);
    const frameHeight = isWebPhone
      ? windowHeight
      : Math.min(windowHeight - 12, Math.max(560, windowHeight - 24));

    return (
      <GestureHandlerRootView style={styles.webRoot}>
        <SafeAreaProvider style={{ flex: 1, width: '100%', alignItems: 'center' }}>
          <View
            style={[
              styles.webFrame,
              !isWebPhone && styles.webFrameElevated,
              { backgroundColor: palette.background },
              {
                width: frameWidth,
                height: frameHeight,
                borderRadius: isWebPhone ? 0 : 24,
              },
            ]}
          >
            {appContent}
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: palette.background }]}>
      <SafeAreaProvider>
        {appContent}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  webRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100dvh' as any,
  },
  webLandingRoot: {
    flex: 1,
    backgroundColor: '#F7F3EC',
    minHeight: '100dvh' as any,
  },
  webFrame: {
    overflow: 'hidden' as any,
  },
  webFrameElevated: {
    ...Platform.select({
      web: { boxShadow: '0 0 60px rgba(0,0,0,0.35)' },
    }),
  },
});
