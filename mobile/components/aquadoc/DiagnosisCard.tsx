import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Card from '../ui/Card';

interface DiagnosisResult {
  diseaseName: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface DiagnosisCardProps {
  result: DiagnosisResult;
  style?: ViewStyle;
}

const severityColors: Record<string, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#E53935',
};

const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ result, style }) => {
  const { diseaseName, confidence, severity, description } = result;

  return (
    <Card style={style} padding={20}>
      <View style={styles.header}>
        <Text style={styles.diseaseName}>{diseaseName}</Text>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: severityColors[severity] || '#9E9E9E' },
          ]}
        >
          <Text style={styles.severityText}>{severity.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>Confidence</Text>
        <Text style={styles.confidenceValue}>{confidence}%</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${confidence}%`, backgroundColor: severityColors[severity] || '#9E9E9E' },
          ]}
        />
      </View>

      <Text style={styles.description}>{description}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  confidenceLabel: {
    fontSize: 13,
    color: '#777777',
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  description: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
});

export default DiagnosisCard;
