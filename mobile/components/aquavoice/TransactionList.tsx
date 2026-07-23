import React from 'react';
import { View, Text, FlatList, StyleSheet, ViewStyle } from 'react-native';
import Card from '../ui/Card';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  style?: ViewStyle;
  emptyMessage?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  style,
  emptyMessage = 'No transactions yet',
}) => {
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.typeIndicator,
            { backgroundColor: item.type === 'income' ? '#4CAF50' : '#E53935' },
          ]}
        />
        <View>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.meta}>
            {item.category} · {item.date}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          { color: item.type === 'income' ? '#4CAF50' : '#E53935' },
        ]}
      >
        {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <Card style={style} padding={0}>
      <Text style={styles.header}>Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    padding: 16,
    paddingBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  meta: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 32,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default TransactionList;
