import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

const DB_NAME = "catalog.db";
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

export async function backupDatabase() {
  try {
    const uri = DB_PATH;

    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true
    });

    if (result.canceled) return;

    const destUri = result.assets[0].uri;

    await FileSystem.copyAsync({
      from: uri,
      to: destUri
    });

    Alert.alert("✅ Backup concluído", "Banco salvo com sucesso!");
  } catch (error) {
    console.log(error);
    Alert.alert("Erro", "Falha ao fazer backup.");
  }
}

export async function restoreDatabase() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*"
    });

    if (result.canceled) return;

    const fileUri = result.assets[0].uri;

    await FileSystem.copyAsync({
      from: fileUri,
      to: DB_PATH
    });

    Alert.alert(
      "✅ Restauração concluída",
      "Reinicie o app para aplicar os dados restaurados."
    );
  } catch (error) {
    console.log(error);
    Alert.alert("Erro", "Falha ao restaurar banco.");
  }
}