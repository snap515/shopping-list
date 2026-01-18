import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../lib/firebase';
import { acceptInvite, declineInvite, subscribeToIncomingInvites } from '../../lib/firestore';
import { t } from '../../lib/i18n';

export default function InvitesScreen() {
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const email = auth.currentUser?.email;
    if (!email) {
      return undefined;
    }

    return subscribeToIncomingInvites(email.toLowerCase(), setInvites);
  }, []);

  const handleAccept = async (invite) => {
    setError('');
    try {
      await acceptInvite({
        inviteId: invite.id,
        listId: invite.listId,
        userUid: auth.currentUser?.uid || 'unknown',
        userEmail: auth.currentUser?.email || '',
      });
    } catch (acceptError) {
      setError(t('invites.accept.error'));
    }
  };

  const handleDecline = async (inviteId) => {
    setError('');
    try {
      await declineInvite(inviteId);
    } catch (declineError) {
      setError(t('invites.decline.error'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('invites.title')}</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        data={invites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('invites.empty')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('invites.list')} {item.listName || item.listId}
            </Text>
            <Text style={styles.cardMeta}>
              {t('invites.from')} {item.fromEmailLower || item.fromUid}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => handleAccept(item)}>
                <Text style={styles.primaryButtonText}>{t('invites.accept')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => handleDecline(item.id)}>
                <Text style={styles.secondaryButtonText}>{t('invites.decline')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  errorText: {
    color: '#c0392b',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 12,
  },
  emptyText: {
    color: '#666',
  },
  card: {
    borderColor: '#e1e1e1',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardMeta: {
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#1f5eff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: '#1f5eff',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#1f5eff',
    fontSize: 14,
    fontWeight: '600',
  },
});
