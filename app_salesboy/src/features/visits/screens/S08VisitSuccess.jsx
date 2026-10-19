import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '@shared/layout/Screen';
import Card from '@shared/ui/Card';
import Button from '@shared/ui/Button';
import { ROUTES } from '@navigation/routes';
import { theme } from '@theme';
import { IconCheck, IconBuildingStore } from '@shared/icons';

export default function S08VisitSuccess({ route, navigation }) {
  const {
    shopName = 'Retail Store',
    isAvailable = true,
    booksShownCount = 0,
    booksBoughtCount = 0,
    isOffline = false
  } = route.params || {};

  return (
    <Screen
      variant="scroll"
      footer={
        <View style={styles.footerRow}>
          <Button
            title="Next Store"
            variant="outline"
            onPress={() => navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.SHOPS })}
            style={styles.halfBtn}
          />
          <Button
            title="Dashboard"
            variant="primary"
            onPress={() => navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.DASHBOARD })}
            style={styles.halfBtn}
          />
        </View>
      }
    >
      <View style={styles.centerContainer}>
        <View style={styles.iconCircle}>
          <IconCheck size={36} color="#ffffff" />
        </View>
        <Text style={styles.heading}>Visit Recorded Successfully</Text>
        <Text style={styles.subheading}>
          {isOffline
            ? 'Visit stored in your local offline queue. Will sync automatically once back online.'
            : 'Audit report synchronized live with Stenna Head Office.'}
        </Text>

        <Card variant="dark" style={styles.receiptCard}>
          <Text style={styles.receiptHeader}>VISIT AUDIT RECEIPT</Text>

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Store Name</Text>
            <Text style={styles.rowValue}>{shopName}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Availability</Text>
            <Text style={[styles.rowValue, { color: isAvailable ? theme.colors.call : theme.colors.danger }]}>
              {isAvailable ? 'Store Open & Available' : 'Closed / Unavailable'}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Catalog Pitches</Text>
            <Text style={styles.rowValue}>{booksShownCount} catalog books</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Books Converted</Text>
            <Text style={[styles.rowValue, { fontWeight: '700', color: theme.colors.accent }]}>
              {booksBoughtCount} books ordered
            </Text>
          </View>

          <View style={[styles.receiptRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Server Sync</Text>
            <Text style={[styles.rowValue, { color: isOffline ? theme.colors.warning : theme.colors.call }]}>
              {isOffline ? 'Queued Offline' : 'Live Synchronized'}
            </Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.call,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.elevation.glowGreen
  },
  heading: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMain,
    textAlign: 'center'
  },
  subheading: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: theme.spacing.md
  },
  receiptCard: {
    width: '100%',
    marginTop: theme.spacing.xl
  },
  receiptHeader: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.heavy,
    color: theme.colors.gold,
    letterSpacing: 1,
    marginBottom: 12
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  rowLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: '#94A3B8'
  },
  rowValue: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF'
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10
  },
  halfBtn: {
    flex: 1
  }
});
