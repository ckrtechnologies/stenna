import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import Screen from '@shared/layout/Screen';
import AppBar from '@shared/layout/AppBar';
import Card from '@shared/ui/Card';
import Button from '@shared/ui/Button';
import StatusChip from '@shared/ui/Badge/StatusChip';
import { useGetShopHistoryQuery } from '../api';
import { ROUTES } from '@navigation/routes';
import { theme } from '@theme';
import {
  IconUser,
  IconPhone,
  IconPhoneCall,
  IconMapPin,
  IconStar,
  IconBook,
  IconBuildingStore,
  IconClipboardList,
  IconCheck
} from '@shared/icons';

const TABS = {
  OVERVIEW: 'overview',
  CATALOG: 'catalog',
  HISTORY: 'history'
};

export default function S05ShopDetail({ route, navigation }) {
  const { vendorId } = route.params;
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);

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

  const handleCall = () => {
    if (shop.phone) {
      Linking.openURL(`tel:${shop.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (shop.phone) {
      const cleanPhone = shop.phone.replace(/[^0-9]/g, '');
      Linking.openURL(`https://wa.me/91${cleanPhone}`);
    }
  };

  const handleOpenMap = () => {
    if (shop.shop_address) {
      const query = encodeURIComponent(`${shop.shop_name}, ${shop.shop_address}`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
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

  const openVisitsCount = visits.filter((v) => v.is_available).length;
  const closedVisitsCount = visits.length - openVisitsCount;
  const conversionRate = visits.length > 0 ? Math.round((allBought.length / Math.max(1, allShown.length + allBought.length)) * 100) : 0;
  const lastVisit = visits.length > 0 ? visits[0] : null;

  return (
    <Screen
      variant="scroll"
      header={<AppBar title={shop.shop_name || 'Store Detail'} onBack={() => navigation.goBack()} />}
      footer={<Button title="+ Check-In & Start Visit" onPress={handleStartVisit} variant="primary" />}
    >
      {/* 360° Header Summary Card */}
      <Card variant="dark" style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.storeName}>{shop.shop_name}</Text>
            <View style={styles.tagRow}>
              {shop.sales_zones?.name && (
                <View style={styles.zoneTag}>
                  <Text style={styles.zoneTagText}>📍 {shop.sales_zones.name.toUpperCase()}</Text>
                </View>
              )}
              {shop.sales_markets?.name && (
                <View style={styles.marketTag}>
                  <Text style={styles.marketTagText}>{shop.sales_markets.name}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, shop.is_active !== false ? styles.statusActive : styles.statusInactive]}>
            <Text style={styles.statusBadgeText}>{shop.is_active !== false ? 'ACTIVE' : 'INACTIVE'}</Text>
          </View>
        </View>

        {/* Contact Info Row */}
        <View style={styles.metaRow}>
          <IconUser size={14} color={theme.colors.accent} />
          <Text style={styles.metaText}>{shop.contact_person || 'Owner not specified'}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <IconPhone size={14} color={theme.colors.call} />
          <Text style={styles.metaText}>{shop.phone || 'No phone'}</Text>
        </View>

        {shop.shop_address ? (
          <View style={[styles.metaRow, { marginTop: 4 }]}>
            <IconMapPin size={14} color="#94A3B8" />
            <Text style={styles.metaAddress} numberOfLines={2}>{shop.shop_address}</Text>
          </View>
        ) : null}

        {/* Quick Contact Action Bar */}
        <View style={styles.heroActionsRow}>
          {shop.phone && (
            <TouchableOpacity style={styles.actionBtnCall} activeOpacity={0.8} onPress={handleCall}>
              <IconPhoneCall size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Call Owner</Text>
            </TouchableOpacity>
          )}

          {shop.phone && (
            <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.8} onPress={handleWhatsApp}>
              <Text style={styles.actionBtnSecondaryText}>WhatsApp</Text>
            </TouchableOpacity>
          )}

          {shop.shop_address && (
            <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.8} onPress={handleOpenMap}>
              <IconMapPin size={15} color="#E2E8F0" />
              <Text style={styles.actionBtnSecondaryText}>Directions</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* 360° Intuitive Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === TABS.OVERVIEW && styles.tabButtonActive]}
          onPress={() => setActiveTab(TABS.OVERVIEW)}
          activeOpacity={0.8}
        >
          <IconBuildingStore size={16} color={activeTab === TABS.OVERVIEW ? theme.colors.primary : theme.colors.textMuted} />
          <Text style={[styles.tabText, activeTab === TABS.OVERVIEW && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === TABS.CATALOG && styles.tabButtonActive]}
          onPress={() => setActiveTab(TABS.CATALOG)}
          activeOpacity={0.8}
        >
          <IconBook size={16} color={activeTab === TABS.CATALOG ? theme.colors.primary : theme.colors.textMuted} />
          <Text style={[styles.tabText, activeTab === TABS.CATALOG && styles.tabTextActive]}>
            Catalog Audit ({allBought.length + allShown.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === TABS.HISTORY && styles.tabButtonActive]}
          onPress={() => setActiveTab(TABS.HISTORY)}
          activeOpacity={0.8}
        >
          <IconClipboardList size={16} color={activeTab === TABS.HISTORY ? theme.colors.primary : theme.colors.textMuted} />
          <Text style={[styles.tabText, activeTab === TABS.HISTORY && styles.tabTextActive]}>
            Visits ({visits.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: OVERVIEW & HEALTH METRICS */}
      {activeTab === TABS.OVERVIEW && (
        <View style={styles.tabContent}>
          {/* Quick Metrics Strip */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxNumber}>{visits.length}</Text>
              <Text style={styles.statBoxLabel}>Total Visits</Text>
              <Text style={styles.statBoxSub}>{openVisitsCount} Open • {closedVisitsCount} Closed</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statBoxNumber, { color: theme.colors.callGreenLight }]}>{allBought.length}</Text>
              <Text style={styles.statBoxLabel}>Books in Store</Text>
              <Text style={styles.statBoxSub}>{allShown.length} pitched</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statBoxNumber, { color: theme.colors.gold }]}>{conversionRate}%</Text>
              <Text style={styles.statBoxLabel}>Adoption Rate</Text>
              <Text style={styles.statBoxSub}>Catalog success</Text>
            </View>
          </View>

          {/* Store Beat & Territory Profile */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>TERRITORY BEAT PROFILE</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Operating Zone</Text>
              <Text style={styles.infoValue}>{shop.sales_zones?.name || 'Unassigned'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Market / Bazaar</Text>
              <Text style={styles.infoValue}>{shop.sales_markets?.name || 'General Market'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Address</Text>
              <Text style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}>{shop.shop_address || 'Not recorded'}</Text>
            </View>
          </Card>

          {/* Last Visit Debrief (Quick context before entering) */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>LAST VISIT CONTEXT</Text>
            {lastVisit ? (
              <View>
                <View style={styles.lastVisitTop}>
                  <View>
                    <Text style={styles.lastVisitDate}>
                      {new Date(lastVisit.visited_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                    <Text style={styles.lastVisitRep}>Rep: {lastVisit.sales_boys?.name || 'Sales Rep'}</Text>
                  </View>
                  <StatusChip isAvailable={lastVisit.is_available} />
                </View>
                {lastVisit.comments ? (
                  <View style={styles.quoteBox}>
                    <Text style={styles.quoteText}>"{lastVisit.comments}"</Text>
                  </View>
                ) : (
                  <Text style={styles.noCommentsText}>No remarks logged during last check-in.</Text>
                )}
              </View>
            ) : (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateText}>No past visits on record for this store yet.</Text>
                <Text style={styles.emptyStateSub}>Tap "Check-In & Start Visit" below to log the first visit.</Text>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* TAB 2: WALLPAPER CATALOG AUDIT */}
      {activeTab === TABS.CATALOG && (
        <View style={styles.tabContent}>
          {/* Active / Converted Books */}
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconCircleGreen}>
                <IconStar size={16} color={theme.colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionHeading}>ACTIVE IN STORE (CONVERTED)</Text>
                <Text style={styles.sectionSubHeading}>Sample catalog books purchased and stocked</Text>
              </View>
              <View style={styles.counterBadgeGreen}>
                <Text style={styles.counterTextGreen}>{allBought.length}</Text>
              </View>
            </View>

            {allBought.length === 0 ? (
              <View style={styles.emptyCatalogBox}>
                <Text style={styles.emptyCatalogTitle}>No sample books converted yet</Text>
                <Text style={styles.emptyCatalogSub}>Introduce high-demand catalog editions during your visit.</Text>
              </View>
            ) : (
              <View style={styles.booksGrid}>
                {allBought.map((b, idx) => (
                  <View key={`${b.id || 'b'}-${idx}`} style={styles.bookCardBought}>
                    <View style={styles.bookHeaderRow}>
                      <IconBook size={16} color={theme.colors.success} />
                      <View style={styles.adoptedTag}>
                        <IconCheck size={11} color="#059669" />
                        <Text style={styles.adoptedTagText}>In Store</Text>
                      </View>
                    </View>
                    <Text style={styles.bookTitle} numberOfLines={1}>{b.name || b.code || 'Catalog Book'}</Text>
                    {b.code && <Text style={styles.bookCode}>Code: {b.code}</Text>}
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Pitched Books */}
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconCircleGold}>
                <IconBook size={16} color={theme.colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionHeading}>PITCHED IN PAST (SHOWN)</Text>
                <Text style={styles.sectionSubHeading}>Sample books shown but not yet ordered</Text>
              </View>
              <View style={styles.counterBadgeGold}>
                <Text style={styles.counterTextGold}>{allShown.length}</Text>
              </View>
            </View>

            {allShown.length === 0 ? (
              <View style={styles.emptyCatalogBox}>
                <Text style={styles.emptyCatalogTitle}>No sample book pitches logged yet</Text>
                <Text style={styles.emptyCatalogSub}>Log books pitched when creating your visit record.</Text>
              </View>
            ) : (
              <View style={styles.booksGrid}>
                {allShown.map((b, idx) => (
                  <View key={`${b.id || 'p'}-${idx}`} style={styles.bookCardShown}>
                    <View style={styles.bookHeaderRow}>
                      <IconBook size={16} color={theme.colors.accent} />
                      <View style={styles.shownTag}>
                        <Text style={styles.shownTagText}>Pitched</Text>
                      </View>
                    </View>
                    <Text style={styles.bookTitle} numberOfLines={1}>{b.name || b.code || 'Catalog Book'}</Text>
                    {b.code && <Text style={styles.bookCode}>Code: {b.code}</Text>}
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>
      )}

      {/* TAB 3: VISITS TIMELINE */}
      {activeTab === TABS.HISTORY && (
        <View style={styles.tabContent}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.sectionHeading}>COMPLETE FIELD VISITS TIMELINE</Text>
            <Text style={styles.historyCountBadge}>{visits.length} recorded</Text>
          </View>

          {visits.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <IconClipboardList size={28} color={theme.colors.accent} />
              </View>
              <Text style={styles.emptyTitle}>No field visits on record</Text>
              <Text style={styles.emptySub}>Check in to this retail store to record notes, catalog pitches, and conversions.</Text>
            </Card>
          ) : (
            visits.map((v, index) => {
              const visitBooks = v.sales_visit_books || [];
              const shownInVisit = visitBooks.filter((vb) => vb.action_type === 'shown');
              const boughtInVisit = visitBooks.filter((vb) => vb.action_type === 'bought');

              return (
                <Card key={v.id || index} style={styles.visitCard}>
                  <View style={styles.visitTopRow}>
                    <View>
                      <Text style={styles.visitDate}>
                        {new Date(v.visited_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                      <Text style={styles.visitTime}>
                        {new Date(v.visited_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </Text>
                    </View>
                    <StatusChip isAvailable={v.is_available} />
                  </View>

                  <View style={styles.repRow}>
                    <IconUser size={13} color={theme.colors.textMuted} />
                    <Text style={styles.repNameText}>
                      Sales Rep: <Text style={{ fontWeight: '700', color: theme.colors.navyPrimary }}>{v.sales_boys?.name || 'Assigned Rep'}</Text>
                    </Text>
                  </View>

                  {v.comments ? (
                    <View style={styles.commentBox}>
                      <Text style={styles.commentText}>"{v.comments}"</Text>
                    </View>
                  ) : null}

                  {/* Books associated with this specific visit */}
                  {(shownInVisit.length > 0 || boughtInVisit.length > 0) && (
                    <View style={styles.visitBooksSection}>
                      {boughtInVisit.length > 0 && (
                        <View style={styles.visitBookGroup}>
                          <Text style={styles.visitBookLabelGreen}>Purchased / Converted:</Text>
                          <View style={styles.miniChipsRow}>
                            {boughtInVisit.map((vb, i) => (
                              <View key={i} style={styles.miniChipGreen}>
                                <IconStar size={10} color="#059669" />
                                <Text style={styles.miniChipTextGreen}>{vb.books?.name || vb.books?.code || 'Book'}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {shownInVisit.length > 0 && (
                        <View style={styles.visitBookGroup}>
                          <Text style={styles.visitBookLabelGold}>Pitched:</Text>
                          <View style={styles.miniChipsRow}>
                            {shownInVisit.map((vb, i) => (
                              <View key={i} style={styles.miniChipGold}>
                                <Text style={styles.miniChipTextGold}>• {vb.books?.name || vb.books?.code || 'Book'}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </View>
      )}
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
  heroCard: {
    padding: 16,
    marginBottom: 12
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  storeName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6
  },
  zoneTag: {
    backgroundColor: 'rgba(29, 78, 216, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  zoneTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 0.5
  },
  marketTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  marketTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E2E8F0'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)'
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)'
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#34D399'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  metaText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500'
  },
  metaAddress: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
    lineHeight: 16
  },
  metaDivider: {
    color: '#64748B',
    fontSize: 12
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  actionBtnCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.callGreen,
    paddingVertical: 8,
    borderRadius: 6
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    borderRadius: 6
  },
  actionBtnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8
  },
  tabButtonActive: {
    backgroundColor: 'rgba(29, 78, 216, 0.1)'
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  tabContent: {
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  statBoxNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.navyPrimary
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginTop: 2
  },
  statBoxSub: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  sectionCard: {
    padding: 14,
    marginBottom: 10
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.8,
    marginBottom: 8
  },
  sectionSubHeading: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: -4,
    marginBottom: 8
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textMuted
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMain
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  },
  lastVisitTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  lastVisitDate: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain
  },
  lastVisitRep: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1
  },
  quoteBox: {
    backgroundColor: 'rgba(29, 78, 216, 0.04)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    padding: 8,
    borderRadius: 4,
    marginTop: 6
  },
  quoteText: {
    fontSize: 12,
    color: theme.colors.textMain,
    fontStyle: 'italic',
    lineHeight: 18
  },
  noCommentsText: {
    fontSize: 11,
    color: theme.colors.textDim,
    fontStyle: 'italic',
    marginTop: 4
  },
  emptyStateBox: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  emptyStateText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMain
  },
  emptyStateSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  iconCircleGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.successSurface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircleGold: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  counterBadgeGreen: {
    backgroundColor: theme.colors.successSurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)'
  },
  counterTextGreen: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.success
  },
  counterBadgeGold: {
    backgroundColor: theme.colors.accentSurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)'
  },
  counterTextGold: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.gold
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  bookCardBought: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'rgba(5, 150, 105, 0.03)'
  },
  bookCardShown: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 10
  },
  bookHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  adoptedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: theme.colors.successSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  adoptedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669'
  },
  shownTag: {
    backgroundColor: theme.colors.accentSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  shownTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.gold
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMain
  },
  bookCode: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  emptyCatalogBox: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  emptyCatalogTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMain
  },
  emptyCatalogSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2
  },
  historyCountBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain
  },
  emptySub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240
  },
  visitCard: {
    padding: 12,
    marginBottom: 8
  },
  visitTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  visitDate: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMain
  },
  visitTime: {
    fontSize: 10,
    color: theme.colors.textMuted
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6
  },
  repNameText: {
    fontSize: 11,
    color: theme.colors.textDim
  },
  commentBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.primary,
    padding: 6,
    borderRadius: 4,
    marginVertical: 4
  },
  commentText: {
    fontSize: 11,
    color: theme.colors.textMain,
    fontStyle: 'italic',
    lineHeight: 16
  },
  visitBooksSection: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    gap: 4
  },
  visitBookGroup: {
    gap: 2
  },
  visitBookLabelGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669'
  },
  visitBookLabelGold: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.gold
  },
  miniChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2
  },
  miniChipGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.successSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  miniChipTextGreen: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669'
  },
  miniChipGold: {
    backgroundColor: theme.colors.accentSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  miniChipTextGold: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.gold
  }
});
