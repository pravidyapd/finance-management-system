
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getAllIncomes } from "../../services/incomeService";
import { getAllExpenses } from "../../services/expenseService";

interface ChartItem {
  month: string;
  income: number;
  expenses: number;
}

function IncomeExpenseChart() {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        setError("");

        const [incomes, expenses] = await Promise.all([
          getAllIncomes(),
          getAllExpenses(),
        ]);

        const today = new Date();
        const months: ChartItem[] = [];

        for (let i = 5; i >= 0; i--) {
          const date = new Date(
            today.getFullYear(),
            today.getMonth() - i,
            1
          );

          const year = date.getFullYear();
          const monthNumber = String(date.getMonth() + 1).padStart(2, "0");

          const monthIncomes = incomes
            .filter((item) => {
              const itemDate = item.date?.slice(0, 7);
              return itemDate === `${year}-${monthNumber}`;
            })
            .reduce((total, item) => total + Number(item.amount || 0), 0);

          const monthExpenses = expenses
            .filter((item) => {
              const itemDate = item.date?.slice(0, 7);
              return itemDate === `${year}-${monthNumber}`;
            })
            .reduce((total, item) => total + Number(item.amount || 0), 0);

          months.push({
            month: date.toLocaleString("en-IN", { month: "short" }),
            income: monthIncomes,
            expenses: monthExpenses,
          });
        }

        setChartData(months);
      } catch (err) {
        console.error("Failed to load chart data:", err);
        setError("Unable to load chart data.");
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Income vs Expenses
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Monthly financial comparison
        </p>
      </div>

      {loading ? (
        <div className="flex h-80 items-center justify-center text-sm text-slate-500">
          Loading chart data...
        </div>
      ) : error ? (
        <div className="flex h-80 items-center justify-center text-sm text-red-500">
          {error}
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />

              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />

              <Legend />

              <Bar
                dataKey="income"
                name="Income"
                fill="#10b981"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#f87171"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default IncomeExpenseChart;
