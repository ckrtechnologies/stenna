import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@theme';
import {
  IconX,
  IconCheck,
  IconSearch,
  IconFilter
} from '@shared/icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DEFAULT_LEDGER_CATEGORIES = [
  { id: 'status', label: 'Store Status' },
  { id: 'conversion', label: 'Sales & Pitch' },
  { id: 'zone', label: 'Sales Zone' },
  { id: 'market', label: 'Market Hub' },
  { id: 'shop', label: 'Retail Store' },
  { id: 'date', label: 'Date Period' }
];

export const SHOPS_FILTER_CATEGORIES = [
  { id: 'zone', label: 'Sales Zone' },
  { id: 'market', label: 'Market Hub' },
  { id: 'status', label: 'Store Status' }
];

export default function TwoColumnFilterModal({
  visible,
  onClose,
  filters: initialFilters = {},
  onApply,
  onReset,
  zones = [],
  markets = [],
  shops = [],
  visits = [],
  categories = DEFAULT_LEDGER_CATEGORIES,
  title = 'Filter Field Ledger',
  subtitle,
  mode = 'ledger' // 'ledger' | 'shops'
}) {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'status');
  const [draftFilters, setDraftFilters] = useState({
    status: 'ALL',
    conversion: 'ALL',
    zoneId: null,
    marketId: null,
    shopId: null,
    dateRange: 'ALL',
    ...initialFilters
  });

  const [shopSearchText, setShopSearchText] = useState('');
  const [marketSearchText, setMarketSearchText] = useState('');

  // Sync draft filters when modal opens or initialFilters change
  useEffect(() => {
    if (visible) {
      setDraftFilters({
        status: 'ALL',
        conversion: 'ALL',
        zoneId: null,
        marketId: null,
        shopId: null,
        dateRange: 'ALL',
        ...initialFilters
      });
      setActiveCategory(categories[0]?.id || 'status');
      setShopSearchText('');
      setMarketSearchText('');
    }
  }, [visible, initialFilters, categories]);

  // Compute active filters count
  const activeCount = useMemo(() => {
    let count = 0;
    if (draftFilters.status && draftFilters.status !== 'ALL') count++;
    if (draftFilters.conversion && draftFilters.conversion !== 'ALL') count++;
    if (draftFilters.zoneId) count++;
    if (draftFilters.marketId) count++;
    if (draftFilters.shopId) count++;
    if (draftFilters.dateRange && draftFilters.dateRange !== 'ALL') count++;
    return count;
  }, [draftFilters]);

  // Category badge flags
  const categorySelected = {
    status: draftFilters.status && draftFilters.status !== 'ALL',
    conversion: draftFilters.conversion && draftFilters.conversion !== 'ALL',
    zone: Boolean(draftFilters.zoneId),
    market: Boolean(draftFilters.marketId),
    shop: Boolean(draftFilters.shopId),
    date: draftFilters.dateRange && draftFilters.dateRange !== 'ALL'
  };

  const handleClearAll = () => {
    const cleared = {
      status: 'ALL',
      conversion: 'ALL',
      zoneId: null,
      marketId: null,
      shopId: null,
      dateRange: 'ALL'
    };
    setDraftFilters(cleared);
  };

  const handleApply = () => {
    onApply(draftFilters);
    onClose();
  };

  // Filtered markets depending on selected zone & search
  const visibleMarkets = useMemo(() => {
    let list = markets;
    if (draftFilters.zoneId) {
      list = list.filter((m) => m.zone_id === draftFilters.zoneId);
    }
    if (marketSearchText.trim()) {
      const q = marketSearchText.toLowerCase();
      list = list.filter(
        (m) =>
          (m.name || '').toLowerCase().includes(q) ||
          (m.city || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [markets, draftFilters.zoneId, marketSearchText]);

  // Filtered shops depending on selected zone & market & search
  const visibleShops = useMemo(() => {
    return shops.filter((s) => {
      if (draftFilters.zoneId && s.zone_id !== draftFilters.zoneId) return false;
      if (draftFilters.marketId && s.market_id !== draftFilters.marketId) return false;
      if (shopSearchText.trim()) {
        const q = shopSearchText.toLowerCase();
        return (
          (s.shop_name || '').toLowerCase().includes(q) ||
          (s.contact_person || '').toLowerCase().includes(q) ||
          (s.phone || '').includes(q)
        );
      }
      return true;
    });
  }, [shops, draftFilters.zoneId, draftFilters.marketId, shopSearchText]);

  // Precomputed visit date counts for ledger
  const dateCounts = useMemo(() => {
    if (mode !== 'ledger') return {};
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      today: visits.filter((v) => new Date(v.visited_at) >= startOfToday).length,
      yesterday: visits.filter((v) => {
        const d = new Date(v.visited_at);
        return d >= startOfYesterday && d < startOfToday;
      }).length,
      week: visits.filter((v) => new Date(v.visited_at) >= sevenDaysAgo).length,
      month: visits.filter((v) => new Date(v.visited_at) >= startOfMonth).length
    };
  }, [visits, mode]);

  // Helper renderers for the right column options
  const renderRightOptions = () => {
    switch (activeCategory) {
      case 'status': {
        const statusOptions =
          mode === 'shops'
            ? [
                { key: 'ALL', label: 'All Stores', count: shops.length },
                {
                  key: 'ACTIVE',
                  label: 'Active Stores',
                  count: shops.filter((s) => s.is_active !== false).length
                },
                {
                  key: 'INACTIVE',
                  label: 'Inactive Stores',
                  count: shops.filter((s) => s.is_active === false).length
                }
              ]
            : [
                { key: 'ALL', label: 'All Statuses', count: visits.length },
                {
                  key: 'OPEN',
                  label: 'Store Open / Available',
                  count: visits.filter((v) => v.is_available).length
                },
                {
                  key: 'CLOSED',
                  label: 'Store Closed / Away',
                  count: visits.filter((v) => !v.is_available).length
                }
              ];

        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {statusOptions.map((opt) => {
              const isSelected = draftFilters.status === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftFilters((prev) => ({ ...prev, status: opt.key }))}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {opt.label}
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 2 }}>
                      {opt.count} {mode === 'shops' ? 'stores' : 'visits'}
                    </Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );
      }

      case 'conversion': {
        const boughtCount = visits.filter((v) =>
          (v.sales_visit_books || []).some((b) => b.action_type === 'bought')
        ).length;
        const shownCount = visits.filter((v) =>
          (v.sales_visit_books || []).some((b) => b.action_type === 'shown')
        ).length;
        const noConvCount = visits.filter(
          (v) => !(v.sales_visit_books || []).some((b) => b.action_type === 'bought')
        ).length;

        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {[
              { key: 'ALL', label: 'All Conversion Outcomes', count: visits.length },
              { key: 'BOUGHT', label: 'Order Converted / Placed', count: boughtCount },
              { key: 'SHOWN', label: 'Pitched / Catalog Shown', count: shownCount },
              { key: 'NO_CONVERSION', label: 'Visited (No Orders)', count: noConvCount }
            ].map((opt) => {
              const isSelected = draftFilters.conversion === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftFilters((prev) => ({ ...prev, conversion: opt.key }))}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {opt.label}
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 2 }}>
                      {opt.count} {opt.count === 1 ? 'visit' : 'visits'}
                    </Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );
      }

      case 'zone':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.optionRow, !draftFilters.zoneId && styles.optionRowSelected]}
              onPress={() => setDraftFilters((prev) => ({ ...prev, zoneId: null, marketId: null }))}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.optionText, !draftFilters.zoneId && styles.optionTextSelected]}>
                  All Sales Zones
                </Text>
                <Text style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 2 }}>
                  {mode === 'ledger'
                    ? `${visits.length} recorded visits • ${zones.length} assigned zones`
                    : `${shops.length} assigned stores • ${zones.length} zones`}
                </Text>
              </View>
              <View style={[styles.radioCircle, !draftFilters.zoneId && styles.radioCircleSelected]}>
                {!draftFilters.zoneId && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>

            {zones.length === 0 ? (
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                  No assigned zones found.
                </Text>
              </View>
            ) : (
              zones.map((z) => {
                const isSelected = draftFilters.zoneId === z.id;
                const zoneVisitsCount = visits.filter(
                  (v) => v.sales_vendors?.zone_id === z.id
                ).length;
                const zoneShopsCount = shops.filter((s) => s.zone_id === z.id).length;
                const zoneMarketsCount = markets.filter((m) => m.zone_id === z.id).length;

                return (
                  <TouchableOpacity
                    key={z.id}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() =>
                      setDraftFilters((prev) => {
                        const keepShop = prev.shopId
                          ? shops.some((s) => s.id === prev.shopId && s.zone_id === z.id)
                          : false;
                        return {
                          ...prev,
                          zoneId: z.id,
                          marketId: null,
                          shopId: keepShop ? prev.shopId : null
                        };
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {z.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 2 }}>
                        {mode === 'ledger'
                          ? `${zoneVisitsCount} ${zoneVisitsCount === 1 ? 'visit recorded' : 'visits recorded'} • ${zoneShopsCount} stores`
                          : `${zoneShopsCount} ${zoneShopsCount === 1 ? 'store' : 'stores'} • ${zoneMarketsCount} markets`}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        );

      case 'market': {
        const showMarketSearch = markets.length > 6;
        return (
          <View style={{ flex: 1 }}>
            {showMarketSearch && (
              <View style={styles.searchBarBox}>
                <IconSearch size={15} color={theme.colors.textMuted} />
                <TextInput
                  placeholder="Search market hub..."
                  placeholderTextColor={theme.colors.textDim}
                  value={marketSearchText}
                  onChangeText={setMarketSearchText}
                  style={styles.searchBarInput}
                />
              </View>
            )}
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TouchableOpacity
                style={[styles.optionRow, !draftFilters.marketId && styles.optionRowSelected]}
                onPress={() => setDraftFilters((prev) => ({ ...prev, marketId: null }))}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.optionText, !draftFilters.marketId && styles.optionTextSelected]}>
                    All Markets
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 2 }}>
                    {draftFilters.zoneId
                      ? `All markets in ${zones.find((z) => z.id === draftFilters.zoneId)?.name || 'selected zone'}`
                      : `${mode === 'ledger' ? `${visits.length} visits` : `${markets.length} assigned markets`}`}
                  </Text>
                </View>
                <View style={[styles.radioCircle, !draftFilters.marketId && styles.radioCircleSelected]}>
                  {!draftFilters.marketId && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>

              {visibleMarkets.length === 0 ? (
                <View style={{ padding: 16 }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                    {draftFilters.zoneId
                      ? 'No markets found for the selected zone.'
                      : 'No markets matching search.'}
                  </Text>
                </View>
              ) : (
                visibleMarkets.map((m) => {
                  const isSelected = draftFilters.marketId === m.id;
                  const marketVisitsCount = visits.filter(
                    (v) => v.sales_vendors?.market_id === m.id
                  ).length;
                  const marketShopsCount = shops.filter((s) => s.market_id === m.id).length;

                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                      onPress={() =>
                        setDraftFilters((prev) => {
                          const keepShop = prev.shopId
                            ? shops.some((s) => s.id === prev.shopId && s.market_id === m.id)
                            : false;
                          return {
                            ...prev,
                            marketId: m.id,
                            zoneId: m.zone_id || prev.zoneId,
                            shopId: keepShop ? prev.shopId : null
                          };
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          📍 {m.name}
                        </Text>
                        <Text style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 2 }}>
                          {mode === 'ledger'
                            ? `${marketVisitsCount} ${marketVisitsCount === 1 ? 'visit' : 'visits'}${m.city ? ` • ${m.city}` : ''}`
                            : marketShopsCount > 0
                            ? `${marketShopsCount} ${marketShopsCount === 1 ? 'store' : 'stores'}`
                            : m.city || 'Territory Hub'}
                        </Text>
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        );
      }

      case 'shop':
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.searchBarBox}>
              <IconSearch size={15} color={theme.colors.textMuted} />
              <TextInput
                placeholder="Search store name, contact, phone..."
                placeholderTextColor={theme.colors.textDim}
                value={shopSearchText}
                onChangeText={setShopSearchText}
                style={styles.searchBarInput}
              />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TouchableOpacity
                style={[styles.optionRow, !draftFilters.shopId && styles.optionRowSelected]}
                onPress={() => setDraftFilters((prev) => ({ ...prev, shopId: null }))}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.optionText, !draftFilters.shopId && styles.optionTextSelected]}>
                    All Retail Stores
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 2 }}>
                    {mode === 'ledger'
                      ? `${visits.length} recorded visits • ${shops.length} stores`
                      : `${shops.length} assigned stores`}
                  </Text>
                </View>
                <View style={[styles.radioCircle, !draftFilters.shopId && styles.radioCircleSelected]}>
                  {!draftFilters.shopId && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>

              {visibleShops.length === 0 ? (
                <View style={{ padding: 16 }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                    No retail stores match your filter criteria.
                  </Text>
                </View>
              ) : (
                visibleShops.map((s) => {
                  const isSelected = draftFilters.shopId === s.id;
                  const shopVisitsCount = visits.filter(
                    (v) => v.vendor_id === s.id || v.sales_vendors?.id === s.id
                  ).length;
                  const marketName =
                    s.sales_markets?.name || markets.find((m) => m.id === s.market_id)?.name;
                  const zoneName =
                    s.sales_zones?.name || zones.find((z) => z.id === s.zone_id)?.name;

                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                      onPress={() =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          shopId: s.id,
                          zoneId: s.zone_id || prev.zoneId,
                          marketId: s.market_id || prev.marketId
                        }))
                      }
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text
                          style={[styles.optionText, isSelected && styles.optionTextSelected]}
                          numberOfLines={1}
                        >
                          {s.shop_name}
                        </Text>
                        <Text
                          style={{ fontSize: 10, color: theme.colors.textDim, marginTop: 2 }}
                          numberOfLines={1}
                        >
                          {mode === 'ledger'
                            ? `${shopVisitsCount} ${shopVisitsCount === 1 ? 'visit' : 'visits'} • ${s.contact_person || 'Owner'}`
                            : `${s.contact_person || 'Owner'}${marketName ? ` • ${marketName}` : ''}${zoneName ? ` (${zoneName})` : ''}`}
                        </Text>
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        );

      case 'date':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {[
              { key: 'ALL', label: 'All Recorded Dates', count: visits.length },
              { key: 'TODAY', label: "Today's Visits Only", count: dateCounts.today || 0 },
              { key: 'YESTERDAY', label: 'Yesterday', count: dateCounts.yesterday || 0 },
              { key: 'WEEK', label: 'Past 7 Days', count: dateCounts.week || 0 },
              { key: 'MONTH', label: 'This Month', count: dateCounts.month || 0 }
            ].map((opt) => {
              const isSelected = draftFilters.dateRange === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftFilters((prev) => ({ ...prev, dateRange: opt.key }))}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {opt.label}
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 2 }}>
                      {opt.count} {opt.count === 1 ? 'visit' : 'visits'}
                    </Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.container,
              {
                paddingTop: insets.top + 8,
                paddingBottom: Math.max(insets.bottom, 12)
              }
            ]}
          >
            {/* Modal Top Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.filterIconBadge}>
                  <IconFilter size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.subtitle}>
                    {activeCount > 0
                      ? `${activeCount} filter criteria applied`
                      : subtitle || 'Select filters to refine view'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <IconX size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Split Two-Column Body */}
            <View style={styles.splitBody}>
              {/* Left Column: Categories Sidebar */}
              <View style={styles.leftCol}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const hasSelection = categorySelected[cat.id];
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.catItem, isActive && styles.catItemActive]}
                        onPress={() => setActiveCategory(cat.id)}
                        activeOpacity={0.8}
                      >
                        {isActive && <View style={styles.activeBar} />}
                        <Text
                          style={[styles.catLabel, isActive && styles.catLabelActive]}
                          numberOfLines={1}
                        >
                          {cat.label}
                        </Text>
                        {hasSelection && <View style={styles.catDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Right Column: Options Pane */}
              <View style={styles.rightCol}>{renderRightOptions()}</View>
            </View>

            {/* Bottom Actions Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleClearAll}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>Clear All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApply}
                activeOpacity={0.85}
              >
                <Text style={styles.applyBtnText}>
                  {activeCount > 0 ? `Apply Filters (${activeCount})` : 'Apply Filters'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end'
  },
  container: {
    height: Math.min(SCREEN_HEIGHT * 0.88, 680),
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  filterIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.navyPrimary,
    letterSpacing: -0.2
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  splitBody: {
    flex: 1,
    flexDirection: 'row'
  },
  leftCol: {
    width: '38%',
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0'
  },
  catItem: {
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  catItemActive: {
    backgroundColor: '#FFFFFF'
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: theme.colors.primary
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
    marginRight: 4
  },
  catLabelActive: {
    color: theme.colors.navyPrimary,
    fontWeight: '800'
  },
  catDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.primary
  },
  rightCol: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  optionRowSelected: {
    backgroundColor: 'rgba(11, 61, 46, 0.06)',
    borderColor: 'rgba(11, 61, 46, 0.15)'
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.8,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF'
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: theme.colors.primary
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    marginBottom: 8,
    gap: 6
  },
  searchBarInput: {
    flex: 1,
    paddingVertical: 7,
    fontSize: 12,
    color: '#1E293B'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12
  },
  clearBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B'
  },
  applyBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3
  }
});
