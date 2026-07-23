import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../utils/theme';
import { MOCK_VOICE_TXS } from '../../utils/mockData';

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
            { backgroundColor: item.type === 'income' ? theme.colors.success : theme.colors.danger },
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
          { color: item.type === 'income' ? theme.colors.success : theme.colors.danger },
        ]}
      >
        {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.header}>Transactions</Text>
      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        transactions.map((item) => (
          <View key={item.id}>
            {renderTransaction({ item })}
            <View style={styles.separator} />
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.grey[800],
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
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
    marginRight: theme.spacing.sm + 4,
  },
  description: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.grey[800],
  },
  meta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.grey[500],
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: theme.spacing.sm + 4,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.grey[100],
    marginLeft: 32,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.grey[500],
  },
});

export default TransactionList;
