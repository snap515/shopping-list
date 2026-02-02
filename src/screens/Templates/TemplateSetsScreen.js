import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../lib/firebase';
import { deleteTemplateSet, subscribeToTemplateSets, subscribeToUserTemplates } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function TemplateSetsScreen({ route, navigation }) {
  const { templateId } = route.params || {};
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { showToast } = useToast();
  const numColumns = Platform.OS === 'web' ? 3 : 2;
  const tileWidth = Platform.OS === 'web' ? '32%' : '48%';
  const [template, setTemplate] = useState(null);
  const [sets, setSets] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid || !templateId) {
      return undefined;
    }
    return subscribeToUserTemplates(uid, (items) => {
      const next = items.find((item) => item.id === templateId) || null;
      setTemplate(next);
    });
  }, [templateId]);

  useEffect(() => {
    if (!templateId) {
      return undefined;
    }
    return subscribeToTemplateSets(templateId, setSets);
  }, [templateId]);

  const data = useMemo(
    () => [{ id: 'add-set', type: 'add-set' }, ...sets.map((set) => ({ ...set, type: 'set' }))],
    [sets]
  );

  const handleDelete = (setItem) => {
    const runDelete = async () => {
      if (deletingId) {
        return;
      }
      setDeletingId(setItem.id);
      try {
        await deleteTemplateSet(templateId, setItem.id);
        showToast(t('templates.deleteSetToast', { name: setItem.name }));
      } catch (error) {
        showToast(t('templates.deleteSetError'));
      } finally {
        setDeletingId(null);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `${t('templates.deleteSetTitle')}\n${t('templates.deleteSetMessage', { name: setItem.name })}`
      );
      if (confirmed) {
        runDelete();
      }
      return;
    }

    Alert.alert(
      t('templates.deleteSetTitle'),
      t('templates.deleteSetMessage', { name: setItem.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: runDelete },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {template?.name || t('templates.detailsTitle')}
      </Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`sets-${numColumns}`}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          if (item.type === 'add-set') {
            return (
              <TouchableOpacity
                style={[
                  styles.tile,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, width: tileWidth },
                ]}
                onPress={() => navigation.navigate('TemplateSetEditor', { templateId })}
              >
                <View style={[styles.tileBody, styles.addTileBody, { backgroundColor: theme.colors.background }]}>
                  <Text style={[styles.addTitle, { color: theme.colors.primary }]}>+</Text>
                </View>
                <View style={styles.tileFooter}>
                  <Text style={[styles.tileTitle, { color: theme.colors.text }]}>
                    {t('templates.addSet')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }

          const count = Array.isArray(item.items) ? item.items.length : 0;
          return (
            <TouchableOpacity
              style={[
                styles.tile,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, width: tileWidth },
              ]}
              onPress={() =>
                navigation.navigate('TemplateSetDetails', { templateId, setId: item.id })
              }
            >
              <View style={[styles.tileBody, { backgroundColor: theme.colors.background }]}>
                <TouchableOpacity
                  style={styles.deleteBadge}
                  onPress={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                >
                  <Text style={[styles.deleteText, { color: theme.colors.danger }]}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tileFooter}>
                <Text
                  style={[styles.tileTitle, { color: theme.colors.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
                <Text style={[styles.tileSubtitle, { color: theme.colors.muted }]}>
                  {t('templates.itemsCount', { count })}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
            {t('templates.setsEmpty')}
          </Text>
        }
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
  row: {
    gap: 12,
    marginBottom: 12,
  },
  tile: {
    flexGrow: 0,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    minHeight: 140,
  },
  tileBody: {
    height: 90,
    borderRadius: 8,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  addTileBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileFooter: {
    marginTop: 8,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  tileSubtitle: {
    marginTop: 4,
    fontSize: 12,
  },
  addTitle: {
    fontSize: 32,
    fontWeight: '600',
  },
  deleteBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteText: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
