import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Card from '@shared/ui/Card';
import { IconMapPin, IconUser, IconPhoneCall } from '@shared/icons';
import { theme } from '@theme';

export default function ShopCard({ shop, onSelect, onCheckIn }) {
  const handleCall = (e) => {
    e.stopPropagation();
    if (shop.phone) {
      Linking.openURL(`tel:${shop.phone}`);
    }
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => onSelect(shop)}>
        <View style={styles.header}>
          <Text style={styles.shopName} numberOfLines={1}>
            {shop.shop_name}
          </Text>
          <View style={styles.tagsRow}>
            {shop.sales_zones?.name && (
              <View style={styles.zoneTag}>
                <Text style={styles.zoneText}>{shop.sales_zones.name}</Text>
              </View>
            )}
            {shop.sales_markets?.name && (
              <View style={styles.marketTag}>
                <Text style={styles.marketText}>{shop.sales_markets.name}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.metaLine}>
            <IconUser size={15} color={theme.colors.primary} />
            <Text style={styles.contactPerson} numberOfLines={1}>
              {shop.contact_person || 'Shop Owner'}
            </Text>
          </View>

          <View style={[styles.metaLine, { marginBottom: 0 }]}>
            <IconMapPin size={15} color="#64748B" />
            <Text style={styles.address} numberOfLines={2}>
              {shop.shop_address || 'Address not recorded'}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          {/* Solid Green Call Button */}
          <TouchableOpacity
            onPress={handleCall}
            style={styles.solidCallBtn}
            activeOpacity={0.8}
          >
            <IconPhoneCall size={15} color="#FFFFFF" />
            <Text style={styles.solidCallText}>{shop.phone || 'Call'}</Text>
          </TouchableOpacity>

          {/* Solid Green Check-In Button */}
          <TouchableOpacity
            onPress={() => onCheckIn(shop)}
            style={styles.solidCheckInBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.solidCheckInText}>Check-In →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  shopName: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  zoneTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  zoneText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '700'
  },
  marketTag: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#99F6E4'
  },
  marketText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '700'
  },
  infoContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5
  },
  contactPerson: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700'
  },
  address: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
    flex: 1
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8
  },
  solidCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.callGreen,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 9,
    shadowColor: theme.colors.callGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2.5
  },
  solidCallText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  solidCheckInBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 9,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2.5
  },
  solidCheckInText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
