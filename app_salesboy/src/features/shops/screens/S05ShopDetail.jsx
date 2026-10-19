import React from 'react';
import { View, Text, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import Screen from '@shared/layout/Screen';
import AppBar from '@shared/layout/AppBar';
import Card from '@shared/ui/Card';
import Button from '@shared/ui/Button';
import StatusChip from '@shared/ui/Badge/StatusChip';
import { useGetShopHistoryQuery } from '../api';
import { ROUTES } from '@navigation/routes';
import { theme } from '@theme';
import { IconUser, IconPhone, IconPhoneCall, IconMapPin, IconStar, IconBook } from '@shared/icons';

export default function S05ShopDetail({ route, navigation }) {
  const { vendorId } = route.params;
  const { data, isLoading } = useGetShopHistoryQuery(vendorId, {
    refetchOnMountOrArgChange: true
  });

  const resData = data?.data || data || {};
  const shop = resData.vendor || {};
  const visits = resData.visits || [];
  const bookHistory = resData.bookHistory || {};
  const allShown = bookHistory.allShownBooks || [];
  const allBought = bookHistory.allBoughtBooks || [];

  const handleStartVisit = () => {
    navigation.navigate(ROUTES.RECORD_VISIT, { vendorId: shop.id, prefilledShop: shop });
  };

  if (isLoading) {
    return (
      <Screen variant="static">
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Fetching 360° store history...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      variant="scroll"
      header={<AppBar title={shop.shop_name || 'Store Detail'} onBack={() => navigation.goBack()} />}
      footer={<Button title="Check-In & Start Visit" onPress={handleStartVisit} variant="primary" />}
    >
      {/* Store Header Card */}
      <Card variant="dark">
        <Text style={styles.storeName}>{shop.shop_name}</Text>
        
        <View style={styles.metaRow}>
          <IconUser size={15} color={theme.colors.accent} />
          <Text style={styles.metaText}>Owner: {shop.contact_person || 'N/A'}</Text>
        </View>

        <View style={styles.metaRow}>
          <IconPhone size={15} color={theme.colors.call} />
          <Text style={styles.metaText}>{shop.phone || 'No phone recorded'}</Text>
        </View>

        <View style={styles.metaRow}>
          <IconMapPin size={15} color={theme.colors.textMuted} />
          <Text style={styles.metaText}>{shop.shop_address || 'Address unrecorded'}</Text>
        </View>

        {shop.sales_zones?.name ? (
          <View style={styles.metaRow}>
            <IconMapPin size={15} color={theme.colors.primary} />
            <Text style={styles.metaText}>Zone: {shop.sales_zones.name}</Text>
          </View>
        ) : null}

        {shop.phone ? (
          <Button
            title={`Call ${shop.contact_person || 'Shopkeeper'}`}
            variant="call"
            icon={<IconPhoneCall size={18} color={theme.colors.callText} />}
            onPress={() => Linking.openURL(`tel:${shop.phone}`)}
            style={styles.callActionBtn}
          />
        ) : null}
      </Card>

      {/* Catalog Books Conversion Card */}
      <Card>
        <View style={styles.cardHeaderRow}>
          <IconBook size={18} color={theme.colors.accent} />
          <Text style={styles.cardHeader}>WALLPAPER CATALOG AUDIT</Text>
        </View>

        <Text style={styles.catalogSub}>Active in Store (Bought):</Text>
        {allBought.length === 0 ? (
          <Text style={styles.noBooksText}>No books converted yet</Text>
        ) : (
          <View style={styles.chipRow}>
            {allBought.map((b, idx) => (
              <View key={`${b.id || b.book_id || 'bought'}-${idx}`} style={styles.boughtChip}>
                <IconStar size={12} color={theme.colors.success} />
                <Text style={styles.boughtText}>{b.name || b.code || b.books?.name || 'Catalog Book'}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.catalogSub, { marginTop: 14 }]}>Books Pitched in Past:</Text>
        {allShown.length === 0 ? (
          <Text style={styles.noBooksText}>No catalog pitches logged yet</Text>
        ) : (
          <View style={styles.chipRow}>
            {allShown.map((b, idx) => (
              <View key={`${b.id || b.book_id || 'shown'}-${idx}`} style={styles.shownChip}>
                <Text style={styles.shownDot}>•</Text>
                <Text style={styles.shownText}>{b.name || b.code || b.books?.name || 'Catalog Book'}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Past Visits Timeline */}
      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>PAST FIELD VISITS TIMELINE</Text>
        {visits.length === 0 ? (
          <Card>
            <Text style={styles.noBooksText}>No past visits on record for this store.</Text>
          </Card>
        ) : (
          visits.map((v) => (
            <Card key={v.id} style={styles.timelineItem}>
              <View style={styles.timelineTop}>
                <Text style={styles.visitDate}>
                  {new Date(v.visited_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
                <StatusChip isAvailable={v.is_available} />
              </View>
              <Text style={styles.repText}>Visited by: {v.sales_boys?.name || 'Sales Rep'}</Text>
              {v.comments && <Text style={styles.commentText}>"{v.comments}"</Text>}
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 8
  },
  storeName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: 10
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  metaText: {
    fontSize: theme.typography.fontSize.xs,
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 18
  },
  callActionBtn: {
    marginTop: 12
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  cardHeader: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.heavy,
    color: theme.colors.primary,
    letterSpacing: 1
  },
  catalogSub: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textMain,
    marginBottom: 6
  },
  noBooksText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textDim,
    fontStyle: 'italic'
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  boughtChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.successSurface,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    gap: 4,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadius.sm
  },
  shownDot: {
    color: theme.colors.accent,
    fontSize: 14,
    lineHeight: 14
  },
  shownText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMain,
    fontWeight: theme.typography.fontWeight.medium
  },
  timelineSection: {
    marginTop: 8
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.heavy,
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 2
  },
  timelineItem: {
    marginBottom: theme.spacing.sm
  },
  timelineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  visitDate: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain
  },
  repText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textDim
  },
  commentText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4
  }
});
