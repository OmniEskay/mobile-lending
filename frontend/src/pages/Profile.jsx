import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  List,
  Switch,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, logout } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { THEME_COLORS, SCREEN_PADDING } from '../config/constants';

const Profile = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={getInitials(user?.fullName || 'User')}
          style={styles.avatar}
        />
        <Text variant="headlineMedium" style={styles.name}>
          {user?.fullName}
        </Text>
        <Text variant="bodyLarge" style={styles.email}>
          {user?.email}
        </Text>
      </View>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account Information
          </Text>
          <List.Item
            title="Phone Number"
            description={user?.phone || 'Not provided'}
            left={(props) => <List.Icon {...props} icon="phone" />}
          />
          <Divider />
          <List.Item
            title="Email"
            description={user?.email}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Member Since"
            description="January 2024"
            left={(props) => <List.Icon {...props} icon="calendar" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Credit Information
          </Text>
          <List.Item
            title="Credit Score"
            description="750"
            left={(props) => <List.Icon {...props} icon="chart-line" />}
          />
          <Divider />
          <List.Item
            title="Total Loans"
            description="3"
            left={(props) => <List.Icon {...props} icon="bank" />}
          />
          <Divider />
          <List.Item
            title="Payment History"
            description="Good Standing"
            left={(props) => <List.Icon {...props} icon="check-circle" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Settings
          </Text>
          <List.Item
            title="Push Notifications"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Biometric Authentication"
            left={(props) => <List.Icon {...props} icon="fingerprint" />}
            right={() => (
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Change Password"
            left={(props) => <List.Icon {...props} icon="lock" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* TODO: Implement password change */}}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => {/* TODO: Implement edit profile */}}
          style={styles.editButton}
        >
          Edit Profile
        </Button>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={THEME_COLORS.error}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: SCREEN_PADDING * 2,
    backgroundColor: THEME_COLORS.primary,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    margin: SCREEN_PADDING,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  buttonContainer: {
    padding: SCREEN_PADDING,
  },
  editButton: {
    marginBottom: 8,
  },
  logoutButton: {
    borderColor: THEME_COLORS.error,
  },
});

export default Profile; 