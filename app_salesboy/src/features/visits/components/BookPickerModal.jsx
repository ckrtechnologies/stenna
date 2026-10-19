import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
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

  const filteredBooks = books.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (b.name || '').toLowerCase().includes(q) || (b.code || '').toLowerCase().includes(q);
  });

  const toggleShown = (id) => {
    if (shownIds.includes(id)) {
      setShownIds(shownIds.filter((item) => item !== id));
      // if un-pitching, also remove from bought
      setBoughtIds(boughtIds.filter((item) => item !== id));
    } else {
      setShownIds([...shownIds, id]);
    }
  };

  const toggleBought = (id) => {
    if (boughtIds.includes(id)) {
      setBoughtIds(boughtIds.filter((item) => item !== id));
    } else {
      setBoughtIds([...boughtIds, id]);
      // buying implies it was pitched/shown
      if (!shownIds.includes(id)) {
        setShownIds([...shownIds, id]);
      }
    }
  };

  const handleApply = () => {
    onConfirm({ shownIds, boughtIds });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Wallpaper Books</Text>
              <Text style={styles.sub}>Mark books Pitched and/or Ordered</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <IconX size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <IconSearch size={18} color={theme.colors.textMuted} />
            <TextInput
              placeholder="Search catalog books by name or code..."
              placeholderTextColor={theme.colors.textDim}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* Books List */}
          <ScrollView style={styles.bookList} showsVerticalScrollIndicator={false}>
            {filteredBooks.map((b) => {
              const isShown = shownIds.includes(b.id);
              const isBought = boughtIds.includes(b.id);

              return (
                <View key={b.id} style={styles.bookRow}>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookName}>{b.name}</Text>
                    {b.code && <Text style={styles.bookCode}>SKU: {b.code}</Text>}
                  </View>

                  <View style={styles.toggleGroup}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => toggleShown(b.id)}
                      style={[styles.pillBtn, isShown && styles.shownActive]}
                    >
                      {isShown ? (
                        <IconCheck size={13} color={theme.colors.accent} />
                      ) : (
                        <IconPlus size={13} color={theme.colors.textMuted} />
                      )}
                      <Text style={[styles.pillText, isShown && styles.shownActiveText]}>
                        Pitch
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => toggleBought(b.id)}
                      style={[styles.pillBtn, isBought && styles.boughtActive]}
                    >
                      {isBought ? (
                        <IconStar size={13} color={theme.colors.success} />
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
            })}
          </ScrollView>

          {/* Footer Bar */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.summaryTitle}>Selection Summary</Text>
              <Text style={styles.summaryText}>
                {shownIds.length} Pitched · {boughtIds.length} Ordered
              </Text>
            </View>
            <Button title="Confirm Books" onPress={handleApply} style={styles.confirmBtn} variant="primary" />
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
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.spacing.borderRadius.xl,
    borderTopRightRadius: theme.spacing.borderRadius.xl,
    borderTopWidth: 1,
    borderColor: theme.colors.borderLight,
    paddingTop: theme.spacing.base,
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: 28,
    maxHeight: '85%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
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
    marginBottom: theme.spacing.md,
    gap: 8
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMain
  },
  bookList: {
    maxHeight: 360
  },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
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
    backgroundColor: theme.colors.accentSurface,
    borderColor: theme.colors.accent
  },
  shownActiveText: {
    color: theme.colors.accent,
    fontWeight: theme.typography.fontWeight.bold
  },
  boughtActive: {
    backgroundColor: theme.colors.successSurface,
    borderColor: theme.colors.success
  },
  boughtActiveText: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.bold
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.heavy,
    color: theme.colors.accent,
    letterSpacing: 0.8
  },
  summaryText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain,
    marginTop: 2
  },
  confirmBtn: {
    height: 40,
    paddingHorizontal: 16
  }
});
