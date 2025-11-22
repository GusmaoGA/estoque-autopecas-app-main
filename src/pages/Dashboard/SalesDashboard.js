import { useEffect, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import db from "../../database/database";

const screenWidth = Dimensions.get("window").width;

export default function SalesDashboard() {
  const [monthTotal, setMonthTotal] = useState(0);
  const [yearTotal, setYearTotal] = useState(0);
  const [monthSalesCount, setMonthSalesCount] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [chartLabels, setChartLabels] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    loadSales();
  }, []);

  function loadSales() {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT 
           s.*,
           p.name AS product_name
         FROM sales s
         LEFT JOIN products p ON p.id = s.product_id;`,
        [],
        (_, { rows }) => processSales(rows._array),
        (_, err) => {
          console.log("Erro ao carregar vendas pro dashboard:", err);
          return true;
        }
      );
    });
  }

  function processSales(sales) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const todayDay = now.getDate();

    let monthTotalLocal = 0;
    let yearTotalLocal = 0;
    let monthSalesCountLocal = 0;
    let todayTotalLocal = 0;

    // mapa: "YYYY-M" -> total para o gráfico
    const monthlyMap = {};

    // mapa por produto para Top 10
    // product_id -> { id, name, totalQty, totalAmount }
    const productMap = {};

    sales.forEach(sale => {
      if (!sale.sale_date) return;

      const d = new Date(sale.sale_date);
      if (isNaN(d.getTime())) return;

      const amount = (sale.price || 0) * (sale.qty || 0);
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      const key = `${y}-${m}`;

      // soma por mês (gráfico)
      monthlyMap[key] = (monthlyMap[key] || 0) + amount;

      // totais do ano atual
      if (y === currentYear) {
        yearTotalLocal += amount;
      }

      // totais do mês atual
      if (y === currentYear && m === currentMonth) {
        monthTotalLocal += amount;
        monthSalesCountLocal += 1;
      }

      // total de hoje
      if (y === currentYear && m === currentMonth && day === todayDay) {
        todayTotalLocal += amount;
      }

      // top produtos (por quantidade)
      const pid = sale.product_id ?? `no-id-${sale.id}`;
      const pname = sale.product_name || "Produto removido";

      if (!productMap[pid]) {
        productMap[pid] = {
          id: pid,
          name: pname,
          totalQty: 0,
          totalAmount: 0,
        };
      }

      productMap[pid].totalQty += sale.qty || 0;
      productMap[pid].totalAmount += amount;
    });

    setMonthTotal(monthTotalLocal);
    setYearTotal(yearTotalLocal);
    setMonthSalesCount(monthSalesCountLocal);
    setTodayTotal(todayTotalLocal);

    // montar últimos 6 meses para o gráfico
    const labels = [];
    const data = [];
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${m}`;
      const label = `${monthNames[m]}/${String(y).slice(-2)}`;
      labels.push(label);
      data.push(monthlyMap[key] || 0);
    }

    setChartLabels(labels);
    setChartData(data);

    // Top 10 produtos mais vendidos (por quantidade)
    const top = Object.values(productMap)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 10);

    setTopProducts(top);
  }

  function formatCurrency(value) {
    return value
      .toFixed(2)
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 24,
        backgroundColor: "#f2f2f2",
        flexGrow: 1,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Dashboard de Vendas
      </Text>

      {/* Cards de resumo */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
        <View
          style={{
            flexBasis: "48%",
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 10,
            marginBottom: 8,
            marginRight: "4%",
          }}
        >
          <Text style={{ fontSize: 12, color: "#555" }}>Faturamento do mês</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 4 }}>
            R$ {formatCurrency(monthTotal)}
          </Text>
        </View>

        <View
          style={{
            flexBasis: "48%",
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 10,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: "#555" }}>Faturamento do ano</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 4 }}>
            R$ {formatCurrency(yearTotal)}
          </Text>
        </View>

        <View
          style={{
            flexBasis: "48%",
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 10,
            marginBottom: 8,
            marginRight: "4%",
          }}
        >
          <Text style={{ fontSize: 12, color: "#555" }}>Vendas no mês</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 4 }}>
            {monthSalesCount}
          </Text>
        </View>

        <View
          style={{
            flexBasis: "48%",
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 10,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: "#555" }}>Total vendido hoje</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 4 }}>
            R$ {formatCurrency(todayTotal)}
          </Text>
        </View>
      </View>

      {/* Gráfico de barras */}
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
        Faturamento últimos 6 meses
      </Text>

      {chartData.length === 0 ? (
        <Text style={{ color: "#555", marginBottom: 16 }}>
          Ainda não há vendas suficientes para montar o gráfico.
        </Text>
      ) : (
        <BarChart
          data={{
            labels: chartLabels,
            datasets: [{ data: chartData }],
          }}
          width={screenWidth - 32}
          height={220}
          fromZero
          showValuesOnTopOfBars
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(10, 132, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForBackgroundLines: {
              strokeDasharray: "",
              stroke: "#eee",
            },
          }}
          style={{
            borderRadius: 10,
            marginBottom: 16,
          }}
        />
      )}

      {/* Top 10 Produtos mais vendidos */}
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
        Top 10 produtos mais vendidos
      </Text>

      {topProducts.length === 0 ? (
        <Text style={{ color: "#555" }}>
          Ainda não há vendas suficientes para montar o ranking.
        </Text>
      ) : (
        topProducts.map((p, index) => (
          <View
            key={p.id ?? index}
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 10,
              marginBottom: 6,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: "#0a84ff",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {index + 1}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700" }} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={{ fontSize: 12, color: "#555" }}>
                Quantidade vendida: {p.totalQty}
              </Text>
              <Text style={{ fontSize: 12, color: "#555" }}>
                Faturamento: R$ {formatCurrency(p.totalAmount)}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
