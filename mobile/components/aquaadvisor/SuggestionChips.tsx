import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

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
          style={styles.chip}
          onPress={() => onSelect?.(suggestion)}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  chipText: {
    fontSize: 13,
    color: '#1E88E5',
    fontWeight: '500',
  },
});

export default SuggestionChips;
