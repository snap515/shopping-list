import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../lib/firebase';
import { createList, deleteList, renameList, subscribeToUserLists } from '../../lib/firestore';
import { logout } from '../../lib/auth';
import { t } from '../../lib/i18n';

export default function ListsScreen({ navigation }) {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [error, setError] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return undefined;
    }

    return subscribeToUserLists(uid, setLists);
  }, []);

  const handleCreateList = async () => {
    const trimmedName = listName.trim();
    if (!trimmedName) {
      setError(t('lists.create.emptyName'));
      return;
    }

    setError('');
    try {
      await createList({ name: trimmedName, ownerUid: auth.currentUser.uid });
      setListName('');
    } catch (createError) {
      setError(t('lists.create.error'));
    }
  };

  const startEditing = (list) => {
    setEditingListId(list.id);
    setEditingName(list.name);
  };

  const cancelEditing = () => {
    setEditingListId(null);
    setEditingName('');
  };

  const handleRename = async (listId) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setError(t('lists.rename.emptyName'));
      return;
    }

    setError('');
    try {
      await renameList(listId, trimmedName);
      cancelEditing();
    } catch (renameError) {
      setError(t('lists.rename.error'));
    }
  };

  const runDelete = async (listId) => {
    try {
      await deleteList(listId);
    } catch (deleteError) {
      setError(t('lists.delete.error'));
    }
  };

  const handleDelete = (listId) => {
    if (Platform.OS === 'web') {
      runDelete(listId);
      return;
    }

    Alert.alert(
      t('lists.delete.title'),
      t('lists.delete.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => runDelete(listId),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('lists.title')}</Text>
      <View style={styles.formRow}>
        <TextInput
          placeholder={t('lists.create.placeholder')}
          style={styles.input}
          value={listName}
          onChangeText={setListName}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateList}>
          <Text style={styles.primaryButtonText}>{t('lists.create.submit')}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isEditing = editingListId === item.id;

          return (
            <View style={styles.listCard}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ListDetails', { listId: item.id })}
                activeOpacity={isEditing ? 1 : 0.7}
                disabled={isEditing}
              >
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={editingName}
                    onChangeText={setEditingName}
                    placeholder={t('lists.rename.placeholder')}
                  />
                ) : (
                  <Text style={styles.listName}>{item.name}</Text>
                )}
                <Text style={styles.listMeta}>
                  {t('lists.membersCount')} {item.memberUids?.length || 0}
                </Text>
              </TouchableOpacity>
              <View style={styles.listActions}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={styles.inlineButton}
                    onPress={() => handleRename(item.id)}
                  >
                    <Text style={styles.inlineButtonText}>{t('common.save')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.inlineButton} onPress={cancelEditing}>
                    <Text style={styles.inlineButtonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.inlineButton}
                    onPress={() => startEditing(item)}
                  >
                    <Text style={styles.inlineButtonText}>{t('lists.rename.action')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.inlineButton}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.inlineButtonText}>{t('lists.delete.action')}</Text>
                  </TouchableOpacity>
                </>
              )}
              </View>
            </View>
          );
        }}
      />
      <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
        <Text style={styles.secondaryButtonText}>{t('auth.logout')}</Text>
      </TouchableOpacity>
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
    marginBottom: 12,
    gap: 8,
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
  errorText: {
    color: '#c0392b',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 12,
  },
  listCard: {
    borderColor: '#e1e1e1',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
  },
  editInput: {
    borderColor: '#d0d0d0',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  listMeta: {
    color: '#666',
    marginTop: 4,
  },
  listActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  inlineButton: {
    borderColor: '#1f5eff',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inlineButtonText: {
    color: '#1f5eff',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: '#1f5eff',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  secondaryButtonText: {
    color: '#1f5eff',
    fontSize: 16,
    fontWeight: '600',
  },
});
