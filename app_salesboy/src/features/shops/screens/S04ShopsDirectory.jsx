import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '@shared/layout/Screen';
import AppBar from '@shared/layout/AppBar';
import Input from '@shared/ui/Input';
import ShopCard from '../components/ShopCard';
import { useGetShopsQuery } from '../api';
import { ROUTES } from '@navigation/routes';
import { theme } from '@theme';
import { IconSearch, IconBuildingStore } from '@shared/icons';

export default function S04ShopsDirectory({ navigation }) {
  const { data, isLoading, refetch, isFetching } = useGetShopsQuery({}, {
    refetchOnMountOrArgChange: true
  });
  const [search, setSearch] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('ALL');
  const [selectedMarketId, setSelectedMarketId] = useState('ALL');

  const shops = data?.data || [];

  const availableZones = useMemo(() => {
    const map = new Map();
    shops.forEach((s) => {
      if (s.sales_zones?.id && s.sales_zones?.name) {
        map.set(s.sales_zones.id, s.sales_zones.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [shops]);

  const availableMarkets = useMemo(() => {
    const map = new Map();
    shops.forEach((s) => {
      if (selectedZoneId !== 'ALL' && s.zone_id !== selectedZoneId) return;
      if (s.sales_markets?.id && s.sales_markets?.name) {
        map.set(s.sales_markets.id, s.sales_markets.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [shops, selectedZoneId]);

  const handleSelectZone = (zoneId) => {
    setSelectedZoneId(zoneId);
    setSelectedMarketId('ALL');
  };

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      if (selectedZoneId !== 'ALL' && s.zone_id !== selectedZoneId) return false;
      if (selectedMarketId !== 'ALL' && s.market_id !== selectedMarketId) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const name = (s.shop_name || '').toLowerCase();
      const person = (s.contact_person || '').toLowerCase();
      const phone = (s.phone || '').toLowerCase();
      const addr = (s.shop_address || '').toLowerCase();
      const market = (s.sales_markets?.name || '').toLowerCase();
      const zone = (s.sales_zones?.name || '').toLowerCase();
      return name.includes(q) || person.includes(q) || phone.includes(q) || addr.includes(q) || market.includes(q) || zone.includes(q);
    });
  }, [shops, search, selectedZoneId, selectedMarketId]);

  const handleSelectShop = (shop) => {
    navigation.navigate(ROUTES.SHOP_DETAIL, { vendorId: shop.id });
  };

  const handleCheckIn = (shop) => {
    navigation.navigate(ROUTES.RECORD_VISIT, { vendorId: shop.id, prefilledShop: shop });
  };

  return (
    <Screen
      variant="scroll"
      header={
        <AppBar
          title="Retail Stores"
          subtitle={`${shops.length} assigned stores in your beat`}
          showMenu={true}
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={isLoading || isFetching}
          onRefresh={refetch}
          colors={[theme.colors.primary]}
        />
      }
    >
      <Input
        prefix={<IconSearch size={18} color={theme.colors.textMuted} />}
        placeholder="Search shop name, owner, phone..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

      {/* Zone Selector Chips (shown when assigned to multiple zones) */}
      {availableZones.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.zoneChipsScroll}
        >
          <TouchableOpacity
            style={[
              styles.zoneChip,
              selectedZoneId === 'ALL' && styles.zoneChipActive
            ]}
            onPress={() => handleSelectZone('ALL')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.zoneChipText,
                selectedZoneId === 'ALL' && styles.zoneChipTextActive
              ]}
            >
              📍 All Zones ({shops.length})
            </Text>
          </TouchableOpacity>
          {availableZones.map((z) => {
            const count = shops.filter((s) => s.zone_id === z.id).length;
            const isSelected = selectedZoneId === z.id;
            return (
              <TouchableOpacity
                key={z.id}
                style={[
                  styles.zoneChip,
                  isSelected && styles.zoneChipActive
                ]}
                onPress={() => handleSelectZone(isSelected ? 'ALL' : z.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.zoneChipText,
                    isSelected && styles.zoneChipTextActive
                  ]}
                >
                  📍 {z.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {availableMarkets.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.marketChipsScroll}
        >
          <TouchableOpacity
            style={[
              styles.marketChip,
              selectedMarketId === 'ALL' && styles.marketChipActive
            ]}
            onPress={() => setSelectedMarketId('ALL')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.marketChipText,
                selectedMarketId === 'ALL' && styles.marketChipTextActive
              ]}
            >
              All Markets ({selectedZoneId === 'ALL' ? shops.length : shops.filter((s) => s.zone_id === selectedZoneId).length})
            </Text>
          </TouchableOpacity>
          {availableMarkets.map((m) => {
            const count = shops.filter((s) => {
              if (selectedZoneId !== 'ALL' && s.zone_id !== selectedZoneId) return false;
              return s.market_id === m.id;
            }).length;
            const isSelected = selectedMarketId === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.marketChip,
                  isSelected && styles.marketChipActive
                ]}
                onPress={() => setSelectedMarketId(isSelected ? 'ALL' : m.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.marketChipText,
                    isSelected && styles.marketChipTextActive
                  ]}
                >
                  {m.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

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
          <Text style={styles.emptySub}>Try adjusting your search keywords.</Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: theme.spacing.xs
  },
  zoneChipsScroll: {
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  zoneChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(29, 78, 216, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(29, 78, 216, 0.18)',
    marginRight: 8
  },
  zoneChipActive: {
    backgroundColor: theme.colors.navyPrimary,
    borderColor: theme.colors.navyPrimary
  },
  zoneChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary
  },
  zoneChipTextActive: {
    color: '#FFFFFF'
  },
  marketChipsScroll: {
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center'
  },
  marketChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8
  },
  marketChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  marketChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted
  },
  marketChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
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
