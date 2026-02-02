import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { subscribeToTemplateSets, updateTemplateSetItems, updateTemplateSetName } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function TemplateSetDetailsScreen({ route, navigation }) {
  const { templateId, setId } = route.params || {};
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const [setItem, setSetItem] = useState(null);
  const [nameDraft, setNameDraft] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [itemsDraft, setItemsDraft] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (!templateId || !setId) {
      return undefined;
    }
    return subscribeToTemplateSets(templateId, (items) => {
      const next = items.find((item) => item.id === setId) || null;
      setSetItem(next);
      if (next) {
        setNameDraft(next.name || '');
        setItemsDraft(Array.isArray(next.items) ? next.items : []);
      }
    });
  }, [templateId, setId]);

  const canSaveName = useMemo(() => {
    const trimmed = nameDraft.trim();
    return !!setItem && trimmed.length > 0 && trimmed !== setItem.name;
  }, [nameDraft, setItem]);

  const handleSaveName = async () => {
    if (!setItem || isSavingName) {
      return;
    }
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      showToast(t('templates.nameRequired'));
      return;
    }
    setIsSavingName(true);
    try {
      await updateTemplateSetName(templateId, setItem.id, trimmed);
      showToast(t('templates.renameSetSuccess', { name: trimmed }));
    } catch (error) {
      showToast(t('templates.renameSetError'));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleStartEditItem = (index) => {
    setEditingIndex(index);
    setEditingValue(itemsDraft[index] || '');
  };

  const handleCancelEditItem = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const persistItems = async (nextItems, successKey) => {
    if (!setItem || isSavingItem) {
      return;
    }
    setIsSavingItem(true);
    try {
      await updateTemplateSetItems(templateId, setItem.id, nextItems);
      if (successKey) {
        showToast(t(successKey));
      }
    } catch (error) {
      showToast(t('templates.itemUpdateError'));
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleSaveItem = async () => {
    if (editingIndex === null) {
      return;
    }
    const trimmed = editingValue.trim();
    if (!trimmed) {
      showToast(t('templates.itemRequired'));
      return;
    }
    const nextItems = itemsDraft.map((item, index) =>
      index === editingIndex ? trimmed : item
    );
    setItemsDraft(nextItems);
    setEditingIndex(null);
    setEditingValue('');
    await persistItems(nextItems, 'templates.itemUpdated');
  };

  const handleDeleteItem = (index) => {
    const runDelete = async () => {
      const nextItems = itemsDraft.filter((_, itemIndex) => itemIndex !== index);
      setItemsDraft(nextItems);
      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingValue('');
      }
      await persistItems(nextItems, 'templates.itemDeleted');
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(t('templates.deleteItemConfirm'));
      if (confirmed) {
        runDelete();
      }
      return;
    }

    Alert.alert(
      t('templates.deleteItemTitle'),
      t('templates.deleteItemConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: runDelete },
      ],
      { cancelable: true }
    );
  };

  const handleAddItem = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) {
      showToast(t('templates.itemRequired'));
      return;
    }
    const nextItems = [...itemsDraft, trimmed];
    setItemsDraft(nextItems);
    setNewItem('');
    await persistItems(nextItems, 'templates.itemUpdated');
  };

  if (!setItem) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('templates.setNotFound')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('templates.setDetailsTitle')}</Text>
      <View style={styles.nameRow}>
        <TextInput
          style={[styles.nameInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
          value={nameDraft}
          onChangeText={setNameDraft}
          placeholder={t('templates.namePlaceholder')}
          placeholderTextColor={theme.colors.muted}
        />
        <TouchableOpacity
          style={[
            styles.nameButton,
            { borderColor: theme.colors.primary, opacity: canSaveName && !isSavingName ? 1 : 0.5 },
          ]}
          onPress={handleSaveName}
          disabled={!canSaveName || isSavingName}
        >
          <Text style={[styles.nameButtonText, { color: theme.colors.primary }]}>
            {t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.formRow}>
        <TextInput
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          value={newItem}
          onChangeText={setNewItem}
          placeholder={t('templates.ingredientPlaceholder')}
          placeholderTextColor={theme.colors.muted}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: theme.colors.primary, opacity: newItem.trim() ? 1 : 0.5 },
          ]}
          onPress={handleAddItem}
          disabled={!newItem.trim()}
        >
          <Text style={styles.primaryButtonText}>{t('templates.addIngredient')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={itemsDraft}
        keyExtractor={(item, index) => `${setItem.id}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={[styles.itemRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
            {editingIndex === index ? (
              <View style={styles.itemEditRow}>
                <TextInput
                  style={[styles.itemInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                  value={editingValue}
                  onChangeText={setEditingValue}
                  placeholder={t('templates.ingredientPlaceholder')}
                  placeholderTextColor={theme.colors.muted}
                />
                <TouchableOpacity style={styles.iconButton} onPress={handleSaveItem} disabled={isSavingItem}>
                  <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleCancelEditItem}>
                  <MaterialIcons name="close" size={20} color={theme.colors.muted} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.itemContentRow}>
                <Text
                  style={[styles.itemText, { color: theme.colors.text }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item}
                </Text>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleStartEditItem(index)}>
                    <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteItem(index)}>
                    <MaterialIcons name="delete-outline" size={20} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
            {t('templates.itemsEmpty')}
          </Text>
        }
      />
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('TemplateSetCreateList', { templateId, setId })}
        disabled={itemsDraft.length === 0}
      >
        <Text style={styles.primaryButtonText}>{t('templates.addToNewList')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('TemplateSetAddToList', { templateId, setId })}
        disabled={itemsDraft.length === 0}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
          {t('templates.addToExisting')}
        </Text>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  nameButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameButtonText: {
    fontSize: 13,
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
    height: 40,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 12,
  },
  itemRow: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  itemContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    fontSize: 14,
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
  },
  iconButton: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
