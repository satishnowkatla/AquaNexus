import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

interface ModuleCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

export const ModuleCard = ({
  icon,
  title,
  description,
  onPress,
}: ModuleCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.icon}>{icon}</Text>
    <View style={styles.info}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
    </View>
    <Text style={styles.arrow}>→</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  icon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  desc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  arrow: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textLight,
  },
});
