import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';
import { LANGUAGE_OPTIONS } from '../../utils/mockData';

interface LanguageToggleProps {
  selected: string;
  onSelect: (lang: string) => void;
}

const SHORT_LABELS: Record<string, string> = {
  te: 'తెలుగు',
  hi: 'हिन्दी',
  en: 'English',
};

export const LanguageToggle = ({
  selected,
  onSelect,
}: LanguageToggleProps) => (
  <View style={styles.container}>
    {LANGUAGE_OPTIONS.map((lang) => (
      <TouchableOpacity
        key={lang.value}
        style={[styles.lang, selected === lang.value && styles.langSelected]}
        onPress={() => onSelect(lang.value)}
      >
        <Text
          style={[
            styles.text,
            selected === lang.value && styles.textSelected,
          ]}
        >
          {SHORT_LABELS[lang.value] || lang.label}
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
    color: theme.colors.white,
  },
});
