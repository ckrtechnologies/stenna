import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
  Keyboard
} from 'react-native';
import Button from '@shared/ui/Button';
import { useGetBooksQuery } from '../api';
import { theme } from '@theme';
import { IconX, IconCheck, IconStar, IconPlus, IconSearch } from '@shared/icons';

export default function BookPickerModal({
  visible,
  onClose,
  selectedShown = [],
  selectedBought = [],
  onConfirm
}) {
  const { data: booksData } = useGetBooksQuery();
  const books = Array.isArray(booksData) ? booksData : booksData?.data || [];

  const [search, setSearch] = useState('');
  const [shownIds, setShownIds] = useState(selectedShown);
  const [boughtIds, setBoughtIds] = useState(selectedBought);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      setShownIds(selectedShown || []);
      setBoughtIds(selectedBought || []);
    }
  }, [visible]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 300);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isKeyboardOpen = keyboardHeight > 0;

  const filteredBooks = books.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (b.name || '').toLowerCase().includes(q) || (b.code || '').toLowerCase().includes(q);
  });

  // Pitched and Order are completely SEPARATE and INDEPENDENT sets
  const toggleShown = (id) => {
    if (shownIds.includes(id)) {
      setShownIds(shownIds.filter((item) => item !== id));
    } else {
      setShownIds([...shownIds, id]);
    }
  };

  const toggleBought = (id) => {
    if (boughtIds.includes(id)) {
      setBoughtIds(boughtIds.filter((item) => item !== id));
    } else {
      setBoughtIds([...boughtIds, id]);
    }
  };

  const handleApply = () => {
    Keyboard.dismiss();
    onConfirm({ shownIds, boughtIds });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { paddingBottom: isKeyboardOpen ? keyboardHeight + 14 : 0 }]}>
        {/* Top Backdrop Area: tap to dismiss keyboard & close */}
        <TouchableOpacity
          style={styles.backdropArea}
          activeOpacity={1}
          onPress={() => {
            if (isKeyboardOpen) {
              Keyboard.dismiss();
            } else {
              onClose();
            }
          }}
        />

        {/* Modal Bottom Sheet */}
        <View style={styles.sheet}>
          {/* 1. Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Wallpaper Books</Text>
              <Text style={styles.sub}>Mark books Pitched and/or Ordered</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <IconX size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* 2. Top Search Box */}
          <View style={styles.searchBox}>
            <IconSearch size={18} color={theme.colors.textMuted} />
            <TextInput
              placeholder="Search catalog books by name or code..."
              placeholderTextColor={theme.colors.textDim}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
                <IconX size={15} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* 3. Flexible Scrollable Content List */}
          <ScrollView
            style={[styles.bookList, isKeyboardOpen && styles.bookListKeyboard]}
            contentContainerStyle={styles.bookListContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredBooks.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No catalog books matching "{search}"</Text>
              </View>
            ) : (
              filteredBooks.map((b) => {
                const isShown = shownIds.includes(b.id);
                const isBought = boughtIds.includes(b.id);

                return (
                  <View key={b.id} style={styles.bookRow}>
                    <View style={styles.bookInfo}>
                      <Text style={styles.bookName}>{b.name}</Text>
                      {b.code && <Text style={styles.bookCode}>SKU: {b.code}</Text>}
                    </View>

                    <View style={styles.toggleGroup}>
                      {/* Pitch Button - Independent */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleShown(b.id)}
                        style={[styles.pillBtn, isShown && styles.shownActive]}
                      >
                        {isShown ? (
                          <IconCheck size={13} color="#FFFFFF" />
                        ) : (
                          <IconPlus size={13} color={theme.colors.textMuted} />
                        )}
                        <Text style={[styles.pillText, isShown && styles.shownActiveText]}>
                          Pitch
                        </Text>
                      </TouchableOpacity>

                      {/* Order Button - Independent */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleBought(b.id)}
                        style={[styles.pillBtn, isBought && styles.boughtActive]}
                      >
                        {isBought ? (
                          <IconStar size={13} color="#FFFFFF" />
                        ) : (
                          <IconPlus size={13} color={theme.colors.textMuted} />
                        )}
                        <Text style={[styles.pillText, isBought && styles.boughtActiveText]}>
                          Order
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* 4. Pinned Sticky CTA Footer (Always 100% Visible Above Keyboard) */}
          <View style={styles.footer}>
            <View style={styles.summaryWrap}>
              <Text style={styles.summaryTitle}>SELECTION SUMMARY</Text>
              <Text style={styles.summaryText}>
                {shownIds.length} Pitched · {boughtIds.length} Ordered
              </Text>
            </View>
            <Button
              title="Confirm Books"
              onPress={handleApply}
              style={styles.confirmBtn}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end'
  },
  backdropArea: {
    flex: 1
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: theme.colors.borderLight,
    paddingTop: theme.spacing.base,
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    maxHeight: '90%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain
  },
  sub: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  closeBtn: {
    padding: 6
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.spacing.borderRadius.md,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.sm,
    gap: 8
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMain
  },
  clearBtn: {
    padding: 4
  },
  bookList: {
    maxHeight: 320
  },
  bookListKeyboard: {
    maxHeight: 130
  },
  bookListContent: {
    paddingBottom: 4
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted
  },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight
  },
  bookInfo: {
    flex: 1,
    marginRight: 8
  },
  bookName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textMain
  },
  bookCode: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textDim,
    marginTop: 2
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 6
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.spacing.borderRadius.md,
    backgroundColor: theme.colors.surface
  },
  pillText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textMuted
  },
  shownActive: {
    backgroundColor: '#0B3D2E',
    borderColor: '#0B3D2E'
  },
  shownActiveText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.bold
  },
  boughtActive: {
    backgroundColor: '#B8860B',
    borderColor: '#B8860B'
  },
  boughtActiveText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.bold
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight
  },
  summaryWrap: {
    flex: 1
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.heavy,
    color: '#0B3D2E',
    letterSpacing: 0.8
  },
  summaryText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain,
    marginTop: 2
  },
  confirmBtn: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 10
  }
});
