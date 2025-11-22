import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import db from "../../database/database";
import { style } from "./styles";

export default function ProductForm({ route, navigation }) {
  const item = route.params?.item || null;

  const [form, setForm] = useState({
    id: null,
    sku: "",
    name: "",
    description: "",
    manufacturer: "",
    car_model: "",
    car_year: "",
    condition: "novo",
    purchase_price: "",
    sale_price: "",
    stock: "0",
    low_threshold: "3",
    image: "",
  });

  useEffect(() => {
    if (item) setForm(prev => ({ ...prev, ...item }));
  }, [item]);

  async function pickImage() {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return Alert.alert("Permissão necessária");
    const r = await ImagePicker.launchImageLibraryAsync({
      quality: 0.6,
      base64: false,
    });

    // API nova usa "canceled"
    if (!r.canceled && !r.cancelled) {
      const uri = r.assets ? r.assets[0]?.uri : r.uri;
      if (uri) setForm(prev => ({ ...prev, image: uri }));
    }
  }

  function parseCurrency(value) {
    if (!value) return 0;
    const num = parseFloat(
      String(value).replace(/[R$\s.]/g, "").replace(",", ".")
    );
    return isNaN(num) ? 0 : num;
  }

  function save() {
    // 🔹 Validações (igual vibe de cliente/fornecedor)
    if (!form.name.trim()) {
      return Alert.alert("Atenção", "Informe o nome do produto.");
    }

    if (parseCurrency(form.sale_price) <= 0) {
      return Alert.alert("Atenção", "Informe um preço de venda válido.");
    }

    if (parseCurrency(form.purchase_price) < 0) {
      return Alert.alert("Atenção", "Informe um preço de compra válido.");
    }

    if (parseCurrency(form.sale_price) < parseCurrency(form.purchase_price)) {
      return Alert.alert(
        "Atenção",
        "O preço de venda não pode ser menor que o preço de compra."
      );
    }

    if ((parseInt(form.stock) || 0) < 0) {
      return Alert.alert("Atenção", "O estoque não pode ser negativo.");
    }

    if ((parseInt(form.low_threshold) || 0) < 0) {
      return Alert.alert(
        "Atenção",
        "O alerta de estoque mínimo deve ser um número válido."
      );
    }

    const purchase = parseCurrency(form.purchase_price);
    const sale = parseCurrency(form.sale_price);
    const stock = parseInt(form.stock) || 0;
    const low = parseInt(form.low_threshold) || 3;

    db.transaction(tx => {
      if (item) {
        // 🔹 Atualizar produto existente
        tx.executeSql(
          `UPDATE products 
           SET sku=?, name=?, description=?, manufacturer=?, car_model=?, car_year=?, condition=?, 
               purchase_price=?, sale_price=?, stock=?, low_threshold=?, image=? 
           WHERE id=?;`,
          [
            form.sku,
            form.name,
            form.description,
            form.manufacturer,
            form.car_model,
            form.car_year,
            form.condition,
            purchase,
            sale,
            stock,
            low,
            form.image,
            form.id,
          ],
          () => {
            Alert.alert("Sucesso", "Produto atualizado com sucesso!");
            navigation.goBack();
          },
          (_, err) => {
            console.log("❌ Erro ao atualizar produto:", err);
            Alert.alert("Erro", "Falha ao atualizar produto: " + err.message);
            return true;
          }
        );
      } else {
        // 🔹 Novo produto: gerar SKU automático
        tx.executeSql(
          "SELECT MAX(CAST(sku AS INTEGER)) as lastSku FROM products;",
          [],
          (_, result) => {
            const lastSku =
              result.rows.length > 0 ? result.rows.item(0).lastSku : 0;
            const nextSku = (lastSku || 0) + 1;

            tx.executeSql(
              `INSERT INTO products 
               (sku, name, description, manufacturer, car_model, car_year, condition, purchase_price, sale_price, stock, low_threshold, image) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
              [
                String(nextSku),
                form.name,
                form.description,
                form.manufacturer,
                form.car_model,
                form.car_year,
                form.condition,
                purchase,
                sale,
                stock,
                low,
                form.image,
              ],
              () => {
                Alert.alert("Sucesso", "Produto cadastrado com sucesso!");
                navigation.goBack();
              },
              (_, err) => {
                console.log("❌ Erro ao inserir:", err);
                Alert.alert(
                  "Erro",
                  "Falha ao salvar produto: " + err.message
                );
                return true;
              }
            );
          },
          (_, err) => {
            console.log("Erro ao buscar SKU:", err);
            Alert.alert("Erro", "Falha ao gerar SKU automático.");
            return true;
          }
        );
      }
    });
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text
        style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}
      >
        {item ? "Editar produto" : "Novo produto"}
      </Text>

      {/* SKU só pra exibir, igual padrão bonitinho */}
      <Text>SKU (gerado automaticamente)</Text>
      <TextInput
        value={form.sku ? String(form.sku) : ""}
        editable={false}
        style={[
          style.caixaPadrao,
          { backgroundColor: "#eee", color: "#555" },
        ]}
        placeholder="Será gerado ao salvar"
      />

      <Text>Nome</Text>
      <TextInput
        value={form.name}
        onChangeText={t => setForm({ ...form, name: t })}
        style={style.caixaPadrao}
        placeholder="Nome do produto"
      />

      <Text>Descrição</Text>
      <TextInput
        multiline
        value={form.description}
        onChangeText={t => setForm({ ...form, description: t })}
        style={{
          backgroundColor: "#fff",
          padding: 8,
          borderRadius: 8,
          marginTop: 6,
          height: 80,
          textAlignVertical: "top",
        }}
        placeholder="Detalhes do produto"
      />

      <Text>Marca</Text>
      <TextInput
        value={form.manufacturer}
        onChangeText={t => setForm({ ...form, manufacturer: t })}
        style={style.caixaPadrao}
        placeholder="Ex: Ford, Fiat..."
      />

      <Text>Modelo do carro</Text>
      <TextInput
        value={form.car_model}
        onChangeText={t => setForm({ ...form, car_model: t })}
        style={style.caixaPadrao}
        placeholder="Ex: Gol, Uno, Civic..."
      />

      <Text>Ano do carro</Text>
      <TextInput
        keyboardType="numeric"
        value={form.car_year}
        onChangeText={t =>
          setForm({ ...form, car_year: t.replace(/[^0-9]/g, "") })
        }
        style={style.caixaPadrao}
        placeholder="Ex: 2015"
        maxLength={4}
      />

      <Text>Condição</Text>
      <View style={style.pickerWrap}>
        <Picker
          selectedValue={form.condition}
          onValueChange={v => setForm({ ...form, condition: v })}
        >
          <Picker.Item label="Novo" value="novo" />
          <Picker.Item label="Usado" value="usado" />
        </Picker>
      </View>

      <Text>Preço de compra</Text>
      <TextInputMask
        type={"money"}
        options={{
          precision: 2,
          separator: ",",
          delimiter: ".",
          unit: "R$ ",
          suffixUnit: "",
        }}
        value={form.purchase_price}
        onChangeText={t => setForm({ ...form, purchase_price: t })}
        style={style.caixaPadrao}
      />

      <Text>Preço de venda</Text>
      <TextInputMask
        type={"money"}
        options={{
          precision: 2,
          separator: ",",
          delimiter: ".",
          unit: "R$ ",
          suffixUnit: "",
        }}
        value={form.sale_price}
        onChangeText={t => setForm({ ...form, sale_price: t })}
        style={style.caixaPadrao}
      />

      <Text>Estoque</Text>
      <TextInput
        keyboardType="numeric"
        value={form.stock}
        onChangeText={t => {
          const clean = t.replace(/[^0-9]/g, "");
          setForm({ ...form, stock: clean });
        }}
        style={style.caixaPadrao}
        placeholder="0"
      />

      <Text>Alerta de estoque mínimo</Text>
      <TextInput
        keyboardType="numeric"
        value={form.low_threshold}
        onChangeText={t => {
          const clean = t.replace(/[^0-9]/g, "");
          setForm({ ...form, low_threshold: clean });
        }}
        style={style.caixaPadrao}
        placeholder="Ex: 3"
      />

      <Text>Imagem (URL ou escolher)</Text>
      {form.image ? (
        <Image
          source={{ uri: form.image }}
          style={{
            width: 160,
            height: 90,
            borderRadius: 8,
            marginTop: 8,
          }}
        />
      ) : null}

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <TextInput
          value={form.image}
          onChangeText={t => setForm({ ...form, image: t })}
          placeholder="URL..."
          style={{
            backgroundColor: "#fff",
            padding: 8,
            borderRadius: 8,
            flex: 1,
          }}
        />
        <TouchableOpacity
          onPress={pickImage}
          style={{
            marginLeft: 8,
            padding: 10,
            backgroundColor: "#ddd",
            borderRadius: 8,
          }}
        >
          <Text>Galeria</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <TouchableOpacity
          onPress={save}
          style={{
            flex: 1,
            padding: 10,
            backgroundColor: "#0a84ff",
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff" }}>Salvar</Text>
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
