import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../utils/theme';

interface PriceDataPoint {
  label: string;
  value: number;
}

interface PriceChartProps {
  data?: PriceDataPoint[];
  title?: string;
  unit?: string;
  style?: ViewStyle;
}

const PriceChart: React.FC<PriceChartProps> = ({
  data = [],
  title = 'Fish Price Trends',
  unit = '₹/kg',
  style,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No price data available</Text>
        </View>
      ) : (
        <View style={styles.chartArea}>
          <View style={styles.bars}>
            {data.map((point, index) => {
              const barHeight = (point.value / maxValue) * theme.layout.barHeight;
              return (
                <View key={index} style={styles.barColumn}>
                  <Text style={styles.barValue}>
                    {unit === '₹/kg' ? '₹' : ''}{point.value}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      { height: barHeight },
                    ]}
                  />
                  <Text style={styles.barLabel}>{point.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
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
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.grey[800],
    marginBottom: theme.spacing.md,
  },
  empty: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.grey[500],
  },
  chartArea: {
    paddingTop: 8,
  },
  bars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  bar: {
    width: 24,
    backgroundColor: theme.colors.infoBlue,
    borderRadius: theme.borderRadius.sm,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: theme.colors.grey[700],
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    color: theme.colors.grey[600],
    marginTop: 6,
  },
});

export default PriceChart;
