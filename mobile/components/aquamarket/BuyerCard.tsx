import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Card from '../ui/Card';

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
    <Card style={style} padding={16}>
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
            style={styles.contactButton}
            onPress={() => onContact(buyer.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.contactText}>Contact</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  location: {
    fontSize: 13,
    color: '#777777',
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#FFC107',
    letterSpacing: 1,
  },
  lastActive: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  contactText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BuyerCard;
