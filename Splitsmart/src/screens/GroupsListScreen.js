// src/screens/GroupsListScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useGetGroupsQuery } from '../api/splitSmartApi';
import { COLORS } from '../theme/colors';

// A smaller component to render each item in the list
const GroupListItem = ({ group, onPress }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View style={styles.itemTextContainer}>
      <Text style={styles.itemName}>{group.name}</Text>
      <Text style={styles.itemDescription}>{group.description}</Text>
    </View>
    <Text style={styles.itemArrow}>›</Text>
  </TouchableOpacity>
);

const GroupsListScreen = () => {
  const navigation = useNavigation();

  // Use the RTK Query hook to fetch data
  const {
    data: groups,
    error,
    isLoading,
    isFetching,
    refetch
  } = useGetGroupsQuery();

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const handleSelectGroup = (group) => {
    navigation.navigate('GroupDetails', { groupId: group.id });
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        {/* UPDATED COLOR */}
        <ActivityIndicator size="large" color={COLORS.text} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Failed to load groups.</Text>
        <TouchableOpacity onPress={refetch}>
          <Text style={styles.retryText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Groups</Text>
      </View>

      {groups && groups.length > 0 ? (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <GroupListItem
              group={item}
              onPress={() => handleSelectGroup(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          onRefresh={refetch}
          refreshing={isFetching}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No groups yet.</Text>
          <Text style={styles.emptySubText}>Tap the '+' button to create one!</Text>
        </View>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        // UPDATED COLORS
        color={COLORS.primaryText} // Black icon on white button
        onPress={handleCreateGroup}
      />
    </View>
  );
};

// --- STYLES UPDATED FOR BLACK & WHITE THEME ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface, // Subtle border
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text, // White text
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  itemContainer: {
    backgroundColor: COLORS.surface, // Off-black surface for items
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent, // Gray accent border
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text, // White text
  },
  itemDescription: {
    fontSize: 14,
    color: COLORS.textSecondary, // Light gray for secondary text
    marginTop: 4,
  },
  itemArrow: {
    fontSize: 24,
    color: COLORS.accent, // Gray accent for the arrow
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 20,
    color: COLORS.text, // White text
    opacity: 0.8,
  },
  emptySubText: {
    fontSize: 16,
    color: COLORS.accent, // Gray accent
    marginTop: 10,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 18,
    color: COLORS.accent, // Gray accent for the retry link
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary, // White button background
  },
});

export default GroupsListScreen;