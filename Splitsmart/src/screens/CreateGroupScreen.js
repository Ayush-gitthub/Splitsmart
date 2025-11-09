// src/screens/CreateGroupScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, StatusBar, ScrollView } from 'react-native';
import { TextInput, Button, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCreateGroupMutation } from '../api/splitSmartApi';
import { COLORS } from '../theme/colors';

const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // --- NEW ---: State for the new fields
  const [currency, setCurrency] = useState('USD'); // Default to USD
  const [pictureUrl, setPictureUrl] = useState('');

  const [createGroup, { isLoading }] = useCreateGroupMutation();

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Group name is required.');
      return;
    }

    try {
      // --- NEW ---: Include all fields in the request body
      const newGroupData = {
        name,
        description,
        default_currency: currency.toUpperCase(), // Ensure currency is uppercase
        group_picture_url: pictureUrl.trim() || null, // Send null if empty
      };

      await createGroup(newGroupData).unwrap();

      // On success, simply navigate back. The list will auto-refresh.
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create group:', err);
      Alert.alert('Creation Failed', err.data?.detail || 'An error occurred. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Appbar.Header style={{ backgroundColor: COLORS.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.textLight} />
        <Appbar.Content title="Create New Group" titleStyle={{ color: COLORS.textLight }} />
      </Appbar.Header>

      {/* --- NEW ---: Added ScrollView to prevent overflow on smaller screens */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Group Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: COLORS.accentCyan, text: COLORS.textLight, placeholder: COLORS.textLight, background: COLORS.inputBackground } }}
          outlineColor={COLORS.inputBorder}
          textColor={COLORS.textLight}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: COLORS.accentCyan, text: COLORS.textLight, placeholder: COLORS.textLight, background: COLORS.inputBackground } }}
          outlineColor={COLORS.inputBorder}
          textColor={COLORS.textLight}
          multiline
          numberOfLines={3}
        />

        {/* --- NEW ---: Input for Default Currency */}
        <Text style={styles.label}>Default Currency</Text>
        <TextInput
          value={currency}
          onChangeText={setCurrency}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: COLORS.accentCyan, text: COLORS.textLight, placeholder: COLORS.textLight, background: COLORS.inputBackground } }}
          outlineColor={COLORS.inputBorder}
          textColor={COLORS.textLight}
          autoCapitalize="characters"
          maxLength={3} // Currency codes are 3 letters
        />

        {/* --- NEW ---: Input for Group Picture URL */}
        <Text style={styles.label}>Group Picture URL</Text>
        <TextInput
          value={pictureUrl}
          onChangeText={setPictureUrl}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: COLORS.accentCyan, text: COLORS.textLight, placeholder: COLORS.textLight, background: COLORS.inputBackground } }}
          outlineColor={COLORS.inputBorder}
          textColor={COLORS.textLight}
          keyboardType="url"
          autoCapitalize="none"
          placeholder="e.g., https://example.com/image.png"
        />

        <Button
          mode="contained"
          onPress={handleCreateGroup}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          loading={isLoading}
          disabled={!name.trim() || isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Group'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: COLORS.accentCyan,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: COLORS.primary,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  buttonContent: {
    height: 50,
  },
});

export default CreateGroupScreen;