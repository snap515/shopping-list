import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../../lib/firebase';
import {
  addListItem,
  clearListItems,
  clearPurchasedItems,
  deleteListItem,
  subscribeToList,
  subscribeToListItems,
  toggleListItem,
  updateListItemText,
} from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useTheme } from '../../lib/theme/ThemeProvider';

export default function ListDetailsScreen({ route, navigation }) {
  const { listId, ownerUid, listName } = route.params || {};
  const [items, setItems] = useState([]);
  const [itemText, setItemText] = useState('');
  const [itemError, setItemError] = useState('');
  const [itemActionErrors, setItemActionErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [listOwnerUid, setListOwnerUid] = useState(ownerUid);
  const [currentListName, setCurrentListName] = useState(listName || '');
  const [listExists, setListExists] = useState(true);
  const [hasShownDeletedNotice, setHasShownDeletedNotice] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const inputRef = useRef(null);
  const isOwner = auth.currentUser?.uid === listOwnerUid;
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      setItemError('');
      setItemActionErrors({});
      setEditErrors({});
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

  const startEdit = (item) => {
    setEditingItemId(item.id);
    setEditingText(item.text || '');
    setEditErrors((prev) => {
      if (!prev[item.id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  const saveEdit = async (itemId) => {
    const trimmedText = editingText.trim();
    if (!trimmedText) {
      setEditErrors((prev) => ({
        ...prev,
        [itemId]: t('items.rename.empty'),
      }));
      return;
    }

    try {
      await updateListItemText(listId, itemId, trimmedText);
      setEditingItemId(null);
      setEditingText('');
      setEditErrors((prev) => {
        if (!prev[itemId]) {
          return prev;
        }
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (renameError) {
      setEditErrors((prev) => ({
        ...prev,
        [itemId]: t('items.rename.error'),
      }));
    }
  };

  const handleClearPurchased = async () => {
    try {
      await clearPurchasedItems(listId);
    } catch (clearError) {
      setItemError(t('listDetails.actions.clearPurchasedError'));
    }
  };

  const handleClearAll = async () => {
    try {
      await clearListItems(listId);
    } catch (clearError) {
      setItemError(t('listDetails.actions.clearAllError'));
    }
  };

  const confirmClearPurchased = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `${t('listDetails.actions.clearPurchasedTitle')}\n${t(
          'listDetails.actions.clearPurchasedMessage'
        )}`
      );
      if (confirmed) {
        handleClearPurchased();
      }
      return;
    }

    Alert.alert(
      t('listDetails.actions.clearPurchasedTitle'),
      t('listDetails.actions.clearPurchasedMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), onPress: handleClearPurchased },
      ],
      { cancelable: true }
    );
  };

  const confirmClearAll = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `${t('listDetails.actions.clearAllTitle')}\n${t(
          'listDetails.actions.clearAllMessage'
        )}`
      );
      if (confirmed) {
        handleClearAll();
      }
      return;
    }

    Alert.alert(
      t('listDetails.actions.clearAllTitle'),
      t('listDetails.actions.clearAllMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: handleClearAll },
      ],
      { cancelable: true }
    );
  };

  const openActionsMenu = () => {
    if (Platform.OS === 'web') {
      setActionsOpen(true);
      return;
    }

    Alert.alert(
      t('listDetails.actions.title'),
      undefined,
      [
        { text: t('listDetails.actions.clearPurchased'), onPress: confirmClearPurchased },
        { text: t('listDetails.actions.clearAll'), style: 'destructive', onPress: confirmClearAll },
        { text: t('common.cancel'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {currentListName || t('listDetails.title')}
        </Text>
        <TouchableOpacity
          style={[styles.actionsButton, { borderColor: theme.colors.border }]}
          onPress={openActionsMenu}
        >
          <Text style={[styles.actionsButtonText, { color: theme.colors.text }]}>...</Text>
        </TouchableOpacity>
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
                onPress={() => {
                  if (editingItemId === item.id) {
                    return;
                  }
                  handleToggle(item);
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: theme.colors.primary },
                    item.done && { backgroundColor: theme.colors.primary },
                  ]}
                />
                {editingItemId === item.id ? (
                  <TextInput
                    value={editingText}
                    onChangeText={setEditingText}
                    onSubmitEditing={() => saveEdit(item.id)}
                    returnKeyType="done"
                    style={[
                      styles.itemTextInput,
                      { borderColor: theme.colors.border, color: theme.colors.text },
                    ]}
                    placeholderTextColor={theme.colors.muted}
                    autoFocus
                  />
                ) : (
                  <Text
                    style={[
                      styles.itemText,
                      { color: theme.colors.text },
                      item.done && { color: theme.colors.muted, textDecorationLine: 'line-through' },
                    ]}
                  >
                    {item.text}
                  </Text>
                )}
              </TouchableOpacity>
              <View style={styles.itemActions}>
                {editingItemId === item.id ? (
                  <>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => saveEdit(item.id)}
                      accessibilityLabel={t('items.rename.save')}
                    >
                      <MaterialIcons name="check" size={22} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={cancelEdit}
                      accessibilityLabel={t('items.rename.cancel')}
                    >
                      <MaterialIcons name="close" size={22} color={theme.colors.muted} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => startEdit(item)}
                      accessibilityLabel={t('items.rename.action')}
                    >
                      <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDelete(item.id)}
                      accessibilityLabel={t('common.delete')}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={22}
                        color={theme.colors.danger}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
            {itemActionErrors[item.id] ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {itemActionErrors[item.id]}
              </Text>
            ) : null}
            {editErrors[item.id] ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {editErrors[item.id]}
              </Text>
            ) : null}
          </View>
        )}
      />
      {actionsOpen ? (
        <View style={styles.actionsOverlay}>
          <TouchableOpacity
            style={styles.actionsBackdrop}
            activeOpacity={1}
            onPress={() => setActionsOpen(false)}
          />
          <View style={[styles.actionsMenu, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.actionsTitle, { color: theme.colors.text }]}>
              {t('listDetails.actions.title')}
            </Text>
            <TouchableOpacity
              style={styles.actionsItem}
              onPress={() => {
                setActionsOpen(false);
                confirmClearPurchased();
              }}
            >
              <Text style={[styles.actionsItemText, { color: theme.colors.text }]}>
                {t('listDetails.actions.clearPurchased')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionsItem}
              onPress={() => {
                setActionsOpen(false);
                confirmClearAll();
              }}
            >
              <Text style={[styles.actionsItemText, { color: theme.colors.danger }]}>
                {t('listDetails.actions.clearAll')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionsItem}
              onPress={() => setActionsOpen(false)}
            >
              <Text style={[styles.actionsItemText, { color: theme.colors.muted }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
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
  actionsButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 18,
    textAlign: 'center',
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
  actionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  actionsBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  actionsMenu: {
    marginTop: 16,
    marginRight: 24,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    minWidth: 200,
  },
  actionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  actionsItem: {
    paddingVertical: 8,
  },
  actionsItemText: {
    fontSize: 14,
    fontWeight: '600',
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
    flexShrink: 1,
  },
  itemTextInput: {
    flex: 1,
    borderColor: '#d0d0d0',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
