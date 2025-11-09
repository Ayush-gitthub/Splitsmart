import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, StatusBar, TouchableOpacity  } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import GlassCard from '../components/GlassCard';
import FloatingActionButton from '../components/FloatingActionButton';

// Mock Data for now
const MOCK_GROUPS = [
  {
    id: '1',
    name: 'Trip to Tokyo',
    balance: 55.75, // Positive means you are owed
  },
  {
    id: '2',
    name: 'Apartment Bills',
    balance: -25.0, // Negative means you owe
  },
  {
    id: '3',
    name: 'Project Lunch',
    balance: 0,
  },
];

const GroupsScreen = ({ navigation }) => {
  const renderItem = ({ item }) => {
    const balanceColor = item.balance > 0 ? '#4CAF50' : '#FF9800';
    const balanceText =
      item.balance > 0
        ? `You are owed $${item.balance.toFixed(2)}`
        : item.balance < 0
        ? `You owe $${Math.abs(item.balance).toFixed(2)}`
        : 'Settled up';

    return (
      <TouchableOpacity onPress={() => navigation.navigate('GroupDetails')}>
        <GlassCard>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={[styles.balanceText, { color: balanceColor }]}>
            {balanceText}
            </Text>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.title}>My Groups</Text>
        <FlatList
          data={MOCK_GROUPS}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
        <FloatingActionButton onPress={() => navigation.navigate('AddExpense')} />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F0F0F0',
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 20,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F0F0F0',
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default GroupsScreen;