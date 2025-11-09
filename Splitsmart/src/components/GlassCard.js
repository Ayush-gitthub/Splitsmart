import React from 'react';
import { View, StyleSheet } from 'react-native';

const GlassCard = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26, 26, 58, 0.7)', // Semi-transparent dark purple
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
});

export default GlassCard;
