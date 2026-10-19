import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import Screen from '@shared/layout/Screen';
import AppBar from '@shared/layout/AppBar';
import Card from '@shared/ui/Card';
import StatusChip from '@shared/ui/Badge/StatusChip';
import TwoColumnFilterModal from '@shared/ui/TwoColumnFilterModal';
import { useGetVisitsQuery } from '../api';
import { useGetShopsQuery } from '@features/shops/api';
import { ROUTES } from '@navigation/routes';
import { theme } from '@theme';
import { IconClipboardList, IconMapPin, IconStar, IconFilter, IconX, IconChevronRight } from '@shared/icons';

export default function S09VisitsLedger({ navigation }) {
  const { data, isLoading, refetch, isFetching } = useGetVisitsQuery({}, {
    refetchOnMountOrArgChange: true
  });
  const { data: shopsData } = useGetShopsQuery({});
  const shops = shopsData?.data || [];
  const visits = data?.data || [];

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: 'ALL',
    conversion: 'ALL',
    zoneId: null,
    marketId: null,
    shopId: null,
    dateRange: 'ALL'
  });

  // Extract unique zones & markets
  const zones = useMemo(() => {
    const map = new Map();
    shops.forEach((s) => {
      if (s.sales_zones?.id && !map.has(s.sales_zones.id)) {
        map.set(s.sales_zones.id, s.sales_zones);
      }
    });
    return Array.from(map.values());
  }, [shops]);

  const markets = useMemo(() => {
    const map = new Map();
    shops.forEach((s) => {
      if (s.sales_markets?.id && !map.has(s.sales_markets.id)) {
        map.set(s.sales_markets.id, s.sales_markets);
      }
    });
    return Array.from(map.values());
  }, [shops]);

  // Active filter count
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'ALL') count++;
    if (filters.conversion !== 'ALL') count++;
    if (filters.zoneId) count++;
    if (filters.marketId) count++;
    if (filters.shopId) count++;
    if (filters.dateRange !== 'ALL') count++;
    return count;
  }, [filters]);

  // Filtered visits computation
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      // 1. Status Filter
      if (filters.status === 'OPEN' && !v.is_available) return false;
      if (filters.status === 'CLOSED' && v.is_available) return false;

      // 2. Conversion Filter
      const boughtBooks = (v.sales_visit_books || []).filter((b) => b.action_type === 'bought');
      const shownBooks = (v.sales_visit_books || []).filter((b) => b.action_type === 'shown');

      if (filters.conversion === 'BOUGHT' && boughtBooks.length === 0) return false;
      if (filters.conversion === 'SHOWN' && shownBooks.length === 0) return false;
      if (filters.conversion === 'NO_CONVERSION' && boughtBooks.length > 0) return false;

      // 3. Zone Filter
      if (filters.zoneId && v.sales_vendors?.zone_id !== filters.zoneId) return false;

      // 4. Market Filter
      if (filters.marketId && v.sales_vendors?.market_id !== filters.marketId) return false;

      // 5. Shop Filter
      if (filters.shopId && v.vendor_id !== filters.shopId) return false;

      // 6. Date Range Filter
      if (filters.dateRange !== 'ALL') {
        const visitDate = new Date(v.visited_at);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (filters.dateRange === 'TODAY') {
          if (visitDate < startOfToday) return false;
        } else if (filters.dateRange === 'YESTERDAY') {
          const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
          if (visitDate < startOfYesterday || visitDate >= startOfToday) return false;
        } else if (filters.dateRange === 'WEEK') {
          const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (visitDate < sevenDaysAgo) return false;
        } else if (filters.dateRange === 'MONTH') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (visitDate < startOfMonth) return false;
        }
      }

      return true;
    });
  }, [visits, filters]);

  // Labels for active filter chips
  const activeZoneName = zones.find((z) => z.id === filters.zoneId)?.name;
  const activeMarketName = markets.find((m) => m.id === filters.marketId)?.name;
  const activeShopName = shops.find((s) => s.id === filters.shopId)?.shop_name;

  return (
    <Screen
      variant="scroll"
      header={
        <AppBar
          title="Field Visits Ledger"
          subtitle={`${filteredVisits.length} of ${visits.length} recorded visits`}
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
      {/* Top Filter Control Bar */}
      <View style={styles.filterControlBar}>
        <View style={styles.recordCountBox}>
          <Text style={styles.recordCountText}>
            Showing <Text style={{ fontWeight: '800', color: theme.colors.navyPrimary }}>{filteredVisits.length}</Text> records
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.filterTriggerBtn, activeCount > 0 && styles.filterTriggerBtnActive]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.85}
        >
          <IconFilter size={15} color="#FFFFFF" />
          <Text style={styles.filterTriggerText}>
            {activeCount > 0 ? `Filters (${activeCount})` : 'Filters'}
          </Text>
        </TouchableOpacity>
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
            {filters.status !== 'ALL' && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>Status: {filters.status}</Text>
                <TouchableOpacity onPress={() => setFilters((p) => ({ ...p, status: 'ALL' }))}>
                  <IconX size={12} color="#475569" />
                </TouchableOpacity>
              </View>
            )}

            {filters.conversion !== 'ALL' && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>Sales: {filters.conversion}</Text>
                <TouchableOpacity onPress={() => setFilters((p) => ({ ...p, conversion: 'ALL' }))}>
                  <IconX size={12} color="#475569" />
                </TouchableOpacity>
              </View>
            )}

            {activeZoneName && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>Zone: {activeZoneName}</Text>
                <TouchableOpacity onPress={() => setFilters((p) => ({ ...p, zoneId: null }))}>
                  <IconX size={12} color="#475569" />
                </TouchableOpacity>
              </View>
            )}

            {activeMarketName && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>Market: {activeMarketName}</Text>
                <TouchableOpacity onPress={() => setFilters((p) => ({ ...p, marketId: null }))}>
                  <IconX size={12} color="#475569" />
                </TouchableOpacity>
              </View>
            )}

            {activeShopName && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>Store: {activeShopName}</Text>
                <TouchableOpacity onPress={() => setFilters((p) => ({ ...p, shopId: null }))}>
                  <IconX size={12} color="#475569" />
                </TouchableOpacity>
              </View>
            )}

            {filters.dateRange !== 'ALL' && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>Date: {filters.dateRange}</Text>
                <TouchableOpacity onPress={() => setFilters((p) => ({ ...p, dateRange: 'ALL' }))}>
                  <IconX size={12} color="#475569" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.clearAllPill}
              onPress={() =>
                setFilters({
                  status: 'ALL',
                  conversion: 'ALL',
                  zoneId: null,
                  marketId: null,
                  shopId: null,
                  dateRange: 'ALL'
                })
              }
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Fetching visits ledger...</Text>
        </View>
      ) : filteredVisits.length === 0 ? (
        <View style={styles.centerBox}>
          <View style={styles.emptyIconWrap}>
            <IconClipboardList size={36} color={theme.colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>No matching visits found</Text>
          <Text style={styles.emptySub}>
            {activeCount > 0 ? 'Try clearing or relaxing some of your filter criteria.' : 'Your submitted field visits will appear here.'}
          </Text>
        </View>
      ) : (
        filteredVisits.map((v) => {
          const shownBooks = (v.sales_visit_books || []).filter((b) => b.action_type === 'shown');
          const boughtBooks = (v.sales_visit_books || []).filter((b) => b.action_type === 'bought');
          const vendorId = v.vendor_id || v.sales_vendors?.id;

          return (
            <TouchableOpacity
              key={v.id}
              activeOpacity={0.8}
              onPress={() => {
                if (vendorId) {
                  navigation.navigate(ROUTES.SHOP_DETAIL, { vendorId });
                }
              }}
              style={styles.visitCardTouch}
            >
              <Card style={styles.visitCard}>
                <View style={styles.topRow}>
                  <View style={styles.shopTitleRow}>
                    <Text style={styles.shopName} numberOfLines={1}>
                      {v.sales_vendors?.shop_name || 'Retail Store'}
                    </Text>
                    <IconChevronRight size={16} color={theme.colors.textMuted} />
                  </View>
                  <StatusChip isAvailable={v.is_available} />
                </View>

                <View style={styles.metaRow}>
                  <IconMapPin size={13} color={theme.colors.textMuted} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {v.sales_vendors?.shop_address || 'Address not recorded'}
                  </Text>
                </View>

                {/* Zone and Market Badges */}
                {(v.sales_vendors?.sales_markets?.name || v.sales_vendors?.sales_zones?.name) && (
                  <View style={styles.ledgerBadgeRow}>
                    {v.sales_vendors?.sales_markets?.name && (
                      <View style={styles.marketBadge}>
                        <Text style={styles.marketBadgeText}>📍 {v.sales_vendors.sales_markets.name}</Text>
                      </View>
                    )}
                    {v.sales_vendors?.sales_zones?.name && (
                      <View style={styles.zoneBadge}>
                        <Text style={styles.zoneBadgeText}>{v.sales_vendors.sales_zones.name}</Text>
                      </View>
                    )}
                  </View>
                )}

                {v.comments && (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText}>"{v.comments}"</Text>
                  </View>
                )}

                {/* Books chips */}
                <View style={styles.booksWrap}>
                  {boughtBooks.map((b, idx) => (
                    <View key={`${b.book_id || 'bought'}-${idx}`} style={styles.boughtChip}>
                      <IconStar size={11} color={theme.colors.success} />
                      <Text style={styles.boughtText}>{b.books?.name || 'Book Ordered'}</Text>
                    </View>
                  ))}
                  {shownBooks.map((b, idx) => (
                    <View key={`${b.book_id || 'shown'}-${idx}`} style={styles.shownChip}>
                      <Text style={styles.shownDot}>•</Text>
                      <Text style={styles.shownText}>{b.books?.name || 'Pitched'}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.timeText}>
                    {new Date(v.visited_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}{' '}
                    •{' '}
                    {new Date(v.visited_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })
      )}

      {/* Fameu Two-Column Filter Modal */}
      <TwoColumnFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={() =>
          setFilters({
            status: 'ALL',
            conversion: 'ALL',
            zoneId: null,
            marketId: null,
            shopId: null,
            dateRange: 'ALL'
          })
        }
        zones={zones}
        markets={markets}
        shops={shops}
        visits={visits}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  },
  visitCardTouch: {
    marginBottom: theme.spacing.sm
  },
  visitCard: {
    padding: theme.spacing.md
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  shopTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8
  },
  shopName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  metaText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    flex: 1
  },
  commentBox: {
    backgroundColor: theme.colors.inputBg,
    padding: 8,
    borderRadius: theme.spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: 8
  },
  commentText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMain,
    fontStyle: 'italic'
  },
  booksWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 8
  },
  boughtChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.successSurface,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.spacing.borderRadius.sm
  },
  boughtText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success
  },
  shownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.spacing.borderRadius.sm
  },
  shownDot: {
    color: theme.colors.accent,
    fontSize: 12,
    lineHeight: 12
  },
  shownText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMain,
    fontWeight: theme.typography.fontWeight.medium
  },
  bottomRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 8,
    marginTop: 2
  },
  timeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textDim
  },
  filterControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 4
  },
  recordCountBox: {
    flex: 1
  },
  recordCountText: {
    fontSize: 12,
    color: theme.colors.textMuted
  },
  filterTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  },
  filterTriggerBtnActive: {
    backgroundColor: theme.colors.primaryDark
  },
  filterTriggerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3
  },
  activePillsWrap: {
    flexGrow: 0,
    marginBottom: 8
  },
  activePillsScroll: {
    flexGrow: 0
  },
  activePillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMain
  },
  clearAllPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)'
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.danger
  },
  ledgerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  marketBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4
  },
  marketBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.callGreenLight || '#059669'
  },
  zoneBadge: {
    backgroundColor: 'rgba(29, 78, 216, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4
  },
  zoneBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary
  }
});
