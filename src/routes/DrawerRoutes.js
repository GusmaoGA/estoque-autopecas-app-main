import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Catalog from "../pages/Catalog/Catalog";
import ProductForm from "../pages/Products/ProductForm";
import Sales from "../pages/Sales/Sales";

import CustomerForm from "../pages/Customers/CustomerForm";
import Customers from "../pages/Customers/Customers";

import SupplierForm from "../pages/Suppliers/SupplierForm";
import Suppliers from "../pages/Suppliers/Suppliers";

import SalesDashboard from "../pages/Dashboard/SalesDashboard";
import StockEntryForm from "../pages/Products/StockEntryForm";
import SettingsScreen from "../pages/SettingsScreen";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// 🔹 Stack do Catálogo
function CatalogStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Catalog"
        component={Catalog}
        options={{ title: "Catálogo" }}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductForm}
        options={{ title: "Produto" }}
      />
      <Stack.Screen
        name="StockEntry"
        component={StockEntryForm}
        options={{ title: "Entrada de estoque" }}
      />
      <Stack.Screen
        name="Sales"
        component={Sales}
        options={{ title: "Vendas" }}
      />
    </Stack.Navigator>
  );
}

// 🔹 Stack de Clientes
function CustomersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Customers"
        component={Customers}
        options={{ title: "Clientes" }}
      />
      <Stack.Screen
        name="CustomerForm"
        component={CustomerForm}
        options={{ title: "Cliente" }}
      />
    </Stack.Navigator>
  );
}

// 🔹 Stack de Fornecedores
function SuppliersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Suppliers"
        component={Suppliers}
        options={{ title: "Fornecedores" }}
      />
      <Stack.Screen
        name="SupplierForm"
        component={SupplierForm}
        options={{ title: "Fornecedor" }}
      />
    </Stack.Navigator>
  );
}

// 🔹 Drawer principal
export default function DrawerRoutes() {
  return (
    <Drawer.Navigator initialRouteName="Dashboard">
      <Drawer.Screen
        name="Dashboard"
        component={SalesDashboard}
        options={{ title: "Dashboard" }}
      />
      <Drawer.Screen
        name="Home"
        component={CatalogStack}
        options={{ title: "Catálogo" }}
      />
      <Drawer.Screen
        name="Clientes"
        component={CustomersStack}
      />
      <Drawer.Screen
        name="Fornecedores"
        component={SuppliersStack}
      />
      <Drawer.Screen
        name="Configurações"
        component={SettingsScreen}
      />
    </Drawer.Navigator>
  );
}
