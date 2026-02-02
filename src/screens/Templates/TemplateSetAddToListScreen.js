import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addItemsToList, subscribeToTemplateSets, subscribeToUserLists } from '../../lib/firestore';
import { auth } from '../../lib/firebase';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function TemplateSetAddToListScreen({ route, navigation }) {
  const { templateId, setId } = route.params || {};
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const [lists, setLists] = useState([]);
  const [setItem, setSetItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return undefined;
    }
    return subscribeToUserLists(uid, setLists);
  }, []);

  useEffect(() => {
    if (!templateId || !setId) {
      return undefined;
    }
    return subscribeToTemplateSets(templateId, (items) => {
      const next = items.find((item) => item.id === setId) || null;
      setSetItem(next);
    });
  }, [templateId, setId]);

  const handleAddToList = async (list) => {
    if (!setItem || isAdding) {
      return;
    }
    setIsAdding(true);
    try {
      await addItemsToList({
        listId: list.id,
        items: setItem.items || [],
        createdByUid: auth.currentUser?.uid || 'unknown',
        createdByEmail: auth.currentUser?.email || '',
      });
      showToast(t('templates.addedToExistingToast', { name: list.name }));
      navigation.goBack();
    } catch (error) {
      showToast(t('templates.addToListError'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('templates.selectList')}</Text>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
            {t('templates.noLists')}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.listRow,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
            onPress={() => handleAddToList(item)}
            disabled={isAdding}
          >
            <Text style={[styles.listText, { color: theme.colors.text }]}>{item.name}</Text>
          </TouchableOpacity>
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
  listContent: {
    paddingBottom: 12,
  },
  listRow: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  listText: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
