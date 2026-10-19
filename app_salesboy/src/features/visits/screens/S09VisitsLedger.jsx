import React from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import Screen from '@shared/layout/Screen';
import AppBar from '@shared/layout/AppBar';
import Card from '@shared/ui/Card';
import StatusChip from '@shared/ui/Badge/StatusChip';
import { useGetVisitsQuery } from '../api';
import { theme } from '@theme';
import { IconClipboardList, IconMapPin, IconStar } from '@shared/icons';

export default function S09VisitsLedger({ navigation }) {
  const { data, isLoading, refetch, isFetching } = useGetVisitsQuery({}, {
    refetchOnMountOrArgChange: true
  });
  const visits = data?.data || [];

  return (
    <Screen
      variant="scroll"
      header={
        <AppBar
          title="Field Visits Ledger"
          subtitle={`${visits.length} recorded field visits`}
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
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Fetching visits ledger...</Text>
        </View>
      ) : visits.length === 0 ? (
        <View style={styles.centerBox}>
          <View style={styles.emptyIconWrap}>
            <IconClipboardList size={36} color={theme.colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>No visits logged yet</Text>
          <Text style={styles.emptySub}>Your submitted field visits will appear here.</Text>
        </View>
      ) : (
        visits.map((v) => {
          const shownBooks = (v.sales_visit_books || []).filter((b) => b.action_type === 'shown');
          const boughtBooks = (v.sales_visit_books || []).filter((b) => b.action_type === 'bought');

          return (
            <Card key={v.id} style={styles.visitCard}>
              <View style={styles.topRow}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {v.sales_vendors?.shop_name || 'Retail Store'}
                </Text>
                <StatusChip isAvailable={v.is_available} />
              </View>

              <View style={styles.metaRow}>
                <IconMapPin size={13} color={theme.colors.textMuted} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {v.sales_vendors?.shop_address || 'Address not recorded'}
                </Text>
              </View>

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
          );
        })
      )}
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
  visitCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  shopName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain,
    flex: 1,
    marginRight: 8
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
  }
});
