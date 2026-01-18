import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../lib/firebase';
import {
  addListItem,
  createInvite,
  deleteListItem,
  subscribeToList,
  subscribeToListItems,
  toggleListItem,
} from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useTheme } from '../../lib/theme/ThemeProvider';

export default function ListDetailsScreen({ route }) {
  const { listId, ownerUid, listName } = route.params || {};
  const [items, setItems] = useState([]);
  const [itemText, setItemText] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);
  const [listOwnerUid, setListOwnerUid] = useState(ownerUid);
  const inputRef = useRef(null);
  const isOwner = auth.currentUser?.uid === listOwnerUid;
  const { theme } = useTheme();

  useEffect(() => {
    if (!listId) {
      return undefined;
    }

    return subscribeToListItems(listId, setItems);
  }, [listId]);

  useEffect(() => {
    if (!listId) {
      return undefined;
    }

    return subscribeToList(listId, (listDoc) => {
      if (!listDoc) {
        setMembers([]);
        return;
      }

      setListOwnerUid(listDoc.ownerUid);
      const memberUids = listDoc.memberUids || [];
      const memberEmails = listDoc.memberEmails || {};
      const nextMembers = memberUids.map((uid) => ({
        id: uid,
        email: memberEmails[uid],
      }));
      setMembers(nextMembers);
    });
  }, [listId]);

  const sortedItems = useMemo(() => {
    const toTimestamp = (value) => {
      if (!value) return 0;
      if (typeof value === 'number') return value;
      if (value.seconds) return value.seconds * 1000;
      return 0;
    };

    return [...items].sort((a, b) => {
      if (a.done !== b.done) {
        return a.done ? 1 : -1;
      }
      return toTimestamp(a.createdAt) - toTimestamp(b.createdAt);
    });
  }, [items]);

  const handleAddItem = async () => {
    const trimmedText = itemText.trim();
    if (!trimmedText) {
      setError(t('items.add.empty'));
      return;
    }

    setError('');
    try {
      await addListItem({
        listId,
        text: trimmedText,
        createdByUid: auth.currentUser?.uid || 'unknown',
      });
      setItemText('');
      inputRef.current?.focus();
    } catch (addError) {
      setError(t('items.add.error'));
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleListItem(listId, item.id, !item.done);
    } catch (toggleError) {
      setError(t('items.toggle.error'));
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteListItem(listId, itemId);
    } catch (deleteError) {
      setError(t('items.delete.error'));
    }
  };

  const handleInvite = async () => {
    const trimmedEmail = inviteEmail.trim();
    if (!trimmedEmail) {
      setError(t('invites.create.empty'));
      return;
    }

    setError('');
    try {
      await createInvite({
        listId,
        listName: listName || '',
        fromUid: auth.currentUser?.uid || 'unknown',
        fromEmail: auth.currentUser?.email || 'unknown',
        toEmail: trimmedEmail,
      });
      setInviteEmail('');
    } catch (inviteError) {
      setError(t('invites.create.error'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('listDetails.title')}
      </Text>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('listDetails.membersTitle')}
        </Text>
        {members.length === 0 ? (
          <Text style={[styles.mutedText, { color: theme.colors.muted }]}>
            {t('listDetails.membersEmpty')}
          </Text>
        ) : (
          members.map((member) => (
            <View
              key={member.id}
              style={[
                styles.memberRow,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
              ]}
            >
              <Text style={[styles.memberText, { color: theme.colors.text }]}>
                {member.email || member.id}
                {member.id === auth.currentUser?.uid
                  ? ` ${t('listDetails.youSuffix')}`
                  : ''}
              </Text>
              {member.id === listOwnerUid ? (
                <Text style={[styles.memberBadge, { color: theme.colors.primary }]}>
                  {t('listDetails.ownerBadge')}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>
      {isOwner ? (
        <View style={styles.inviteRow}>
          <TextInput
            placeholder={t('invites.create.placeholder')}
            style={[
              styles.input,
              { borderColor: theme.colors.border, color: theme.colors.text },
            ]}
            value={inviteEmail}
            onChangeText={setInviteEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={theme.colors.muted}
          />
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
            onPress={handleInvite}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
              {t('invites.create.submit')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.formRow}>
        <TextInput
          placeholder={t('items.add.placeholder')}
          style={[
            styles.input,
            { borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={itemText}
          onChangeText={setItemText}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
          ref={inputRef}
          placeholderTextColor={theme.colors.muted}
        />
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddItem}
        >
          <Text style={styles.primaryButtonText}>{t('items.add.submit')}</Text>
        </TouchableOpacity>
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.itemRow,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
          >
            <TouchableOpacity
              style={styles.itemToggle}
              onPress={() => handleToggle(item)}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.colors.primary },
                  item.done && { backgroundColor: theme.colors.primary },
                ]}
              />
              <Text
                style={[
                  styles.itemText,
                  { color: theme.colors.text },
                  item.done && { color: theme.colors.muted, textDecorationLine: 'line-through' },
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={[styles.deleteButtonText, { color: theme.colors.danger }]}>
                {t('common.delete')}
              </Text>
            </TouchableOpacity>
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
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  mutedText: {
    color: '#666',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#e1e1e1',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  memberText: {
    fontSize: 14,
  },
  memberBadge: {
    color: '#1f5eff',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButton: {
    backgroundColor: '#1f5eff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#c0392b',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 12,
  },
  itemRow: {
    borderColor: '#e1e1e1',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
  },
  itemText: {
    fontSize: 16,
  },
  deleteButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    color: '#c0392b',
    fontSize: 18,
    fontWeight: '700',
  },
});
