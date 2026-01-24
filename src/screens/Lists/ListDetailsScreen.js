import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../../lib/firebase';
import { addListItem, deleteListItem, subscribeToList, subscribeToListItems, toggleListItem } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useTheme } from '../../lib/theme/ThemeProvider';

export default function ListDetailsScreen({ route, navigation }) {
  const { listId, ownerUid, listName } = route.params || {};
  const [items, setItems] = useState([]);
  const [itemText, setItemText] = useState('');
  const [itemError, setItemError] = useState('');
  const [itemActionErrors, setItemActionErrors] = useState({});
  const [listOwnerUid, setListOwnerUid] = useState(ownerUid);
  const [currentListName, setCurrentListName] = useState(listName || '');
  const [listExists, setListExists] = useState(true);
  const [hasShownDeletedNotice, setHasShownDeletedNotice] = useState(false);
  const inputRef = useRef(null);
  const isOwner = auth.currentUser?.uid === listOwnerUid;
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      setItemError('');
      setItemActionErrors({});
    }, [])
  );

  useEffect(() => {
    if (!listId || !listExists) {
      return undefined;
    }

    return subscribeToListItems(listId, setItems);
  }, [listId, listExists]);

  useEffect(() => {
    if (!listId) {
      return undefined;
    }

    return subscribeToList(listId, (listDoc) => {
      if (!listDoc) {
        setListExists(false);
        return;
      }

      setListExists(true);
      setListOwnerUid(listDoc.ownerUid);
      setCurrentListName(listDoc.name || '');
    });
  }, [listId]);

  useEffect(() => {
    if (listExists) {
      return;
    }

    if (!hasShownDeletedNotice) {
      setHasShownDeletedNotice(true);
      Alert.alert(t('lists.deleted.title'), t('lists.deleted.message'), [
        { text: t('common.ok') },
      ]);
    }

    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Tabs');
    }
  }, [hasShownDeletedNotice, listExists, navigation]);

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
      setItemError(t('items.add.empty'));
      return;
    }

    setItemError('');
    try {
      await addListItem({
        listId,
        text: trimmedText,
        createdByUid: auth.currentUser?.uid || 'unknown',
      });
      setItemText('');
      inputRef.current?.focus();
    } catch (addError) {
      setItemError(t('items.add.error'));
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleListItem(listId, item.id, !item.done);
      setItemActionErrors((prev) => {
        if (!prev[item.id]) {
          return prev;
        }
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    } catch (toggleError) {
      setItemActionErrors((prev) => ({
        ...prev,
        [item.id]: t('items.toggle.error'),
      }));
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteListItem(listId, itemId);
      setItemActionErrors((prev) => {
        if (!prev[itemId]) {
          return prev;
        }
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (deleteError) {
      setItemActionErrors((prev) => ({
        ...prev,
        [itemId]: t('items.delete.error'),
      }));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {currentListName || t('listDetails.title')}
        </Text>
      </View>
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
      {itemError ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>{itemError}</Text>
      ) : null}
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View>
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
            {itemActionErrors[item.id] ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {itemActionErrors[item.id]}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  formRow: {
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
