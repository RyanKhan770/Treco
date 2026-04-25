import 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import store from './src/store/store';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SessionExpiredModal from './src/components/SessionExpiredModal';

// Initialize Mapbox only in dev builds (not Expo Go)
const isExpoGo = Constants.executionEnvironment === 'storeClient';
if (!isExpoGo) {
  const MapboxGL = require('@rnmapbox/maps').default;
  MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');
}

function AppWithSession() {
  const isSessionExpired = useSelector((state) => state.auth.isSessionExpired);
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
      {isSessionExpired && <SessionExpiredModal />}
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AuthProvider>
          <AppWithSession />
        </AuthProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
