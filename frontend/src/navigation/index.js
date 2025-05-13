import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Auth Screens
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Main Screens (to be created)
import Home from '../pages/Home';
import LoanRequest from '../pages/loans/LoanRequest';
import LoanHistory from '../pages/loans/LoanHistory';
import Profile from '../pages/Profile';

import { selectIsAuthenticated } from '../store/slices/authSlice';
import { THEME_COLORS } from '../config/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'LoanRequest':
            iconName = focused ? 'cash' : 'cash-outline';
            break;
          case 'LoanHistory':
            iconName = focused ? 'history' : 'history-outline';
            break;
          case 'Profile':
            iconName = focused ? 'account' : 'account-outline';
            break;
          default:
            iconName = 'circle';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: THEME_COLORS.primary,
      tabBarInactiveTintColor: THEME_COLORS.disabled,
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen
      name="LoanRequest"
      component={LoanRequest}
      options={{ title: 'Request Loan' }}
    />
    <Tab.Screen
      name="LoanHistory"
      component={LoanHistory}
      options={{ title: 'Loan History' }}
    />
    <Tab.Screen name="Profile" component={Profile} />
  </Tab.Navigator>
);

const Navigation = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Group>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </Stack.Group>
        ) : (
          // Main Stack
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 