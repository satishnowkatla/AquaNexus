import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../utils/theme';

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
  low: theme.colors.success,
  medium: theme.colors.warning,
  high: theme.colors.danger,
};

const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ result, style }) => {
  const { diseaseName, confidence, severity, description } = result;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.diseaseName}>{diseaseName}</Text>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: severityColors[severity] || theme.colors.grey[500] },
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
            { width: `${confidence}%`, backgroundColor: severityColors[severity] || theme.colors.grey[500] },
          ]}
        />
      </View>

      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm + 4,
  },
  diseaseName: {
    fontSize: theme.fontSize.lg + 2,
    fontWeight: '700',
    color: theme.colors.grey[800],
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  severityText: {
    color: theme.colors.white,
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
    color: theme.colors.grey[600],
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.grey[800],
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.grey[100],
    borderRadius: 3,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.grey[700],
    lineHeight: 20,
  },
});

export default DiagnosisCard;
