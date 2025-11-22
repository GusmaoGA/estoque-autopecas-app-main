import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import db from "../../database/database";

export default function Suppliers({ navigation }) {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSuppliers();
    const unsub = navigation.addListener("focus", loadSuppliers);
    return unsub;
  }, []);

  function loadSuppliers() {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT * FROM suppliers ORDER BY name;",
        [],
        (_, { rows }) => setSuppliers(rows._array),
        (_, err) => {
          console.log("Erro ao carregar fornecedores:", err);
          return true;
        }
      );
    });
  }

  function onEdit(item) {
    navigation.navigate("SupplierForm", { item });
  }

  function onDelete(id) {
    Alert.alert(
      "Excluir fornecedor",
      "Tem certeza que deseja excluir este fornecedor?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                "DELETE FROM suppliers WHERE id=?;",
                [id],
                () => loadSuppliers(),
                (_, err) => {
                  console.log("Erro ao excluir fornecedor:", err);
                  return true;
                }
              );
            });
          },
        },
      ]
    );
  }

  function onNew() {
    navigation.navigate("SupplierForm");
  }

  // 🔎 filtro por nome / telefone / e-mail
  const filteredSuppliers = suppliers.filter(s => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();

    const name = s.name ? s.name.toLowerCase() : "";
    const phone = s.phone ? String(s.phone).toLowerCase() : "";
    const email = s.email ? s.email.toLowerCase() : "";

    return (
      name.includes(term) ||
      phone.includes(term) ||
      email.includes(term)
    );
  });

  const renderItem = ({ item }) => (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontWeight: "700", fontSize: 16 }}>{item.name}</Text>
      {item.phone ? <Text>Telefone: {item.phone}</Text> : null}
      {item.email ? <Text>E-mail: {item.email}</Text> : null}

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <TouchableOpacity
          onPress={() => onEdit(item)}
          style={{
            padding: 8,
            backgroundColor: "#2196F3",
            borderRadius: 8,
            marginRight: 8,
          }}
        >
          <Text style={{ color: "#fff" }}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={{
            padding: 8,
            backgroundColor: "#f44336",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff" }}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f2f2f2" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Fornecedores</Text>

        <TouchableOpacity
          onPress={onNew}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: "#0a84ff",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff" }}>+ Fornecedor</Text>
        </TouchableOpacity>
      </View>

      {/* Campo de busca */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nome, telefone ou e-mail..."
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
          marginBottom: 12,
        }}
      />

      <FlatList
        data={filteredSuppliers}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#555", marginTop: 40 }}>
            {suppliers.length === 0
              ? "Nenhum fornecedor cadastrado."
              : "Nenhum fornecedor encontrado para essa busca."}
          </Text>
        }
      />
    </View>
  );
}
