import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator
} from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useGetGroupsQuery } from '../api/splitSmartApi';
import { COLORS } from '../theme/colors';

const ACCENT = COLORS.primary;

// ------------------ GROUP CARD ------------------
const GroupCard = ({ group, onPress }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitle}>{group.name}</Text>
        <Text style={styles.cardSubtitle}>{group.description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </View>
  </TouchableOpacity>
);

// ------------------ HEADER ------------------
const Header = ({ onFriendsPress }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>My Groups</Text>

    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.friendsPill}
      onPress={onFriendsPress}
    >
      <Text style={styles.friendsText}>Friends</Text>
    </TouchableOpacity>
  </View>
);

// ------------------ MAIN SCREEN ------------------
const GroupsListScreen = () => {
  const navigation = useNavigation();

  const {
    data: groups,
    isLoading,
    error,
    refetch,
    isFetching
  } = useGetGroupsQuery();

  const goToCreateGroup = () => navigation.navigate('CreateGroup');
  const goToFriends = () => navigation.navigate('Friends');
  const openGroup = (group) =>
    navigation.navigate('GroupDetails', { groupId: group.id });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.text} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Failed to load groups.</Text>
        <TouchableOpacity onPress={refetch}>
          <Text style={styles.retry}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <Header onFriendsPress={goToFriends} />

      {groups && groups.length > 0 ? (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={isFetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GroupCard group={item} onPress={() => openGroup(item)} />
          )}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No Groups Yet</Text>
          <Text style={styles.emptySubtitle}>Tap the + button to create one</Text>
        </View>
      )}

      <FAB
        icon="plus"
        onPress={goToCreateGroup}
        color={COLORS.primaryText}
        style={styles.fab}
      />
    </View>
  );
};

export default GroupsListScreen;

// ------------------ STYLES ------------------
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
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 15,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Friends pill
  friendsPill: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 30,

    backgroundColor: 'rgba(40,199,111,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(40,199,111,0.18)',
  },

  friendsText: {
    color: ACCENT,
    fontWeight: '700',
  },

  // Group list
  list: {
    padding: 20,
    paddingBottom: 120,
  },

  card: {
    width: '100%',
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,

    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardLeft: {
    flex: 1,
    marginRight: 8,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  arrow: {
    fontSize: 28,
    fontWeight: '300',
    color: ACCENT,
  },

  emptyTitle: {
    fontSize: 20,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: 4,
  },

  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    backgroundColor: COLORS.primary,
  },

  errorText: {
    color: COLORS.text,
    fontSize: 16,
  },

  retry: {
    marginTop: 10,
    color: ACCENT,
    textDecorationLine: 'underline',
  },
});
