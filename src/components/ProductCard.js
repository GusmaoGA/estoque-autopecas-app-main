import { Alert, Image, Text, TouchableOpacity, View } from "react-native";




export default function ProductCard({ item, onEdit, onDelete, onSell, onStockEntry }) {
  const lowStock = item.stock <= (item.low_threshold || 3);
  const precoCompra = item.purchase_price ? Number(item.purchase_price).toFixed(2) : "0.00";
  const precoVenda = item.sale_price ? Number(item.sale_price).toFixed(2) : "0.00";

  const cond = item.condition || "novo";
  const isNovo = cond === "novo";

  function confirmarExclusao() {
    Alert.alert(
      "Excluir produto",
      `Deseja realmente excluir "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => onDelete(item.id) },
      ]
    );
  }

  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={{ width: 100, height: 80, borderRadius: 8 }}
          />
        ) : (
          <View
            style={{
              width: 100,
              height: 80,
              borderRadius: 8,
              backgroundColor: "#f3f3f3",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#777" }}>Sem foto</Text>
          </View>
        )}

        <View style={{ flex: 1, paddingLeft: 12 }}>
          {/* Nome + badge de condição */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontWeight: "700", fontSize: 16, flex: 1 }}>
              {item.name}
            </Text>

            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: isNovo ? "#4caf50" : "#ff9800",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                {isNovo ? "Novo" : "Usado"}
              </Text>
            </View>
          </View>

          <Text style={{ color: "#666", marginTop: 2 }}>SKU: {item.sku || "-"}</Text>

          <Text numberOfLines={2} style={{ color: "#666", marginTop: 2 }}>
            {item.description || "Sem descrição"}
          </Text>

          <Text style={{ marginTop: 6 }}>
            Estoque:{" "}
            <Text style={{ fontWeight: "700", color: lowStock ? "#e53935" : "#333" }}>
              {item.stock}
            </Text>
            {lowStock ? " ⚠️" : ""}
          </Text>

          <Text style={{ marginTop: 4, fontSize: 13, color: "#444" }}>
            Compra: R$ {precoCompra} | Venda:{" "}
            <Text style={{ fontWeight: "600", color: "#0a84ff" }}>R$ {precoVenda}</Text>
          </Text>
          <View style={{ marginTop: 10 }}>

            {/* Linha 1 */}
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => onSell(item)}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: "#0a84ff",
                  borderRadius: 8,
                  alignItems: "center",
                  marginRight: 6,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Vender</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onEdit(item)}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: "#e5e5e5",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#333", fontWeight: "600" }}>Editar</Text>
              </TouchableOpacity>
            </View>

            {/* Linha 2 */}
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => onStockEntry(item)}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: "#4caf50",
                  borderRadius: 8,
                  alignItems: "center",
                  marginRight: 6,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>+ Estoque</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmarExclusao}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: "#ffdddd",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#d32f2f", fontWeight: "600" }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
