import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Modal, ScrollView, TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import Screen from '@shared/layout/Screen';
import AppBar from '@shared/layout/AppBar';
import Card from '@shared/ui/Card';
import Button from '@shared/ui/Button';
import Input from '@shared/ui/Input';
import BookPickerModal from '../components/BookPickerModal';
import { useRecordVisitMutation } from '../api';
import { useGetShopsQuery } from '@features/shops/api';
import { queueOfflineVisit } from '../slice';
import { ROUTES } from '@navigation/routes';
import { theme } from '@theme';
import {
  IconCheck,
  IconX,
  IconChevronDown,
  IconChevronRight,
  IconBook,
  IconBuildingStore,
  IconSearch
} from '@shared/icons';

export default function S06RecordVisit({ route, navigation }) {
  const dispatch = useDispatch();
  const { data: shopsData } = useGetShopsQuery({}, { refetchOnMountOrArgChange: true });
  const shops = shopsData?.data || [];

  const [currentShop, setCurrentShop] = useState(route.params?.prefilledShop || null);
  const [shopPickerVisible, setShopPickerVisible] = useState(false);
  const [shopSearch, setShopSearch] = useState('');

  const [recordVisitApi, { isLoading }] = useRecordVisitMutation();
  const [isAvailable, setIsAvailable] = useState(true);
  const [comments, setComments] = useState('');
  const [booksShown, setBooksShown] = useState([]);
  const [booksBought, setBooksBought] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!currentShop && shops.length > 0) {
      if (route.params?.vendorId) {
        const found = shops.find((s) => s.id === route.params.vendorId);
        if (found) setCurrentShop(found);
      } else {
        setCurrentShop(shops[0]);
      }
    }
  }, [shops, currentShop, route.params?.vendorId]);

  const filteredShops = useMemo(() => {
    if (!shopSearch.trim()) return shops;
    const q = shopSearch.toLowerCase();
    return shops.filter((s) => (s.shop_name || '').toLowerCase().includes(q) || (s.phone || '').includes(q));
  }, [shops, shopSearch]);

  const handleSubmitVisit = async () => {
    if (!currentShop?.id) {
      Alert.alert('Store Required', 'Please select a retail store to log this visit.');
      return;
    }

    const payload = {
      vendorId: currentShop.id,
      isAvailable,
      comments: comments.trim() || undefined,
      booksShown: isAvailable ? booksShown : [],
      booksBought: isAvailable ? booksBought : []
    };

    try {
      await recordVisitApi(payload).unwrap();
      navigation.replace(ROUTES.VISIT_SUCCESS, {
        shopName: currentShop.shop_name,
        isAvailable,
        booksShownCount: booksShown.length,
        booksBoughtCount: booksBought.length,
        isOffline: false
      });
    } catch (err) {
      const client_uuid = `offline_${Date.now()}`;
      dispatch(queueOfflineVisit({ ...payload, client_uuid, timestamp: new Date().toISOString() }));
      navigation.replace(ROUTES.VISIT_SUCCESS, {
        shopName: currentShop.shop_name,
        isAvailable,
        booksShownCount: booksShown.length,
        booksBoughtCount: booksBought.length,
        isOffline: true
      });
    }
  };

  return (
    <Screen
      variant="form"
      header={<AppBar title="Log Field Visit" onBack={() => navigation.goBack()} />}
      footer={<Button title="Submit & Complete Visit" onPress={handleSubmitVisit} loading={isLoading} variant="primary" />}
    >
      {/* Target Store Banner */}
      <Card variant="dark" style={styles.shopCard}>
        <View style={styles.shopRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={styles.storeTagRow}>
              <IconBuildingStore size={14} color={theme.colors.accent} />
              <Text style={styles.storeTag}>TARGET RETAIL STORE</Text>
            </View>
            <Text style={styles.storeName} numberOfLines={1}>{currentShop?.shop_name || 'Select Retail Store'}</Text>
            <Text style={styles.storeSub}>
              {currentShop?.contact_person || 'Owner'} • {currentShop?.phone || 'No phone recorded'}
            </Text>
            {currentShop?.shop_address ? (
              <Text style={styles.storeAddr} numberOfLines={1}>{currentShop.shop_address}</Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={() => setShopPickerVisible(true)} style={styles.changeBtn} activeOpacity={0.8}>
            <Text style={styles.changeBtnText}>Change</Text>
            <IconChevronDown size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Store Status Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>STORE AVAILABILITY STATUS</Text>
        <View style={styles.statusToggleRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsAvailable(true)}
            style={[styles.statusBtn, isAvailable && styles.statusBtnOpen]}
          >
            <IconCheck size={16} color={isAvailable ? '#ffffff' : theme.colors.textMuted} />
            <Text style={[styles.statusBtnText, isAvailable && styles.statusTextOpen]}>
              Store Open
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsAvailable(false)}
            style={[styles.statusBtn, !isAvailable && styles.statusBtnClosed]}
          >
            <IconX size={16} color={!isAvailable ? '#ffffff' : theme.colors.textMuted} />
            <Text style={[styles.statusBtnText, !isAvailable && styles.statusTextClosed]}>
              Closed / Away
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Catalog Books Section */}
      {isAvailable && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WALLPAPER CATALOG AUDIT</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            activeOpacity={0.85}
            onPress={() => setPickerVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={styles.bookIconBadge}>
                <IconBook size={20} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerTitle}>Catalog Books Selected</Text>
                <Text style={styles.pickerSub}>
                  {booksShown.length} pitched · {booksBought.length} ordered
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.pickerArrow}>Select</Text>
              <IconChevronRight size={16} color={theme.colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Field Remarks */}
      <View style={styles.section}>
        <Input
          label="Field Observations & Remarks"
          placeholder="e.g. Owner requested catalog ST-1002, stock low on vinyl textures..."
          multiline
          numberOfLines={4}
          value={comments}
          onChangeText={setComments}
          inputStyle={styles.multilineInput}
        />
      </View>

      {/* Store Picker Modal */}
      <Modal visible={shopPickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Assigned Store</Text>
              <TouchableOpacity onPress={() => setShopPickerVisible(false)} style={styles.closeBtn}>
                <IconX size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalSearchBox}>
              <IconSearch size={18} color={theme.colors.textMuted} />
              <TextInput
                placeholder="Search store name or phone..."
                placeholderTextColor={theme.colors.textDim}
                value={shopSearch}
                onChangeText={setShopSearch}
                style={styles.modalSearchInput}
              />
            </View>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {filteredShops.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.shopItem, currentShop?.id === s.id && styles.shopItemActive]}
                  onPress={() => {
                    setCurrentShop(s);
                    setShopPickerVisible(false);
                  }}
                >
                  <Text style={styles.itemTitle}>{s.shop_name}</Text>
                  <Text style={styles.itemSub}>{s.contact_person} • {s.phone}</Text>
                  <Text style={styles.itemAddr}>{s.shop_address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Book Picker Popover */}
      <BookPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        selectedShown={booksShown}
        selectedBought={booksBought}
        onConfirm={({ shownIds, boughtIds }) => {
          setBooksShown(shownIds);
          setBooksBought(boughtIds);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  shopCard: {
    marginBottom: theme.spacing.base
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  storeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4
  },
  storeTag: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.heavy,
    color: theme.colors.accent,
    letterSpacing: 0.8
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primarySurface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(29, 78, 216, 0.25)'
  },
  changeBtnText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary
  },
  storeName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF'
  },
  storeSub: {
    fontSize: theme.typography.fontSize.xs,
    color: '#CBD5E1',
    marginTop: 2
  },
  storeAddr: {
    fontSize: theme.typography.fontSize.xs,
    color: '#94A3B8',
    marginTop: 2
  },
  section: {
    marginBottom: theme.spacing.base
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.heavy,
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 8
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 10
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadius.md,
    backgroundColor: theme.colors.card
  },
  statusBtnOpen: {
    backgroundColor: theme.colors.call,
    borderColor: theme.colors.call
  },
  statusBtnClosed: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger
  },
  statusBtnText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMuted
  },
  statusTextOpen: { color: '#ffffff' },
  statusTextClosed: { color: '#ffffff' },
  pickerTrigger: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadius.md,
    padding: theme.spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bookIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: theme.colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pickerTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain
  },
  pickerSub: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  pickerArrow: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.base,
    borderTopWidth: 1,
    borderColor: theme.colors.borderLight
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain
  },
  closeBtn: {
    padding: 6
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8
  },
  modalSearchInput: {
    flex: 1,
    paddingVertical: 9,
    color: theme.colors.textMain,
    fontSize: theme.typography.fontSize.sm
  },
  shopItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight
  },
  shopItemActive: {
    backgroundColor: theme.colors.primarySurface
  },
  itemTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain
  },
  itemSub: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  itemAddr: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textDim,
    marginTop: 2
  }
});
