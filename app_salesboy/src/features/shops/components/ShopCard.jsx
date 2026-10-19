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

        <View style={styles.metaLine}>
          <IconUser size={14} color={theme.colors.textMuted} />
          <Text style={styles.contactPerson} numberOfLines={1}>
            {shop.contact_person || 'Shop Owner'}
          </Text>
        </View>

        <View style={styles.metaLine}>
          <IconMapPin size={14} color={theme.colors.textDim} />
          <Text style={styles.address} numberOfLines={2}>
            {shop.shop_address || 'Address not recorded'}
          </Text>
        </View>

        <View style={styles.footerRow}>
          {/* Solid Green Call Button */}
          <TouchableOpacity
            onPress={handleCall}
            style={styles.solidCallBtn}
            activeOpacity={0.8}
          >
            <IconPhoneCall size={14} color="#FFFFFF" />
            <Text style={styles.solidCallText}>{shop.phone || 'Call'}</Text>
          </TouchableOpacity>

          {/* Solid Blue Check-In Button */}
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
    padding: 14,
    marginBottom: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  shopName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textMain,
    flex: 1,
    marginRight: 8
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  zoneTag: {
    backgroundColor: 'rgba(11, 61, 46, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(11, 61, 46, 0.18)'
  },
  zoneText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '700'
  },
  marketTag: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.25)'
  },
  marketText: {
    fontSize: 11,
    color: '#0d9488',
    fontWeight: '700'
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  contactPerson: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500'
  },
  address: {
    fontSize: 12,
    color: theme.colors.textDim,
    lineHeight: 16,
    flex: 1
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight
  },
  solidCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.callGreen,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: theme.colors.callGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3
  },
  solidCallText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  solidCheckInBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3
  },
  solidCheckInText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
