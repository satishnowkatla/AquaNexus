import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

interface LanguageToggleProps {
  selected: string;
  onSelect: (lang: string) => void;
}

const languages = [
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'English' },
];

export const LanguageToggle = ({
  selected,
  onSelect,
}: LanguageToggleProps) => (
  <View style={styles.container}>
    {languages.map((lang) => (
      <TouchableOpacity
        key={lang.code}
        style={[styles.lang, selected === lang.code && styles.langSelected]}
        onPress={() => onSelect(lang.code)}
      >
        <Text
          style={[
            styles.text,
            selected === lang.code && styles.textSelected,
          ]}
        >
          {lang.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  lang: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  langSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  text: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  textSelected: {
    color: '#FFFFFF',
  },
});
