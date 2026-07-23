import { View, Text, StyleSheet } from "react-native";
import { theme } from '../../utils/theme';

export default function DiagnosisResultModal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnosis Result</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.white },
  title: { fontSize: theme.fontSize.xl, fontWeight: "bold" },
});
