// src/screens/GroupDetailsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, ActivityIndicator } from 'react-native';
import { Appbar, FAB, Provider as PaperProvider } from 'react-native-paper';
import { useGetGroupByIdQuery, useGetGroupBalancesQuery, useGetGroupExpensesQuery } from '../api/splitSmartApi';
import { COLORS } from '../theme/colors';

// Component to render the balances
const Balances = ({ balances, isLoading }) => {
  if (isLoading) return <ActivityIndicator color={COLORS.text} style={{ marginVertical: 20 }} />;
  return (
    <View style={styles.balancesContainer}>
      <Text style={styles.sectionTitle}>Group Balances</Text>
      {balances?.map(balance => (
        <View key={balance.user_id} style={styles.balanceRow}>
          <Text style={styles.balanceName}>{balance.full_name}</Text>
          <Text style={[styles.balanceAmount, { color: balance.balance >= 0 ? COLORS.success : COLORS.error }]}>
            {balance.balance.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
};

// Component to render an expense item
const ExpenseItem = ({ item }) => (
  <View style={styles.expenseItem}>
    <Text style={styles.expenseDescription}>{item.description}</Text>
    <Text style={styles.expenseAmount}>{item.total_amount.toFixed(2)} {item.currency}</Text>
  </View>
);

const GroupDetailsScreen = ({ route, navigation }) => {
  const { groupId } = route.params; // Get groupId passed from navigation
  const [fabOpen, setFabOpen] = React.useState(false);

  // Fetch all necessary data for the screen
  const { data: group, isLoading: isGroupLoading } = useGetGroupByIdQuery(groupId);
  const { data: balances, isLoading: areBalancesLoading } = useGetGroupBalancesQuery(groupId);
  const { data: expenses, isLoading: areExpensesLoading, refetch } = useGetGroupExpensesQuery(groupId);

  if (isGroupLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.text} /></View>;
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Appbar.Header style={{ backgroundColor: COLORS.background }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.text} />
          <Appbar.Content title={group?.name || 'Group'} titleStyle={{ color: COLORS.text, fontWeight: 'bold' }} />
        </Appbar.Header>

        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ExpenseItem item={item} />}
          ListHeaderComponent={
            <>
              <View style={styles.groupHeader}>
                <Text style={styles.groupDescription}>{group?.description}</Text>
              </View>
              <Balances balances={balances} isLoading={areBalancesLoading} />
              <Text style={styles.sectionTitle}>Expenses</Text>
            </>
          }
          ListEmptyComponent={
             !areExpensesLoading && <Text style={styles.emptyListText}>No expenses yet. Add one!</Text>
          }
          onRefresh={refetch}
          refreshing={areExpensesLoading}
          contentContainerStyle={{ paddingBottom: 80 }} // Padding to not hide last item behind FAB
        />

        <FAB.Group
          open={fabOpen}
          visible
          icon={fabOpen ? 'close' : 'plus'}
          actions={[
              { icon: 'account-plus', label: 'Add Member', onPress: () => alert('Add Member (to be built)'), small: false },
              // --- CHANGE THIS LINE ---
              { icon: 'currency-usd', label: 'Add Expense', onPress: () => navigation.navigate('AddExpense', { groupId: group.id }), small: false },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
          fabStyle={{ backgroundColor: COLORS.primary }}
          color={COLORS.primaryText}
        />
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  groupHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
  groupDescription: { fontSize: 16, color: COLORS.textSecondary },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, margin: 20, marginBottom: 10 },
  balancesContainer: { paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surface, paddingBottom: 10 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  balanceName: { fontSize: 16, color: COLORS.text },
  balanceAmount: { fontSize: 16, fontWeight: 'bold' },
  expenseItem: { backgroundColor: COLORS.surface, padding: 15, marginHorizontal: 20, marginVertical: 5, borderRadius: 8 },
  expenseDescription: { fontSize: 16, color: COLORS.text },
  expenseAmount: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },
  emptyListText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 30, fontSize: 16 },
});

export default GroupDetailsScreen;