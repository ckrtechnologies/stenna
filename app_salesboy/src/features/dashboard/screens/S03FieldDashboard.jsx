import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import Screen from '@shared/layout/Screen';
import AppBar from '@shared/layout/AppBar';
import Card from '@shared/ui/Card';
import Button from '@shared/ui/Button';
import StatusChip from '@shared/ui/Badge/StatusChip';
import {
  IconBuildingStore,
  IconChevronRight,
  IconPlus,
  IconClipboardList,
  IconStar
} from '@shared/icons';
import { useGetAppDashboardQuery } from '../api';
import { ROUTES } from '@navigation/routes';
import { theme } from '@theme';

export default function S03FieldDashboard({ navigation }) {
  const user = useSelector((state) => state.auth?.user);
  const { data, isLoading, refetch, isFetching } = useGetAppDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const analytics = data?.data?.todayAnalytics || {
    totalVisits: 0,
    availableShops: 0,
    closedShops: 0,
    booksPitched: 0,
    booksBought: 0,
    uniqueShopsVisited: 0,
    beatCoveragePercent: 0
  };

  const recentVisits = data?.data?.recentVisits || [];
  const assignedCount = data?.data?.assignedShopsCount || 0;
  const assignedZones = data?.data?.assignedZones || [];
  const assignedMarkets = data?.data?.assignedMarkets || [];
  const primaryZone = assignedZones.length > 0 ? assignedZones[0] : null;

  const todayDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const coveragePercent = analytics.beatCoveragePercent !== undefined
    ? analytics.beatCoveragePercent
    : assignedCount > 0
      ? Math.min(100, Math.round(((analytics.uniqueShopsVisited || (analytics.totalVisits > 0 ? 1 : 0)) / assignedCount) * 100))
      : 0;

  return (
    <Screen
      variant="scroll"
      header={<AppBar showLogo={true} showMenu={true} />}
      refreshControl={
        <RefreshControl
          refreshing={isLoading || isFetching}
          onRefresh={refetch}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Rep Greeting Banner */}
      <View style={styles.greetingBar}>
        <View>
          <Text style={styles.repGreeting}>Welcome back,</Text>
          <Text style={styles.repName}>{user?.name || 'Sales Representative'}</Text>
        </View>
        <View style={styles.territoryBadge}>
          <Text style={styles.territoryText}>
            📍 {primaryZone?.name ? primaryZone.name.toUpperCase() : 'ALL ZONES'}
          </Text>
        </View>
      </View>

      {/* Primary Executive Dark KPI Card */}
      <Card variant="dark" style={styles.kpiCard}>
        <View style={styles.kpiHeader}>
          <Text style={styles.kpiTitle}>TODAY'S FIELD BEAT</Text>
          <Text style={styles.kpiDate}>{todayDate}</Text>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{analytics.totalVisits}</Text>
            <Text style={styles.statLabel}>Total Visits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.callGreenLight }]}>
              {analytics.availableShops}
            </Text>
            <Text style={styles.statLabel}>Open Shops</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.gold }]}>
              {analytics.booksPitched}
            </Text>
            <Text style={styles.statLabel}>Pitched</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#60A5FA' }]}>
              {analytics.booksBought}
            </Text>
            <Text style={styles.statLabel}>Converted</Text>
          </View>
        </View>

        {/* Territory Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressTitle}>Beat Coverage Progress</Text>
            <Text style={styles.progressPercent}>{coveragePercent}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, coveragePercent))}%` }]} />
          </View>
        </View>
      </Card>

      {/* Hot Point Action CTA: Log Visit */}
      <Button
        title="+ Log New Field Visit"
        variant="primary"
        icon={<IconPlus size={20} color="#FFFFFF" strokeWidth={2.5} />}
        onPress={() => navigation.navigate(ROUTES.RECORD_VISIT)}
        style={styles.mainCtaBtn}
      />

      {/* Assigned Territory & Retail Stores Link Card (Zone > Markets > Shops) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate(ROUTES.SHOPS)}
      >
        <Card style={styles.territoryCard}>
          <View style={styles.territoryHeaderRow}>
            <View style={styles.territoryHeaderLeft}>
              <View style={styles.iconCircle}>
                <IconBuildingStore size={22} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.territorySectionTitle}>Assigned Territory Beat</Text>
                <Text style={styles.territorySectionSub}>
                  {primaryZone?.name || 'All Territory'} • {assignedMarkets.length} Markets • {assignedCount} Shops
                </Text>
              </View>
            </View>
            <IconChevronRight size={20} color={theme.colors.textDim} />
          </View>

          {/* 3-Tier Badges Row */}
          <View style={styles.tierChipsRow}>
            <View style={styles.tierChip}>
              <Text style={styles.tierChipLabel}>ZONE</Text>
              <Text style={styles.tierChipValue} numberOfLines={1}>{primaryZone?.name || 'North Zone'}</Text>
            </View>
            <View style={styles.tierChipDivider} />
            <View style={styles.tierChip}>
              <Text style={styles.tierChipLabel}>MARKETS</Text>
              <Text style={styles.tierChipValue} numberOfLines={1}>
                {assignedMarkets.length > 0
                  ? `${assignedMarkets.length} Markets (${assignedMarkets.map((m) => m.name).slice(0, 2).join(', ')}${assignedMarkets.length > 2 ? '...' : ''})`
                  : 'All Markets'}
              </Text>
            </View>
            <View style={styles.tierChipDivider} />
            <View style={styles.tierChip}>
              <Text style={styles.tierChipLabel}>SHOPS</Text>
              <Text style={styles.tierChipValue}>{assignedCount} Stores</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Recent Visits Feed */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Recent Visits Today</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.VISITS_LEDGER)}>
          <Text style={styles.viewAllLink}>View Ledger →</Text>
        </TouchableOpacity>
      </View>

      {recentVisits.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <IconClipboardList size={32} color={theme.colors.textDim} />
          </View>
          <Text style={styles.emptyTitle}>No visits logged yet today</Text>
          <Text style={styles.emptySub}>
            Tap "+ Log New Field Visit" above to check in to your first retail store.
          </Text>
        </Card>
      ) : (
        recentVisits.map((v) => (
          <Card key={v.id} style={styles.visitCard}>
            <View style={styles.visitHeader}>
              <Text style={styles.visitShopName} numberOfLines={1}>
                {v.sales_vendors?.shop_name || 'Retail Store'}
              </Text>
              <StatusChip isAvailable={v.is_available} />
            </View>
            {v.comments && (
              <Text style={styles.visitComment} numberOfLines={2}>
                "{v.comments}"
              </Text>
            )}
            <Text style={styles.visitTime}>
              {new Date(v.visited_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 4
  },
  repGreeting: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600'
  },
  repName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.navyPrimary,
    letterSpacing: -0.3
  },
  territoryBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(29, 78, 216, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(29, 78, 216, 0.18)'
  },
  territoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.primary
  },
  kpiCard: {
    padding: 18,
    marginBottom: 16
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
    marginBottom: 16
  },
  kpiTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: theme.colors.gold
  },
  kpiDate: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600'
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600'
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 14
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0'
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.gold
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 9999,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.gold,
    borderRadius: 9999
  },
  mainCtaBtn: {
    marginBottom: 14
  },
  territoryCard: {
    padding: 14,
    marginBottom: 18
  },
  territoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  territoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(29, 78, 216, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(29, 78, 216, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  territorySectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMain
  },
  territorySectionSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  tierChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight
  },
  tierChip: {
    flex: 1
  },
  tierChipLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.8,
    marginBottom: 2
  },
  tierChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMain
  },
  tierChipDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
    marginHorizontal: 8
  },
  navLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 18
  },
  navLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  navLinkTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMain
  },
  navLinkSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textMain
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMain
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18
  },
  visitCard: {
    padding: 14,
    marginBottom: 10
  },
  visitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  visitShopName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMain,
    flex: 1,
    marginRight: 8
  },
  visitComment: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 17,
    marginBottom: 6
  },
  visitTime: {
    fontSize: 11,
    color: theme.colors.textDim,
    fontWeight: '600'
  }
});
