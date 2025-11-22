import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import db from "../../database/database";

export default function Customers({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCustomers();
    const unsub = navigation.addListener("focus", loadCustomers);
    return unsub;
  }, []);

  function loadCustomers() {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT * FROM customers ORDER BY name;",
        [],
        (_, { rows }) => setCustomers(rows._array),
        (_, err) => {
          console.log("Erro ao carregar clientes:", err);
          return true;
        }
      );
    });
  }

  function onEdit(item) {
    navigation.navigate("CustomerForm", { item });
  }

  function onDelete(id) {
    Alert.alert(
      "Excluir cliente",
      "Tem certeza que deseja excluir este cliente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                "DELETE FROM customers WHERE id=?;",
                [id],
                () => loadCustomers(),
                (_, err) => {
                  console.log("Erro ao excluir cliente:", err);
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
    navigation.navigate("CustomerForm");
  }

  // 🔎 filtro por nome / telefone / e-mail
  const filteredCustomers = customers.filter(c => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();

    const name = c.name ? c.name.toLowerCase() : "";
    const phone = c.phone ? String(c.phone).toLowerCase() : "";
    const email = c.email ? c.email.toLowerCase() : "";

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
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Clientes</Text>

        <TouchableOpacity
          onPress={onNew}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: "#0a84ff",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff" }}>+ Cliente</Text>
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
        data={filteredCustomers}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#555", marginTop: 40 }}>
            {customers.length === 0
              ? "Nenhum cliente cadastrado."
              : "Nenhum cliente encontrado para essa busca."}
          </Text>
        }
      />
    </View>
  );
}
