import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import db from "../../database/database";
import { style } from "./styles";

export default function StockEntryForm({ route, navigation }) {
  const product = route.params?.product;

  const [qty, setQty] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(
    product?.purchase_price ? String(product.purchase_price) : ""
  );

  if (!product) {
    // Se alguém chegar aqui sem produto, só vaza
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Produto não encontrado.</Text>
      </View>
    );
  }

  function handleSave() {
    const qtdNumber = parseInt(qty) || 0;

    if (qtdNumber <= 0) {
      return Alert.alert("Atenção", "Informe uma quantidade válida para entrada.");
    }

    db.transaction(tx => {
      tx.executeSql(
        "UPDATE products SET stock = stock + ?, purchase_price = COALESCE(?, purchase_price) WHERE id=?;",
        [qtdNumber, purchasePrice ? parseFloat(purchasePrice.replace(",", ".")) : null, product.id],
        () => {
          Alert.alert("Sucesso", "Estoque atualizado com sucesso!");
          navigation.goBack();
        },
        (_, err) => {
          console.log("Erro ao atualizar estoque:", err);
          Alert.alert("Erro", "Não foi possível atualizar o estoque.");
          return true;
        }
      );
    });
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
        Entrada de estoque
      </Text>

      <Text style={{ fontWeight: "600", marginBottom: 4 }}>{product.name}</Text>
      <Text style={{ marginBottom: 12, color: "#555" }}>
        Estoque atual: <Text style={{ fontWeight: "700" }}>{product.stock}</Text>
      </Text>

      <Text>Quantidade a adicionar</Text>
      <TextInput
        keyboardType="numeric"
        value={qty}
        onChangeText={t => {
          const clean = t.replace(/[^0-9]/g, "");
          setQty(clean);
        }}
        style={style.caixaPadrao}
        placeholder="Ex: 10"
      />

      <Text style={{ marginTop: 12 }}>Preço de compra (opcional)</Text>
      <TextInput
        keyboardType="numeric"
        value={purchasePrice}
        onChangeText={t => setPurchasePrice(t)}
        style={style.caixaPadrao}
        placeholder="Ex: 120,00"
      />

      <View style={{ flexDirection: "row", marginTop: 16 }}>
        <TouchableOpacity
          onPress={handleSave}
          style={{
            flex: 1,
            padding: 10,
            backgroundColor: "#0a84ff",
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff" }}>Confirmar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flex: 1,
            marginLeft: 8,
            padding: 10,
            backgroundColor: "#eee",
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
