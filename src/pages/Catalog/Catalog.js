import { useEffect, useState } from "react";
import {
    FlatList,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import ProductCard from "../../components/ProductCard";
import db, { initDatabase } from "../../database/database";

export default function Catalog({ navigation }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState(""); // "" | "novo" | "usado"

  useEffect(() => {
    initDatabase(() => loadProducts());
    const unsubscribe = navigation.addListener("focus", loadProducts);
    return unsubscribe;
  }, []);

  function loadProducts() {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT * FROM products ORDER BY name;",
        [],
        (_, { rows }) => setProducts(rows._array)
      );
    });
  }

  function handleDelete(id) {
    db.transaction(tx => {
      tx.executeSql("DELETE FROM products WHERE id=?;", [id], () => {
        loadProducts();
      });
    });
  }

  // 🔹 marcas distintas
  const brands = Array.from(
    new Set(
      products
        .map(p => p.manufacturer)
        .filter(m => m && String(m).trim() !== "")
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  // 🔎 filtro por nome, SKU, marca e condição
  const filteredProducts = products.filter(p => {
    // Filtro por condição
    if (conditionFilter && p.condition !== conditionFilter) return false;

    // Filtro por marca
    if (brandFilter && p.manufacturer !== brandFilter) return false;

    // Filtro por texto
    if (!search.trim()) return true;

    const term = search.trim().toLowerCase();
    const name = p.name ? p.name.toLowerCase() : "";
    const sku = p.sku ? String(p.sku).toLowerCase() : "";

    return name.includes(term) || sku.includes(term);
  });

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f2f2f2" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Catálogo de Produtos</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProductForm")}
          style={{
            backgroundColor: "#0a84ff",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Campo de busca */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nome ou SKU..."
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
          marginBottom: 8,
        }}
      />

      {/* Filtro por condição (Novo / Usado) */}
      <View style={{ marginBottom: 8 }}>
        <Text style={{ marginBottom: 6, color: "#444", fontWeight: "600" }}>
          Condição
        </Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => setConditionFilter("")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: conditionFilter === "" ? "#0a84ff" : "#ccc",
              backgroundColor: conditionFilter === "" ? "#0a84ff" : "#fff",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: conditionFilter === "" ? "#fff" : "#333",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setConditionFilter("novo")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: conditionFilter === "novo" ? "#0a84ff" : "#ccc",
              backgroundColor: conditionFilter === "novo" ? "#0a84ff" : "#fff",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: conditionFilter === "novo" ? "#fff" : "#333",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              Novo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setConditionFilter("usado")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: conditionFilter === "usado" ? "#0a84ff" : "#ccc",
              backgroundColor: conditionFilter === "usado" ? "#0a84ff" : "#fff",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: conditionFilter === "usado" ? "#fff" : "#333",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              Usado
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtro por marca */}
      {brands.length > 0 && (
        <View style={{ marginBottom: 10 }}>
          <Text style={{ marginBottom: 6, color: "#444", fontWeight: "600" }}>
            Filtrar por marca
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Botão "Todas" */}
            <TouchableOpacity
              onPress={() => setBrandFilter("")}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: brandFilter === "" ? "#0a84ff" : "#ccc",
                backgroundColor: brandFilter === "" ? "#0a84ff" : "#fff",
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: brandFilter === "" ? "#fff" : "#333",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                Todas
              </Text>
            </TouchableOpacity>

            {/* Botões de marcas */}
            {brands.map(brand => (
              <TouchableOpacity
                key={brand}
                onPress={() => setBrandFilter(brand)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor:
                    brandFilter === brand ? "#0a84ff" : "#ccc",
                  backgroundColor:
                    brandFilter === brand ? "#0a84ff" : "#fff",
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: brandFilter === brand ? "#fff" : "#333",
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Lista de produtos */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onEdit={prod => navigation.navigate("ProductForm", { item: prod })}
            onDelete={handleDelete}
            onSell={prod => navigation.navigate("Sales", { product: prod })}
            onStockEntry={prod => navigation.navigate("StockEntry", { product: prod })}
          />
          
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#555", marginTop: 40 }}>
            {products.length === 0
              ? "Nenhum produto cadastrado."
              : "Nenhum produto encontrado para essa busca/filtros."}
          </Text>
        }
      />
    </View>
  );
}
