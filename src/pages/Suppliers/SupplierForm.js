import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import db from "../../database/database";

export default function SupplierForm({ route, navigation }) {
  const item = route.params?.item || null;

  const [form, setForm] = useState({
    id: null,
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (item) setForm({ ...form, ...item });
  }, [item]);

  function validate() {
    if (!form.name.trim()) {
      Alert.alert("Atenção", "O nome do fornecedor é obrigatório.");
      return false;
    }

    if (form.phone && !/^\d{8,15}$/.test(form.phone.replace(/\D/g, ""))) {
      Alert.alert("Atenção", "Digite um telefone válido (somente números).");
      return false;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      Alert.alert("Atenção", "Digite um e-mail válido.");
      return false;
    }

    return true;
  }

  function save() {
    if (!validate()) return;

    db.transaction(tx => {
      if (item) {
        tx.executeSql(
          "UPDATE suppliers SET name=?, phone=?, email=? WHERE id=?;",
          [form.name, form.phone, form.email, form.id],
          () => {
            Alert.alert("Sucesso", "Fornecedor atualizado com sucesso!");
            navigation.goBack();
          },
          (_, err) => {
            console.log("❌ Erro ao atualizar fornecedor:", err);
            Alert.alert("Erro", "Falha ao atualizar fornecedor.");
            return true;
          }
        );
      } else {
        tx.executeSql(
          "INSERT INTO suppliers (name, phone, email) VALUES (?, ?, ?);",
          [form.name, form.phone, form.email],
          () => {
            Alert.alert("Sucesso", "Fornecedor cadastrado com sucesso!");
            navigation.goBack();
          },
          (_, err) => {
            console.log("❌ Erro ao inserir fornecedor:", err);
            Alert.alert("Erro", "Falha ao salvar fornecedor.");
            return true;
          }
        );
      }
    });
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
        {item ? "Editar fornecedor" : "Novo fornecedor"}
      </Text>

      <Text>Nome</Text>
      <TextInput
        value={form.name}
        onChangeText={t => setForm({ ...form, name: t })}
        style={{ backgroundColor: "#fff", padding: 8, borderRadius: 8, marginTop: 6 }}
        placeholder="Nome do fornecedor"
      />

      <Text>Telefone</Text>
      <TextInput
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={t => setForm({ ...form, phone: t.replace(/[^0-9]/g, "") })}
        style={{ backgroundColor: "#fff", padding: 8, borderRadius: 8, marginTop: 6 }}
        placeholder="Somente números"
        maxLength={15}
      />

      <Text>E-mail</Text>
      <TextInput
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={t => setForm({ ...form, email: t })}
        style={{ backgroundColor: "#fff", padding: 8, borderRadius: 8, marginTop: 6 }}
        placeholder="exemplo@fornecedor.com"
      />

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <TouchableOpacity
          onPress={save}
          style={{ flex: 1, padding: 10, backgroundColor: "#0a84ff", borderRadius: 8, alignItems: "center" }}
        >
          <Text style={{ color: "#fff" }}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flex: 1, marginLeft: 8, padding: 10, backgroundColor: "#eee", borderRadius: 8, alignItems: "center" }}
        >
          <Text>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
