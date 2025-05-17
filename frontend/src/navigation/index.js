import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

// Import your screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import LoanScreen from '../screens/LoanScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <NavigationContainer
      linking={Platform.select({
        web: {
          config: {
            screens: {
              Login: '/login',
              Register: '/register',
              Home: '/',
              Loan: '/loan/:id',
              Profile: '/profile',
            },
          },
          prefixes: [window.location.origin],
        },
        default: {},
      })}
      fallback={<LoadingScreen />}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // App Stack
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Loan" component={LoanScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 