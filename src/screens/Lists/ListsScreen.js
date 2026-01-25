import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../../lib/firebase';
import { createList, subscribeToUserLists } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useLocale } from '../../lib/i18n/LocaleProvider';

export default function ListsScreen({ navigation }) {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { theme } = useTheme();
  const { locale } = useLocale();

  useFocusEffect(
    useCallback(() => {
      setCreateError('');
    }, [])
  );

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return undefined;
    }

    return subscribeToUserLists(uid, setLists);
  }, []);

  const handleCreateList = async () => {
    if (isCreating) {
      return;
    }

    const trimmedName = listName.trim();
    if (!trimmedName) {
      setCreateError(t('lists.create.emptyName'));
      return;
    }

    setCreateError('');
    setIsCreating(true);
    try {
      await createList({
        name: trimmedName,
        ownerUid: auth.currentUser.uid,
        ownerEmail: auth.currentUser.email,
      });
      setListName('');
    } catch (createError) {
      if (createError?.code === 'permission-denied') {
        setCreateError(t('lists.create.permissionDenied'));
      } else {
        setCreateError(t('lists.create.error'));
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('lists.title')}</Text>
      </View>
      <View style={styles.formRow}>
        <TextInput
          placeholder={t('lists.create.placeholder')}
          style={[
            styles.input,
            { borderColor: theme.colors.border, color: theme.colors.text },
          ]}
          value={listName}
          onChangeText={setListName}
          onSubmitEditing={handleCreateList}
          returnKeyType="done"
          placeholderTextColor={theme.colors.muted}
        />
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
            isCreating && styles.disabledButton,
          ]}
          onPress={handleCreateList}
          disabled={isCreating}
        >
          <Text style={styles.primaryButtonText}>{t('lists.create.submit')}</Text>
        </TouchableOpacity>
      </View>
      {createError ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>
          {createError}
        </Text>
      ) : null}
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.listCard,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.listHeader}>
              <TouchableOpacity
                style={styles.listTitleButton}
                onPress={() =>
                  navigation.navigate('ListDetails', {
                    listId: item.id,
                    ownerUid: item.ownerUid,
                    listName: item.name,
                  })
                }
              >
                <Text style={[styles.listName, { color: theme.colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.listMeta, { color: theme.colors.muted }]}>
                  {t('lists.membersCount')} {item.memberUids?.length || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.manageButton, { borderColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('ListInfo', { listId: item.id })}
              >
                <Text style={[styles.manageButtonText, { color: theme.colors.primary }]}>
                  {t('lists.details.action')}
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listTitleButton: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
  },
  listMeta: {
    color: '#666',
    marginTop: 4,
  },
  manageButton: {
    borderColor: '#1f5eff',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  manageButtonText: {
    color: '#1f5eff',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
