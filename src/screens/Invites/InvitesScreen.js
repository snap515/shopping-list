import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../../lib/firebase';
import { acceptInvite, declineInvite, subscribeToIncomingInvites } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useLocale } from '../../lib/i18n/LocaleProvider';

export default function InvitesScreen() {
  const [invites, setInvites] = useState([]);
  const [inviteErrors, setInviteErrors] = useState({});
  const { theme } = useTheme();
  const { locale } = useLocale();

  useFocusEffect(
    useCallback(() => {
      setInviteErrors({});
    }, [])
  );

  useEffect(() => {
    const email = auth.currentUser?.email;
    if (!email) {
      return undefined;
    }

    return subscribeToIncomingInvites(email.toLowerCase(), setInvites);
  }, []);

  const handleAccept = async (invite) => {
    setInviteErrors((prev) => {
      if (!prev[invite.id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[invite.id];
      return next;
    });
    try {
      await acceptInvite({
        inviteId: invite.id,
        listId: invite.listId,
        userUid: auth.currentUser?.uid || 'unknown',
        userEmail: auth.currentUser?.email || '',
      });
    } catch (acceptError) {
      setInviteErrors((prev) => ({ ...prev, [invite.id]: t('invites.acceptError') }));
    }
  };

  const handleDecline = async (inviteId) => {
    setInviteErrors((prev) => {
      if (!prev[inviteId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[inviteId];
      return next;
    });
    try {
      await declineInvite(inviteId);
    } catch (declineError) {
      setInviteErrors((prev) => ({ ...prev, [inviteId]: t('invites.declineError') }));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('invites.title')}</Text>
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
            {inviteErrors[item.id] ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {inviteErrors[item.id]}
              </Text>
            ) : null}
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
