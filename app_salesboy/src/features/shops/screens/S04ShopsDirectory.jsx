import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
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

  const shops = data?.data || [];

  const filteredShops = useMemo(() => {
    if (!search.trim()) return shops;
    const q = search.toLowerCase();
    return shops.filter((s) => {
      const name = (s.shop_name || '').toLowerCase();
      const person = (s.contact_person || '').toLowerCase();
      const phone = (s.phone || '').toLowerCase();
      const addr = (s.shop_address || '').toLowerCase();
      return name.includes(q) || person.includes(q) || phone.includes(q) || addr.includes(q);
    });
  }, [shops, search]);

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
    marginBottom: theme.spacing.sm
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
