import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../../lib/firebase';
import { createInvite, deleteList, leaveList, renameList, subscribeToList } from '../../lib/firestore';
import { t } from '../../lib/i18n';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { useToast } from '../../lib/toast';

export default function ListInfoScreen({ route, navigation }) {
  const { listId } = route.params || {};
  const [listName, setListName] = useState('');
  const [members, setMembers] = useState([]);
  const [listOwnerUid, setListOwnerUid] = useState('');
  const [listExists, setListExists] = useState(true);
  const [hasShownDeletedNotice, setHasShownDeletedNotice] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [leaveError, setLeaveError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const unsubscribeRef = useRef(null);
  const { theme } = useTheme();
  const isOwner = auth.currentUser?.uid === listOwnerUid;
  const { showToast } = useToast();

  useFocusEffect(
    useCallback(() => {
      setInviteError('');
      setRenameError('');
      setDeleteError('');
      setLeaveError('');
    }, [])
  );

  useEffect(() => {
    if (!listId) {
      return undefined;
    }

    const unsubscribe = subscribeToList(listId, (listDoc) => {
      if (!listDoc) {
        setMembers([]);
        setListExists(false);
        return;
      }

      setListExists(true);
      setListName(listDoc.name || '');
      setRenameValue(listDoc.name || '');
      setListOwnerUid(listDoc.ownerUid);
      const memberUids = listDoc.memberUids || [];
      const memberEmails = listDoc.memberEmails || {};
      const nextMembers = memberUids.map((uid) => ({
        id: uid,
        email: memberEmails[uid],
      }));
      setMembers(nextMembers);
    });

    unsubscribeRef.current = unsubscribe;
    return () => {
      unsubscribeRef.current = null;
      unsubscribe();
    };
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

  const handleInvite = async () => {
    if (isInviting) {
      return;
    }

    const trimmedEmail = inviteEmail.trim();
    if (!trimmedEmail) {
      setInviteError(t('invites.create.empty'));
      return;
    }

    setInviteError('');
    setIsInviting(true);
    try {
      await createInvite({
        listId,
        listName: listName || '',
        fromUid: auth.currentUser?.uid || 'unknown',
        fromEmail: auth.currentUser?.email || 'unknown',
        toEmail: trimmedEmail,
      });
      setInviteEmail('');
      showToast(t('invites.create.sent', { email: trimmedEmail }));
    } catch (inviteErr) {
      const code = inviteErr?.code;
      if (code === 'invite/already-member') {
        setInviteError(t('invites.create.alreadyMember'));
      } else if (code === 'invite/already-pending') {
        setInviteError(t('invites.create.alreadyPending'));
      } else if (code === 'permission-denied') {
        setInviteError(t('invites.create.permissionDenied'));
      } else {
        setInviteError(t('invites.create.error'));
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleRename = async () => {
    if (isRenaming) {
      return;
    }

    const trimmedName = renameValue.trim();
    if (!trimmedName) {
      setRenameError(t('lists.rename.emptyName'));
      return;
    }

    setRenameError('');
    setIsRenaming(true);
    try {
      await renameList(listId, trimmedName);
      showToast(t('lists.rename.toast', { name: trimmedName }));
    } catch (renameErr) {
      setRenameError(t('lists.rename.error'));
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = () => {
    if (!isOwner) {
      return;
    }

    const runDelete = async () => {
      if (isDeleting) {
        return;
      }

      setDeleteError('');
      setIsDeleting(true);
      try {
        await deleteList(listId);
        showToast(t('lists.delete.toast', { name: listName || t('listDetails.title') }));
      } catch (deleteErr) {
        setDeleteError(t('lists.delete.error'));
      } finally {
        setIsDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `${t('lists.delete.title')}\n${t('lists.delete.message', {
          name: listName || t('listDetails.title'),
        })}`
      );
      if (confirmed) {
        runDelete();
      }
      return;
    }

    Alert.alert(
      t('lists.delete.title'),
      t('lists.delete.message', { name: listName || t('listDetails.title') }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: runDelete,
        },
      ],
      { cancelable: true }
    );
  };

  const handleLeave = () => {
    if (isOwner) {
      return;
    }

    const runLeave = async () => {
      if (isLeaving) {
        return;
      }

      setLeaveError('');
      setIsLeaving(true);
      try {
        await leaveList({ listId, userUid: auth.currentUser?.uid });
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        showToast(t('listDetails.leave.toast', { name: listName || t('listDetails.title') }));
        navigation.navigate('Tabs');
      } catch (leaveErr) {
        setLeaveError(t('listDetails.leave.error'));
      } finally {
        setIsLeaving(false);
      }
    };

    Alert.alert(
      t('listDetails.leave.title'),
      t('listDetails.leave.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('listDetails.leave.action'), onPress: runLeave },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('listInfo.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{listName}</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('listInfo.membersTitle')}
        </Text>
        {members.length === 0 ? (
          <Text style={[styles.mutedText, { color: theme.colors.muted }]}>
            {t('listInfo.membersEmpty')}
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
                  ? ` ${t('listInfo.youSuffix')}`
                  : ''}
              </Text>
              {member.id === listOwnerUid ? (
                <Text style={[styles.memberBadge, { color: theme.colors.primary }]}>
                  {t('listInfo.ownerBadge')}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      {isOwner ? (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('listInfo.inviteTitle')}
            </Text>
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
                style={[
                  styles.secondaryButton,
                  { borderColor: theme.colors.primary },
                  isInviting && styles.disabledButton,
                ]}
                onPress={handleInvite}
                disabled={isInviting}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                  {t('invites.create.submit')}
                </Text>
              </TouchableOpacity>
            </View>
            {inviteError ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {inviteError}
              </Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('listInfo.renameTitle')}
            </Text>
            <View style={styles.formRow}>
              <TextInput
                placeholder={t('lists.rename.placeholder')}
                style={[
                  styles.input,
                  { borderColor: theme.colors.border, color: theme.colors.text },
                ]}
                value={renameValue}
                onChangeText={setRenameValue}
                placeholderTextColor={theme.colors.muted}
              />
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { borderColor: theme.colors.primary },
                  isRenaming && styles.disabledButton,
                ]}
                onPress={handleRename}
                disabled={isRenaming}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
            {renameError ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {renameError}
              </Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.dangerButton,
                { borderColor: theme.colors.danger },
                isDeleting && styles.disabledButton,
              ]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <Text style={[styles.dangerButtonText, { color: theme.colors.danger }]}>
                {t('lists.delete.action', { name: listName || t('listDetails.title') })}
              </Text>
            </TouchableOpacity>
            {deleteError ? (
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {deleteError}
              </Text>
            ) : null}
          </View>
        </>
      ) : (
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.dangerButton,
              { borderColor: theme.colors.danger },
              isLeaving && styles.disabledButton,
            ]}
            onPress={handleLeave}
            disabled={isLeaving}
          >
            <Text style={[styles.dangerButtonText, { color: theme.colors.danger }]}>
              {t('listDetails.leave.action')}
            </Text>
          </TouchableOpacity>
          {leaveError ? (
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>
              {leaveError}
            </Text>
          ) : null}
        </View>
      )}
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
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
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
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  dangerButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#c0392b',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
