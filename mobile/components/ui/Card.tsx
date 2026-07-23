import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: object;
  padding?: number;
}

export const Card = ({ children, style, padding }: CardProps) => (
  <View style={[styles.card, padding !== undefined && { padding }, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
