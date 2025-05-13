import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText, Card, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { LOAN_TYPES, LOAN_TERM_UNITS, SCREEN_PADDING } from '../../config/constants';

const loanValidationSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Loan amount is required')
    .min(100, 'Minimum loan amount is $100')
    .max(50000, 'Maximum loan amount is $50,000'),
  term: Yup.number()
    .required('Loan term is required')
    .min(1, 'Minimum term is 1')
    .max(60, 'Maximum term is 60'),
  termUnit: Yup.string()
    .required('Term unit is required')
    .oneOf(Object.values(LOAN_TERM_UNITS)),
  purpose: Yup.string()
    .required('Loan purpose is required')
    .min(10, 'Please provide more details about the loan purpose')
    .max(500, 'Loan purpose description is too long'),
  type: Yup.string()
    .required('Loan type is required')
    .oneOf(Object.values(LOAN_TYPES)),
});

const LoanRequest = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // TODO: Implement loan request submission
      console.log('Loan request:', values);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error submitting loan request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Request a Loan
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Fill in the details below to submit your loan request
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Card.Content>
          <Formik
            initialValues={{
              amount: '',
              term: '',
              termUnit: LOAN_TERM_UNITS.MONTHS,
              purpose: '',
              type: LOAN_TYPES.PERSONAL,
            }}
            validationSchema={loanValidationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View>
                <TextInput
                  label="Loan Amount ($)"
                  value={values.amount}
                  onChangeText={handleChange('amount')}
                  onBlur={handleBlur('amount')}
                  keyboardType="numeric"
                  mode="outlined"
                  error={touched.amount && errors.amount}
                  style={styles.input}
                />
                <HelperText type="error" visible={touched.amount && errors.amount}>
                  {errors.amount}
                </HelperText>

                <View style={styles.termContainer}>
                  <TextInput
                    label="Loan Term"
                    value={values.term}
                    onChangeText={handleChange('term')}
                    onBlur={handleBlur('term')}
                    keyboardType="numeric"
                    mode="outlined"
                    error={touched.term && errors.term}
                    style={[styles.input, { flex: 2, marginRight: 8 }]}
                  />
                  <TextInput
                    label="Term Unit"
                    value={values.termUnit}
                    onChangeText={handleChange('termUnit')}
                    onBlur={handleBlur('termUnit')}
                    mode="outlined"
                    error={touched.termUnit && errors.termUnit}
                    style={[styles.input, { flex: 1 }]}
                  />
                </View>
                <HelperText type="error" visible={touched.term && errors.term}>
                  {errors.term}
                </HelperText>

                <TextInput
                  label="Loan Type"
                  value={values.type}
                  onChangeText={handleChange('type')}
                  onBlur={handleBlur('type')}
                  mode="outlined"
                  error={touched.type && errors.type}
                  style={styles.input}
                />
                <HelperText type="error" visible={touched.type && errors.type}>
                  {errors.type}
                </HelperText>

                <TextInput
                  label="Loan Purpose"
                  value={values.purpose}
                  onChangeText={handleChange('purpose')}
                  onBlur={handleBlur('purpose')}
                  mode="outlined"
                  error={touched.purpose && errors.purpose}
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                />
                <HelperText type="error" visible={touched.purpose && errors.purpose}>
                  {errors.purpose}
                </HelperText>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.submitButton}
                >
                  Submit Request
                </Button>
              </View>
            )}
          </Formik>
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
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  formCard: {
    margin: SCREEN_PADDING,
  },
  input: {
    marginBottom: 4,
  },
  termContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

export default LoanRequest; 