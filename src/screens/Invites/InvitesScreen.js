import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../lib/firebase';
import { acceptInvite, declineInvite, subscribeToIncomingInvites } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useTheme } from '../../lib/theme/ThemeProvider';

export default function InvitesScreen() {
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState('');
  const { theme } = useTheme();

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
      setError(t('invites.acceptError'));
    }
  };

  const handleDecline = async (inviteId) => {
    setError('');
    try {
      await declineInvite(inviteId);
    } catch (declineError) {
      setError(t('invites.declineError'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('invites.title')}</Text>
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}
      <FlatList
        data={invites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
            {t('invites.empty')}
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t('invites.list')} {item.listName || item.listId}
            </Text>
            <Text style={[styles.cardMeta, { color: theme.colors.muted }]}>
              {t('invites.from')} {item.fromEmailLower || item.fromUid}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleAccept(item)}
              >
                <Text style={styles.primaryButtonText}>{t('invites.accept')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
                onPress={() => handleDecline(item.id)}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                  {t('invites.decline')}
                </Text>
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
  },
  card: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardMeta: {
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  primaryButton: {
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
