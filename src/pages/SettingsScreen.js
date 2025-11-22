import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { backupDatabase, restoreDatabase } from "../database/databaseBackup";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      <TouchableOpacity style={styles.button} onPress={backupDatabase}>
        <Text style={styles.btnText}>📦 Backup dos Dados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={restoreDatabase}>
        <Text style={styles.btnText}>🔄 Restaurar Dados</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0a84ff",
    padding: 14,
    borderRadius: 10,
    marginVertical: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});
