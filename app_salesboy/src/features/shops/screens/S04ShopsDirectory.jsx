import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useDispatch } from 'react-redux';
import Screen from '@shared/layout/Screen';
import AppBar from '@shared/layout/AppBar';
import Input from '@shared/ui/Input';
import ShopCard from '../components/ShopCard';
import TwoColumnFilterModal, { SHOPS_FILTER_CATEGORIES } from '@shared/ui/TwoColumnFilterModal';
import { useGetShopsQuery, useGetZonesQuery, useGetMarketsQuery } from '../api';
import { baseApi } from '@store/baseApi';
import { ROUTES } from '@navigation/routes';
import { theme } from '@theme';
import { IconSearch, IconBuildingStore, IconFilter, IconX } from '@shared/icons';

export default function S04ShopsDirectory({ navigation }) {
  const dispatch = useDispatch();
  const { data, isLoading, refetch: refetchShops, isFetching: isFetchingShops } = useGetShopsQuery({}, {
    refetchOnMountOrArgChange: true
  });
  const { data: zonesData, isFetching: isFetchingZones, refetch: refetchZones } = useGetZonesQuery({}, { refetchOnMountOrArgChange: true });
  const { data: marketsData, isFetching: isFetchingMarkets, refetch: refetchMarkets } = useGetMarketsQuery({}, { refetchOnMountOrArgChange: true });

  const assignedZones = zonesData?.data || [];
  const assignedMarkets = marketsData?.data || [];
  const shops = data?.data || [];

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    zoneId: null,
    marketId: null,
    status: 'ALL'
  });

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      dispatch(
        baseApi.util.invalidateTags([
          'Dashboard',
          'Shops',
          'ShopDetail',
          'Visits',
          'Zones',
          'Markets',
          'Books'
        ])
      );
      await Promise.all([
        refetchShops ? refetchShops() : Promise.resolve(),
        refetchZones ? refetchZones() : Promise.resolve(),
        refetchMarkets ? refetchMarkets() : Promise.resolve()
      ]);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  // Extract comprehensive zones (backend assigned zones + any in shops)
  const zones = useMemo(() => {
    const map = new Map();
    assignedZones.forEach((z) => {
      if (z.id) map.set(z.id, z);
    });
    shops.forEach((s) => {
      if (s.sales_zones?.id && !map.has(s.sales_zones.id)) {
        map.set(s.sales_zones.id, s.sales_zones);
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [assignedZones, shops]);

  // Extract comprehensive markets (backend assigned markets + any in shops with zone_id)
  const markets = useMemo(() => {
    const map = new Map();
    assignedMarkets.forEach((m) => {
      if (m.id) map.set(m.id, m);
    });
    shops.forEach((s) => {
      if (s.sales_markets?.id && !map.has(s.sales_markets.id)) {
        map.set(s.sales_markets.id, {
          ...s.sales_markets,
          zone_id: s.zone_id || s.sales_markets.zone_id
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [assignedMarkets, shops]);

  // Active filter count
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.zoneId) count++;
    if (filters.marketId) count++;
    if (filters.status && filters.status !== 'ALL') count++;
    return count;
  }, [filters]);

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      // 1. Zone filter
      if (filters.zoneId && s.zone_id !== filters.zoneId) return false;

      // 2. Market filter
      if (filters.marketId && s.market_id !== filters.marketId) return false;

      // 3. Status filter
      if (filters.status === 'ACTIVE' && s.is_active === false) return false;
      if (filters.status === 'INACTIVE' && s.is_active !== false) return false;

      // 4. Keyword search
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const name = (s.shop_name || '').toLowerCase();
      const person = (s.contact_person || '').toLowerCase();
      const phone = (s.phone || '').toLowerCase();
      const addr = (s.shop_address || '').toLowerCase();
      const market = (s.sales_markets?.name || '').toLowerCase();
      const zone = (s.sales_zones?.name || '').toLowerCase();
      return (
        name.includes(q) ||
        person.includes(q) ||
        phone.includes(q) ||
        addr.includes(q) ||
        market.includes(q) ||
        zone.includes(q)
      );
    });
  }, [shops, search, filters]);

  const activeZoneName = zones.find((z) => z.id === filters.zoneId)?.name;
  const activeMarketName = markets.find((m) => m.id === filters.marketId)?.name;

  const handleSelectShop = (shop) => {
    navigation.navigate(ROUTES.SHOP_DETAIL, { vendorId: shop.id });
  };

  const handleCheckIn = (shop) => {
    navigation.navigate(ROUTES.RECORD_VISIT, { vendorId: shop.id, prefilledShop: shop });
  };

  const handleResetFilters = () => {
    setFilters({
      zoneId: null,
      marketId: null,
      status: 'ALL'
    });
  };

  return (
    <Screen
      variant="scroll"
      header={
        <AppBar
          title="Retail Stores"
          subtitle={`${filteredShops.length} of ${shops.length} assigned stores in beat`}
          showMenu={true}
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isFetchingShops || isFetchingZones || isFetchingMarkets}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Search Bar + Dedicated Filter Trigger Button Row */}
      <View style={styles.searchFilterRow}>
        <View style={styles.searchInputWrap}>
          <Input
            prefix={<IconSearch size={18} color={theme.colors.textMuted} />}
            placeholder="Search shop name, owner, phone..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
          />
        </View>

        <TouchableOpacity
          style={[styles.filterTriggerBtn, activeCount > 0 && styles.filterTriggerBtnActive]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.85}
        >
          <IconFilter size={16} color="#FFFFFF" />
          <Text style={styles.filterTriggerText}>
            {activeCount > 0 ? `Filters (${activeCount})` : 'Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Record Count & Meta Bar */}
      <View style={styles.recordCountBox}>
        <Text style={styles.recordCountText}>
          Showing <Text style={{ fontWeight: '800', color: theme.colors.navyPrimary }}>{filteredShops.length}</Text> of {shops.length} stores
        </Text>
        {activeCount > 0 && (
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={styles.clearAllLink}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active Filter Badges Row */}
      {activeCount > 0 && (
        <View style={styles.activePillsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activePillsScroll}
            contentContainerStyle={styles.activePillsContainer}
          >
            {activeZoneName && (
              <TouchableOpacity
                style={styles.filterPill}
                onPress={() => setFilters((p) => ({ ...p, zoneId: null }))}
                activeOpacity={0.7}
              >
                <Text style={styles.filterPillText}>Zone: {activeZoneName}</Text>
                <IconX size={12} color="#475569" />
              </TouchableOpacity>
            )}

            {activeMarketName && (
              <TouchableOpacity
                style={styles.filterPill}
                onPress={() => setFilters((p) => ({ ...p, marketId: null }))}
                activeOpacity={0.7}
              >
                <Text style={styles.filterPillText}>Market: {activeMarketName}</Text>
                <IconX size={12} color="#475569" />
              </TouchableOpacity>
            )}

            {filters.status !== 'ALL' && (
              <TouchableOpacity
                style={styles.filterPill}
                onPress={() => setFilters((p) => ({ ...p, status: 'ALL' }))}
                activeOpacity={0.7}
              >
                <Text style={styles.filterPillText}>
                  Status: {filters.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </Text>
                <IconX size={12} color="#475569" />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.clearAllPill} onPress={handleResetFilters}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Stores List */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading assigned territory stores...</Text>
        </View>
      ) : filteredShops.length === 0 ? (
        <View style={styles.centerBox}>
          <View style={styles.emptyIconWrap}>
            <IconBuildingStore size={36} color={theme.colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>No matching retail stores</Text>
          <Text style={styles.emptySub}>
            {activeCount > 0
              ? 'Try relaxing your filter criteria or adjusting keywords.'
              : 'Try adjusting your search keywords.'}
          </Text>
        </View>
      ) : (
        filteredShops.map((shop) => (
          <ShopCard
            key={shop.id}
            shop={shop}
            onSelect={handleSelectShop}
            onCheckIn={handleCheckIn}
          />
        ))
      )}

      {/* Dedicated Two-Column Filter Panel */}
      <TwoColumnFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={handleResetFilters}
        categories={SHOPS_FILTER_CATEGORIES}
        title="Filter Retail Stores"
        subtitle={`${filteredShops.length} stores matching beat`}
        mode="shops"
        zones={zones}
        markets={markets}
        shops={shops}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  searchInputWrap: {
    flex: 1
  },
  searchBar: {
    marginBottom: 0
  },
  filterTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.navyPrimary,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 7,
    shadowColor: theme.colors.navyPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2.5
  },
  filterTriggerBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.accent,
    borderWidth: 1.5
  },
  filterTriggerText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700'
  },
  recordCountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 8
  },
  recordCountText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#475569'
  },
  clearAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary
  },
  activePillsWrap: {
    marginBottom: 10
  },
  activePillsScroll: {
    flexGrow: 0
  },
  activePillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 2
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1.5
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B'
  },
  clearAllPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626'
  },
  centerBox: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg
  },
  loadingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 8
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.accentSurface,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain
  },
  emptySub: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4
  }
});
