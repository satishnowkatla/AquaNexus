import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../utils/theme';
import { MODULE_COLOR_MAP } from '../../utils/moduleConfig';

const MODULE_COLOR = MODULE_COLOR_MAP.aquaadvisor;

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect?: (suggestion: string) => void;
  style?: ViewStyle;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onSelect,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.chip, { borderColor: MODULE_COLOR + '35' }]}
          onPress={() => onSelect?.(suggestion)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, { color: MODULE_COLOR }]}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chip: {
    backgroundColor: MODULE_COLOR + '15',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default SuggestionChips;
