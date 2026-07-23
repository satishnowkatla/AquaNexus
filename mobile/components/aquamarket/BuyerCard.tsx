import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../utils/theme';
import { MODULE_COLOR_MAP } from '../../utils/moduleConfig';

const MODULE_COLOR = MODULE_COLOR_MAP.aquaconnect;

interface BuyerInfo {
  id: string;
  name: string;
  location: string;
  fishType: string;
  priceRange: string;
  rating: number;
  lastActive: string;
}

interface BuyerCardProps {
  buyer: BuyerInfo;
  onContact?: (buyerId: string) => void;
  style?: ViewStyle;
}

const BuyerCard: React.FC<BuyerCardProps> = ({ buyer, onContact, style }) => {
  const renderStars = (rating: number): string => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{buyer.name.charAt(0)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{buyer.name}</Text>
          <Text style={styles.location}>📍 {buyer.location}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Fish Type</Text>
          <Text style={styles.detailValue}>{buyer.fishType}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price Range</Text>
          <Text style={styles.detailValue}>{buyer.priceRange}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.rating}>{renderStars(buyer.rating)}</Text>
          <Text style={styles.lastActive}>Active {buyer.lastActive}</Text>
        </View>

        {onContact && (
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: MODULE_COLOR }]}
            onPress={() => onContact(buyer.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.contactText}>Contact</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: theme.layout.avatarMd,
    height: theme.layout.avatarMd,
    borderRadius: theme.layout.avatarMd / 2,
    backgroundColor: MODULE_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm + 4,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.grey[800],
  },
  location: {
    fontSize: 13,
    color: theme.colors.grey[600],
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.grey[100],
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.grey[500],
    marginBottom: 2,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.grey[800],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
    letterSpacing: 1,
  },
  lastActive: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.grey[500],
    marginTop: 2,
  },
  contactButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.sm,
  },
  contactText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});

export default BuyerCard;
