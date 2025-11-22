import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import db from "../../database/database";

export default function Sales({ route, navigation }) {
  const productFromRoute = route.params?.product || null;

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState(
    productFromRoute ? productFromRoute.id : null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

      useEffect(() => {
        loadProducts();
        loadCustomers();
        loadSales();

        if (productFromRoute) {
          setSelectedProductId(productFromRoute.id);
          setUnitPrice(
            productFromRoute.sale_price != null
              ? String(productFromRoute.sale_price).replace(".", ",")
              : ""
          );
        }

        const unsub = navigation.addListener("focus", () => {
          loadSales();
          loadProducts();
        });

        return unsub;
      }, []);


  function loadProducts() {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT * FROM products ORDER BY name;",
        [],
        (_, { rows }) => setProducts(rows._array),
        (_, err) => {
          console.log("Erro ao carregar produtos:", err);
          return true;
        }
      );
    });
  }

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

  function loadSales() {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT s.*, 
                p.name AS product_name, 
                c.name AS customer_name
         FROM sales s
         LEFT JOIN products p ON p.id = s.product_id
         LEFT JOIN customers c ON c.id = s.customer_id
         ORDER BY datetime(s.sale_date) DESC
         LIMIT 50;`,
        [],
        (_, { rows }) => setSales(rows._array),
        (_, err) => {
          console.log("Erro ao carregar vendas:", err);
          return true;
        }
      );
    });
  }

  function parseCurrency(value) {
    if (!value) return 0;
    const num = parseFloat(
      String(value).replace(/[R$\s.]/g, "").replace(",", ".")
    );
    return isNaN(num) ? 0 : num;
  }

  function handleSave() {
    if (!selectedProductId) {
      return Alert.alert("Atenção", "Selecione um produto.");
    }

    const qtdNumber = parseInt(qty) || 0;
    if (qtdNumber <= 0) {
      return Alert.alert("Atenção", "Informe uma quantidade válida.");
    }

    const priceNumber = parseCurrency(unitPrice);
    if (priceNumber <= 0) {
      return Alert.alert("Atenção", "Informe um preço de venda válido.");
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) {
      return Alert.alert("Erro", "Produto não encontrado.");
    }

    if (product.stock < qtdNumber) {
      return Alert.alert(
        "Estoque insuficiente",
        `Estoque atual: ${product.stock}. Quantidade solicitada: ${qtdNumber}.`
      );
    }

    const saleDate = new Date().toISOString();

    db.transaction(
      tx => {
        tx.executeSql(
          "INSERT INTO sales (product_id, customer_id, qty, price, sale_date) VALUES (?, ?, ?, ?, ?);",
          [selectedProductId, selectedCustomerId || null, qtdNumber, priceNumber, saleDate]
        );

        tx.executeSql(
          "UPDATE products SET stock = stock - ? WHERE id = ?;",
          [qtdNumber, selectedProductId]
        );
      },
      err => {
        console.log("Erro ao registrar venda:", err);
        Alert.alert("Erro", "Não foi possível registrar a venda.");
      },
      () => {
        Alert.alert("Sucesso", "Venda registrada e estoque atualizado!");
        setQty("1");
        loadProducts();
        loadSales();
        navigation.goBack();
      }
    );
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  }

  function renderSaleItem(sale) {
    const total = (sale.price || 0) * (sale.qty || 0);
    return (
      <View
        key={sale.id}
        style={{
          backgroundColor: "#fff",
          padding: 10,
          borderRadius: 8,
          marginBottom: 8,
        }}
      >
        <Text style={{ fontWeight: "700" }}>
          {sale.product_name || "Produto removido"}
        </Text>
        {sale.customer_name ? (
          <Text style={{ color: "#555" }}>Cliente: {sale.customer_name}</Text>
        ) : null}
        <Text>Qtd: {sale.qty} | Valor un.: R$ {sale.price.toFixed(2)}</Text>
        <Text style={{ fontWeight: "600" }}>
          Total: R$ {total.toFixed(2)}
        </Text>
        <Text style={{ color: "#777", fontSize: 12 }}>
          {formatDate(sale.sale_date)}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
        Registrar venda
      </Text>

      {/* Produto */}
      <Text>Produto</Text>
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          marginTop: 6,
          marginBottom: 8,
        }}
      >
        <Picker
          selectedValue={selectedProductId}
          onValueChange={v => setSelectedProductId(v)}
        >
          <Picker.Item label="Selecione um produto..." value={null} />
          {products.map(p => (
            <Picker.Item
              key={p.id}
              label={`${p.name} (Estoque: ${p.stock})`}
              value={p.id}
            />
          ))}
        </Picker>
      </View>

      {/* Cliente (opcional) */}
      <Text>Cliente (opcional)</Text>
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          marginTop: 6,
          marginBottom: 8,
        }}
      >
        <Picker
          selectedValue={selectedCustomerId}
          onValueChange={v => setSelectedCustomerId(v)}
        >
          <Picker.Item label="Sem cliente vinculado" value={null} />
          {customers.map(c => (
            <Picker.Item key={c.id} label={c.name} value={c.id} />
          ))}
        </Picker>
      </View>

      {/* Quantidade */}
      <Text>Quantidade</Text>
      <TextInput
        keyboardType="numeric"
        value={qty}
        onChangeText={t => {
          const clean = t.replace(/[^0-9]/g, "");
          setQty(clean);
        }}
        style={{
          backgroundColor: "#fff",
          padding: 8,
          borderRadius: 8,
          marginTop: 6,
          marginBottom: 8,
        }}
        placeholder="Ex: 1"
      />

          {/* Preço de venda (unidade) */}
        <Text>Preço de venda (unidade)</Text>
        <TextInput
          keyboardType="numeric"
          value={unitPrice}
          onChangeText={t => setUnitPrice(t)}
          placeholder="Ex: 500,00"
          style={{
            backgroundColor: "#fff",
            padding: 8,
            borderRadius: 8,
            marginTop: 6,
            marginBottom: 8,
          }}
        />


      {/* Botões */}
      <View style={{ flexDirection: "row", marginTop: 8, marginBottom: 16 }}>
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
          <Text style={{ color: "#fff" }}>Confirmar venda</Text>
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

      {/* Lista de vendas recentes */}
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
        Últimas vendas
      </Text>

      {sales.length === 0 ? (
        <Text style={{ color: "#555" }}>Nenhuma venda registrada ainda.</Text>
      ) : (
        sales.map(sale => renderSaleItem(sale))
      )}
    </ScrollView>
  );
}
