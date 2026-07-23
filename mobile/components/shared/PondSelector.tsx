import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

interface Pond {
  id: string;
  name: string;
  species: string;
}

interface PondSelectorProps {
  ponds: Pond[];
  selectedId: string | null;
  onSelect: (pond: Pond) => void;
}

export const PondSelector = ({
  ponds,
  selectedId,
  onSelect,
}: PondSelectorProps) => (
  <View style={styles.container}>
    <Text style={styles.label}>Select Pond</Text>
    <View style={styles.list}>
      {ponds.map((pond) => (
        <TouchableOpacity
          key={pond.id}
          style={[
            styles.pond,
            selectedId === pond.id && styles.pondSelected,
          ]}
          onPress={() => onSelect(pond)}
        >
          <Text
            style={[
              styles.pondName,
              selectedId === pond.id && styles.pondNameSelected,
            ]}
          >
            {pond.name}
          </Text>
          <Text
            style={[
              styles.pondSpecies,
              selectedId === pond.id && styles.pondSpeciesSelected,
            ]}
          >
            {pond.species}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  pond: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pondSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pondName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pondNameSelected: {
    color: theme.colors.white,
  },
  pondSpecies: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  pondSpeciesSelected: {
    color: theme.colors.white,
    opacity: 0.9,
  },
});
