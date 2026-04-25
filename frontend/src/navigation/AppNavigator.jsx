import React, { useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../store/slices/authSlice';
import { colors } from '../constants/colors';
import { fontSize, fontWeight, shadows } from '../constants/theme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Home01Icon, Compass01Icon, UserGroupIcon, BubbleChatIcon, UserIcon } from '@hugeicons/core-free-icons';

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
import RecordTrekScreen from '../screens/explore/RecordTrekScreen';
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
import MyPostsScreen from '../screens/profile/MyPostsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import EmergencyContactsScreen from '../screens/profile/EmergencyContactsScreen';
import HelpCenterScreen from '../screens/shared/HelpCenterScreen';
import SavedTrailsScreen from '../screens/profile/SavedTrailsScreen';
import PlanTripScreen from '../screens/shared/PlanTripScreen';
import OrganizerRequestScreen from '../screens/profile/OrganizerRequestScreen';
import UserProfileScreen from '../screens/shared/UserProfileScreen';
import CreatePostScreen from '../screens/home/CreatePostScreen';
import PostDetailScreen from '../screens/home/PostDetailScreen';
import WriteReviewScreen from '../screens/profile/WriteReviewScreen';
import WriteTrailReviewScreen from '../screens/explore/WriteTrailReviewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home:     Home01Icon,
  Explore:  Compass01Icon,
  Groups:   UserGroupIcon,
  Messages: BubbleChatIcon,
  Profile:  UserIcon,
};

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;
        const isFocused = state.index === index;
        const Icon = TAB_ICONS[route.name] || Home01Icon;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <View key={route.key} style={styles.tabItem}>
            <View
              style={[
                styles.tabIconWrap,
                isFocused && styles.tabIconWrapActive,
              ]}
              onTouchEnd={onPress}
            >
              <HugeiconsIcon
                icon={Icon}
                size={24}
                color={isFocused ? colors.primary : colors.textLight}
              />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Explore"  component={ExploreScreen} />
      <Tab.Screen name="Groups"   component={GroupsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"      component={SplashScreen} />
      <Stack.Screen name="Onboarding"  component={OnboardingScreen} />
      <Stack.Screen name="Login"       component={LoginScreen} />
      <Stack.Screen name="Register"    component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs"      component={MainTabs} />
      <Stack.Screen name="TrailDetail"   component={TrailDetailScreen} />
      <Stack.Screen name="RecordTrek"    component={RecordTrekScreen} />
      <Stack.Screen name="TrailMap"      component={MapViewScreen} />
      <Stack.Screen name="GroupDetail"   component={GroupDetailScreen} />
      <Stack.Screen name="CreateTrip"    component={CreateTripScreen} />
      <Stack.Screen name="Chat"          component={ChatScreen} />
      <Stack.Screen name="Checklist"     component={ChecklistScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Search"        component={SearchScreen} />
      <Stack.Screen name="Reviews"       component={ReviewsScreen} />
      <Stack.Screen name="TripBudget"    component={TripBudgetScreen} />
      <Stack.Screen name="OfflineMaps"   component={OfflineMapsScreen} />
      <Stack.Screen name="VerifyIdentity" component={VerifyIdentityScreen} />
      <Stack.Screen name="ReportIssue"   component={ReportIssueScreen} />
      <Stack.Screen name="MyTrips"       component={MyTripsScreen} />
      <Stack.Screen name="Settings"        component={SettingsScreen} />
      <Stack.Screen name="EditProfile"     component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword"  component={ChangePasswordScreen} />
      <Stack.Screen name="Privacy"         component={PrivacyScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="HelpCenter"      component={HelpCenterScreen} />
      <Stack.Screen name="SavedTrails"     component={SavedTrailsScreen} />
      <Stack.Screen name="PlanTrip"            component={PlanTripScreen} />
      <Stack.Screen name="OrganizerRequest"   component={OrganizerRequestScreen} />
      <Stack.Screen name="UserProfile"        component={UserProfileScreen} />
      <Stack.Screen name="CreatePost"         component={CreatePostScreen} />
      <Stack.Screen name="PostDetail"         component={PostDetailScreen} />
      <Stack.Screen name="WriteReview"     component={WriteReviewScreen} />
      <Stack.Screen name="WriteTrailReview" component={WriteTrailReviewScreen} />
      <Stack.Screen name="MyPosts"         component={MyPostsScreen} />
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

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
      android: { elevation: 8 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabIconWrap: {
    width: 44,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: colors.primaryPale,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: fontWeight.semiBold,
    color: colors.textLight,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
