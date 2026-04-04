import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../store/slices/authSlice';
import { colors } from '../constants/colors';

// Auth screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main tab screens
import HomeScreen from '../screens/home/HomeScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import GroupsScreen from '../screens/groups/GroupsScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Stack screens
import TrailDetailScreen from '../screens/explore/TrailDetailScreen';
import MapViewScreen from '../screens/shared/MapViewScreen';
import GroupDetailScreen from '../screens/groups/GroupDetailScreen';
import CreateTripScreen from '../screens/groups/CreateTripScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import ChecklistScreen from '../screens/shared/ChecklistScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import SearchScreen from '../screens/shared/SearchScreen';
import ReviewsScreen from '../screens/profile/ReviewsScreen';
import TripBudgetScreen from '../screens/shared/TripBudgetScreen';
import OfflineMapsScreen from '../screens/shared/OfflineMapsScreen';
import VerifyIdentityScreen from '../screens/profile/VerifyIdentityScreen';
import ReportIssueScreen from '../screens/shared/ReportIssueScreen';
import MyTripsScreen from '../screens/profile/MyTripsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  const icons = {
    Home: focused ? '🏠' : '🏠',
    Explore: focused ? '🗺️' : '🗺️',
    Groups: focused ? '👥' : '👥',
    Messages: focused ? '💬' : '💬',
    Profile: focused ? '👤' : '👤',
  };
  return <Text style={{ fontSize: 20 }}>{icons[name]}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="TrailDetail" component={TrailDetailScreen} />
      <Stack.Screen name="TrailMap" component={MapViewScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Checklist" component={ChecklistScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="TripBudget" component={TripBudgetScreen} />
      <Stack.Screen name="OfflineMaps" component={OfflineMapsScreen} />
      <Stack.Screen name="VerifyIdentity" component={VerifyIdentityScreen} />
      <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
      <Stack.Screen name="MyTrips" component={MyTripsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
