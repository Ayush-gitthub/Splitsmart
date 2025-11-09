// src/screens/AddExpenseScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, StatusBar, ScrollView } from 'react-native';
import { TextInput, Button, Appbar, Menu, TouchableRipple } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAddExpenseMutation, useGetGroupByIdQuery } from '../api/splitSmartApi';
import { COLORS } from '../theme/colors';

const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params;

  // Fetch group data to get members and default currency
  const { data: group, isLoading: isGroupLoading } = useGetGroupByIdQuery(groupId);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState(null);
  const [paidByMenuVisible, setPaidByMenuVisible] = useState(false);

  // API Mutation
  const [addExpense, { isLoading: isAddingExpense }] = useAddExpenseMutation();

  // Set the default payer to the first member once the group data loads
  useEffect(() => {
    if (group?.members?.length > 0 && !paidById) {
      setPaidById(group.members[0].id);
    }
  }, [group, paidById]);

  const handleSaveExpense = async () => {
    const totalAmount = parseFloat(amount);
    if (!description.trim() || !totalAmount || totalAmount <= 0 || !paidById) {
      Alert.alert('Validation Error', 'Please fill in a valid description, amount, and select who paid.');
      return;
    }

    // For now, we only implement "equally" split
    const memberCount = group.members.length;
    const splitAmount = totalAmount / memberCount;
    const splits = group.members.map(member => ({
      user_id: member.id,
      owed_amount: splitAmount.toFixed(2), // Ensure 2 decimal places
    }));

    const expenseData = {
      description,
      total_amount: totalAmount,
      currency: group.default_currency || 'USD',
      split_type: 'equally',
      paid_by_id: paidById,
      splits,
    };

    try {
      await addExpense({ groupId, expenseData }).unwrap();
      navigation.goBack(); // Success! Go back to the details screen.
    } catch (err) {
      console.error('Failed to add expense:', err);
      Alert.alert('Save Failed', err.data?.detail || 'An error occurred. Please try again.');
    }
  };

  const selectedPayer = group?.members?.find(m => m.id === paidById);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Appbar.Header style={{ backgroundColor: COLORS.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.text} />
        <Appbar.Content title="Add New Expense" titleStyle={{ color: COLORS.text }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          theme={inputTheme}
          activeOutlineColor={COLORS.accent}
        />

        <TextInput
          label={`Amount (${group?.default_currency || 'USD'})`}
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
          theme={inputTheme}
          activeOutlineColor={COLORS.accent}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Paid by</Text>
        <Menu
          visible={paidByMenuVisible}
          onDismiss={() => setPaidByMenuVisible(false)}
          anchor={
            <TouchableRipple onPress={() => setPaidByMenuVisible(true)} style={styles.picker}>
              <Text style={styles.pickerText}>{selectedPayer ? selectedPayer.full_name : 'Select who paid'}</Text>
            </TouchableRipple>
          }
        >
          {group?.members?.map(member => (
            <Menu.Item
              key={member.id}
              onPress={() => {
                setPaidById(member.id);
                setPaidByMenuVisible(false);
              }}
              title={member.full_name}
            />
          ))}
        </Menu>

        <Button
          mode="contained"
          onPress={handleSaveExpense}
          style={styles.button}
          labelStyle={{ color: COLORS.primaryText, fontWeight: 'bold' }}
          loading={isAddingExpense || isGroupLoading}
          disabled={isAddingExpense || isGroupLoading}
        >
          Save Expense
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Common theme for text inputs
const inputTheme = {
  colors: {
    primary: COLORS.accent,
    text: COLORS.text,
    placeholder: COLORS.textSecondary,
    background: COLORS.surface,
    outline: COLORS.accent,
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  formContainer: { padding: 20 },
  input: { marginBottom: 20, backgroundColor: COLORS.surface },
  label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 16 },
  picker: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: 20,
  },
  pickerText: { color: COLORS.text, fontSize: 16 },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 20,
  },
});

export default AddExpenseScreen;