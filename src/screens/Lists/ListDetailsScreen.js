import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../lib/firebase';
import {
  addListItem,
  createInvite,
  deleteListItem,
  subscribeToListItems,
  toggleListItem,
} from '../../lib/firestore';
import { t } from '../../lib/i18n';

export default function ListDetailsScreen({ route }) {
  const { listId, ownerUid, listName } = route.params || {};
  const [items, setItems] = useState([]);
  const [itemText, setItemText] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const isOwner = auth.currentUser?.uid === ownerUid;

  useEffect(() => {
    if (!listId) {
      return undefined;
    }

    return subscribeToListItems(listId, setItems);
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
    <View style={styles.container}>
      <Text style={styles.title}>{t('listDetails.title')}</Text>
      {isOwner ? (
        <View style={styles.inviteRow}>
          <TextInput
            placeholder={t('invites.create.placeholder')}
            style={styles.input}
            value={inviteEmail}
            onChangeText={setInviteEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={handleInvite}>
            <Text style={styles.secondaryButtonText}>{t('invites.create.submit')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.formRow}>
        <TextInput
          placeholder={t('items.add.placeholder')}
          style={styles.input}
          value={itemText}
          onChangeText={setItemText}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleAddItem}>
          <Text style={styles.primaryButtonText}>{t('items.add.submit')}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <TouchableOpacity
              style={styles.itemToggle}
              onPress={() => handleToggle(item)}
            >
              <View style={[styles.checkbox, item.done && styles.checkboxDone]} />
              <Text style={[styles.itemText, item.done && styles.itemTextDone]}>
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
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
    color: '#1f5eff',
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
    borderColor: '#1f5eff',
    borderRadius: 4,
  },
  checkboxDone: {
    backgroundColor: '#1f5eff',
  },
  itemText: {
    fontSize: 16,
  },
  itemTextDone: {
    color: '#888',
    textDecorationLine: 'line-through',
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
