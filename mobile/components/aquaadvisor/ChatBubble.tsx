import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../utils/theme';
import { MODULE_COLOR_MAP } from '../../utils/moduleConfig';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  style?: ViewStyle;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  timestamp,
  style,
}) => {
  return (
    <View
      style={[
        styles.row,
        isUser ? styles.userRow : styles.botRow,
        style,
      ]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.message,
            isUser ? styles.userMessage : styles.botMessage,
          ]}
        >
          {message}
        </Text>
        {timestamp && (
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.botTimestamp,
            ]}
          >
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: theme.layout.avatarSm,
    height: theme.layout.avatarSm,
    borderRadius: theme.layout.avatarSm / 2,
    backgroundColor: MODULE_COLOR_MAP.aquaadvisor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    marginTop: 4,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.sm + 4,
  },
  userBubble: {
    backgroundColor: MODULE_COLOR_MAP.aquaadvisor,
    borderBottomRightRadius: theme.borderRadius.xs,
  },
  botBubble: {
    backgroundColor: theme.colors.grey[100],
    borderBottomLeftRadius: theme.borderRadius.xs,
  },
  message: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessage: {
    color: theme.colors.white,
  },
  botMessage: {
    color: theme.colors.grey[800],
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: theme.colors.white + 'B3',
    textAlign: 'right',
  },
  botTimestamp: {
    color: theme.colors.grey[500],
  },
});

export default ChatBubble;
