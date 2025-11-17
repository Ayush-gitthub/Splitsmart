import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput as RNTextInput,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useGetFriendsQuery, useGetPendingFriendRequestsQuery, useSendFriendRequestMutation, useAcceptFriendRequestMutation } from '../api/splitSmartApi';
import { COLORS } from '../theme/colors';

const ACCENT = COLORS.primary;

const Segmented = ({ active, setActive }) => (
  <View style={styles.segmented}>
    {['Friends', 'Requests', 'Add'].map((s) => (
      <TouchableOpacity key={s} style={[styles.segmentItem, active === s && styles.segmentActive]} onPress={() => setActive(s)}>
        <Text style={[styles.segmentText, active === s && styles.segmentTextActive]}>{s}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const FriendCard = ({ person, onPress, rightElement }) => (
  <View style={styles.card}>
    <View style={styles.cardLeft}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(person.full_name || person.email || 'U')[0].toUpperCase()}</Text>
      </View>
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.name}>{person.full_name || person.email}</Text>
        <Text style={styles.email}>{person.email}</Text>
      </View>
    </View>

    <View style={styles.cardRight}>
      {rightElement ? rightElement : (
        <TouchableOpacity onPress={onPress} style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const FriendsScreen = () => {
  const [segment, setSegment] = useState('Friends');
  const [query, setQuery] = useState('');
  const { data: friends = [], refetch: refetchFriends, isFetching: friendsLoading } = useGetFriendsQuery();
  const { data: pending = [], refetch: refetchPending, isFetching: pendingLoading } = useGetPendingFriendRequestsQuery();
  const [sendFriendRequest, sendState] = useSendFriendRequestMutation();
  const [acceptRequest, acceptState] = useAcceptFriendRequestMutation();

  const filteredFriends = useMemo(() => {
    if (!query) return friends;
    const q = query.toLowerCase();
    return friends.filter((f) => (f.full_name || f.email || '').toLowerCase().includes(q));
  }, [friends, query]);

  const handleSend = async () => {
    if (!query) return;
    try {
      await sendFriendRequest({ email: query }).unwrap();
      setQuery('');
      refetchPending();
      refetchFriends();
      alert('Friend request sent');
    } catch (e) {
      const msg = e?.data?.detail || 'Failed to send request';
      alert(msg);
    }
  };

  const handleAccept = async (requesterId) => {
    try {
      await acceptRequest(requesterId).unwrap();
      refetchPending();
      refetchFriends();
    } catch (e) {
      alert('Could not accept request');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <Text style={styles.title}>Friends</Text>

        <Segmented active={segment} setActive={setSegment} />

        {segment === 'Add' && (
          <View style={styles.addContainer}>
            <RNTextInput
              placeholder="Enter email to add"
              value={query}
              onChangeText={setQuery}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={styles.sendText}>{sendState.isLoading ? 'Sending...' : 'Send Request'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {segment === 'Friends' && (
          <FlatList
            data={filteredFriends}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item }) => <FriendCard person={item} />}
            ListEmptyComponent={<Text style={styles.empty}>No friends yet</Text>}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}

        {segment === 'Requests' && (
          <FlatList
            data={pending}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item }) => (
              <FriendCard
                person={item}
                rightElement={(
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
            ListEmptyComponent={<Text style={styles.empty}>No pending requests</Text>}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, flex: 1 },
  title: { fontSize: 30, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  segmented: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 6, marginBottom: 18 },
  segmentItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: COLORS.primary, },
  segmentText: { color: COLORS.textSecondary, fontWeight: '600' },
  segmentTextActive: { color: COLORS.primaryText },

  addContainer: { marginBottom: 18, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: COLORS.surface, padding: 12, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  sendText: { color: COLORS.primaryText, fontWeight: '700' },

  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(40,199,111,0.15)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.primary, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  email: { fontSize: 12, color: COLORS.textSecondary },
  viewBtn: { backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 6 },
  viewBtnText: { color: COLORS.primary },

  acceptBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  acceptText: { color: COLORS.primaryText, fontWeight: '700' },

  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 30, fontSize: 15 },
});

export default FriendsScreen;
