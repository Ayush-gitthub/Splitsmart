// src/screens/PlaceholderAuthScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This is just a temporary screen.
// We will replace it with our Login and Register screens soon.
const PlaceholderAuthScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Authentication Screen</Text>
      <Text style={styles.subtext}>Login / Register will go here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subtext: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
});

export default PlaceholderAuthScreen;