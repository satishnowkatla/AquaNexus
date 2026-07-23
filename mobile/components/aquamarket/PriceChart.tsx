import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Card from '../ui/Card';

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
    <Card style={style} padding={16}>
      <Text style={styles.title}>{title}</Text>

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No price data available</Text>
        </View>
      ) : (
        <View style={styles.chartArea}>
          <View style={styles.bars}>
            {data.map((point, index) => {
              const barHeight = (point.value / maxValue) * 120;
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
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  empty: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
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
    backgroundColor: '#1E88E5',
    borderRadius: 6,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#555555',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    color: '#777777',
    marginTop: 6,
  },
});

export default PriceChart;
