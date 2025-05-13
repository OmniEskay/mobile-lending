import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { THEME_COLORS, SCREEN_PADDING } from '../config/constants';

const Home = ({ navigation }) => {
  const theme = useTheme();
  const user = useSelector(selectUser);

  const stats = {
    creditScore: 750,
    activeLoans: 1,
    totalBorrowed: 5000,
    totalLent: 2000,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome back, {user?.fullName?.split(' ')[0]}
        </Text>
        <Text variant="bodyLarge" style={styles.subgreeting}>
          Here's your lending overview
        </Text>
      </View>

      <Card style={styles.creditScoreCard}>
        <Card.Content>
          <Text variant="titleMedium">Credit Score</Text>
          <Text variant="displaySmall" style={styles.creditScore}>
            {stats.creditScore}
          </Text>
          <Text variant="bodyMedium" style={styles.creditStatus}>
            Good Standing
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.statsContainer}>
        <Card style={[styles.statsCard, { marginRight: 8 }]}>
          <Card.Content>
            <Text variant="titleMedium">Active Loans</Text>
            <Text variant="headlineMedium" style={styles.statsValue}>
              {stats.activeLoans}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statsCard, { marginLeft: 8 }]}>
          <Card.Content>
            <Text variant="titleMedium">Total Borrowed</Text>
            <Text variant="headlineMedium" style={styles.statsValue}>
              ${stats.totalBorrowed}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.actionCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.actionTitle}>
            Need a loan?
          </Text>
          <Text variant="bodyMedium" style={styles.actionDescription}>
            Apply for a loan with competitive interest rates and flexible terms.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('LoanRequest')}
            style={styles.actionButton}
          >
            Apply Now
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.actionCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.actionTitle}>
            Want to lend?
          </Text>
          <Text variant="bodyMedium" style={styles.actionDescription}>
            Browse loan requests from verified borrowers and start earning interest.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('LoanHistory')}
            style={styles.actionButton}
          >
            Browse Loans
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: SCREEN_PADDING,
    backgroundColor: THEME_COLORS.primary,
  },
  greeting: {
    color: '#fff',
    marginBottom: 4,
  },
  subgreeting: {
    color: '#fff',
    opacity: 0.8,
  },
  creditScoreCard: {
    margin: SCREEN_PADDING,
    elevation: 4,
  },
  creditScore: {
    color: THEME_COLORS.primary,
    marginVertical: 8,
  },
  creditStatus: {
    color: THEME_COLORS.success,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: SCREEN_PADDING,
    marginBottom: SCREEN_PADDING,
  },
  statsCard: {
    flex: 1,
    elevation: 2,
  },
  statsValue: {
    color: THEME_COLORS.primary,
    marginTop: 8,
  },
  actionCard: {
    margin: SCREEN_PADDING,
    marginTop: 0,
    elevation: 2,
  },
  actionTitle: {
    marginBottom: 8,
  },
  actionDescription: {
    marginBottom: 16,
    opacity: 0.7,
  },
  actionButton: {
    marginTop: 8,
  },
});

export default Home; 