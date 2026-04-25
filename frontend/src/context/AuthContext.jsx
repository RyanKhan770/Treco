import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as logoutAction, hydrate, triggerSessionExpired } from '../store/slices/authSlice';
import { onSessionExpired } from '../utils/sessionEvents';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((state) => state.auth);

  // Register the session-expired handler once.
  // The axios interceptor calls emitSessionExpired() when a refresh token fails,
  // which triggers this → shows the SessionExpiredModal overlay without losing
  // the navigation stack.
  useEffect(() => {
    onSessionExpired(() => {
      dispatch(triggerSessionExpired());
    });
  }, [dispatch]);

  const login = async (userData, authToken, refreshToken) => {
    await AsyncStorage.setItem('token', authToken);
    if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
    dispatch(hydrate({ user: userData, token: authToken }));
  };

  const logout = () => dispatch(logoutAction());

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
