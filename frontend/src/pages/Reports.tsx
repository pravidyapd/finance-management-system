
import { useEffect, useMemo, useState } from "react";
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
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  IndianRupee,
  FileText,
} from "lucide-react";

import { getAllIncomes } from "../services/incomeService";
import { getAllExpenses } from "../services/expenseService";

interface IncomeRecord {
  id?: number;
  source: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: string;
}

interface ExpenseRecord {
  id?: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: string;
}

interface Transaction {
  id: number;
  title: string;
  category: string;
  date: string;
  type: "Income" | "Expense";
  amount: number;
}

const months = [
  { value: "06", label: "June 2026" },
  { value: "07", label: "July 2026" },
  { value: "08", label: "August 2026" },
  { value: "09", label: "September 2026" },
  { value: "10", label: "October 2026" },
  { value: "11", label: "November 2026" },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function Reports() {
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("11");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError("");

        const [incomeData, expenseData] = await Promise.all([
          getAllIncomes(),
          getAllExpenses(),
        ]);

        setIncomes(incomeData);
        setExpenses(expenseData);
      } catch (err) {
        console.error("Error loading report data:", err);
        setError("Unable to load financial reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Prepare transactions for the selected month
  const selectedTransactions = useMemo<Transaction[]>(() => {
    const incomeTransactions: Transaction[] = incomes
      .filter((income) => income.date?.startsWith(`2026-${selectedMonth}`))
      .map((income, index) => ({
        id: income.id ?? index,
        title: income.source || income.description || "Income",
        category: income.category || "Income",
        date: income.date,
        type: "Income",
        amount: Number(income.amount) || 0,
      }));

    const expenseTransactions: Transaction[] = expenses
      .filter((expense) => expense.date?.startsWith(`2026-${selectedMonth}`))
      .map((expense, index) => ({
        id: expense.id ?? index,
        title: expense.description || "Expense",
        category: expense.category || "Expense",
        date: expense.date,
        type: "Expense",
        amount: Number(expense.amount) || 0,
      }));

    return [...incomeTransactions, ...expenseTransactions].sort(
      (a, b) => b.date.localeCompare(a.date)
    );
  }, [incomes, expenses, selectedMonth]);

  // Calculate selected month totals
  const incomeTransactions = selectedTransactions.filter(
    (transaction) => transaction.type === "Income"
  );

  const expenseTransactions = selectedTransactions.filter(
    (transaction) => transaction.type === "Expense"
  );

  const totalIncome = incomeTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const totalExpenses = expenseTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const netProfit = totalIncome - totalExpenses;

  // Prepare monthly chart data
  const monthlyData = useMemo(() => {
    return months.map((month) => {
      const monthIncomes = incomes
        .filter((income) => income.date?.startsWith(`2026-${month.value}`))
        .reduce((sum, income) => sum + (Number(income.amount) || 0), 0);

      const monthExpenses = expenses
        .filter((expense) =>
          expense.date?.startsWith(`2026-${month.value}`)
        )
        .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

      return {
        month: month.label.split(" ")[0],
        income: monthIncomes,
        expenses: monthExpenses,
      };
    });
  }, [incomes, expenses]);

  // Calculate expense breakdown by category
  const expenseBreakdown = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    expenseTransactions.forEach((transaction) => {
      const category = transaction.category || "Other";

      categoryTotals[category] =
        (categoryTotals[category] || 0) + transaction.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [expenseTransactions]);

  const incomeBreakdown = totalIncome;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Financial Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review your income, expenses, and financial performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FileText size={18} className="text-slate-500" />
          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Income</p>
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {loading ? "Loading..." : formatCurrency(totalIncome)}
          </h2>
          <p className="mt-2 text-xs text-slate-400">For selected month</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Expenses</p>
            <TrendingDown size={20} className="text-red-500" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {loading ? "Loading..." : formatCurrency(totalExpenses)}
          </h2>
          <p className="mt-2 text-xs text-slate-400">For selected month</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Net Profit</p>
            <Wallet size={20} className="text-blue-600" />
          </div>
          <h2
            className={`mt-3 text-2xl font-bold ${
              netProfit >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {loading ? "Loading..." : formatCurrency(netProfit)}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Income minus expenses
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Transactions</p>
            <IndianRupee size={20} className="text-purple-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {loading ? "Loading..." : selectedTransactions.length}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Recorded transactions
          </p>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Income vs Expenses
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Monthly financial comparison
          </p>
        </div>

        <div className="h-80 w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#059669"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#ef4444"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Income Breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Recorded income for selected month
          </p>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-slate-600">Total Income</span>
            <span className="font-semibold text-emerald-700">
              {formatCurrency(incomeBreakdown)}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: totalIncome > 0 ? "100%" : "0%" }}
            />
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total monthly income</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Expense Breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Recorded expenses by category for selected month
          </p>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="py-6 text-center text-sm text-slate-400">
                Loading expenses...
              </p>
            ) : expenseBreakdown.length > 0 ? (
              expenseBreakdown.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-slate-700">
                    {item.category}
                  </span>
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">
                No expense records for this month.
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total expenses</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Transaction Details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Income and expenses for the selected month
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : selectedTransactions.length > 0 ? (
                selectedTransactions.map((transaction) => (
                  <tr
                    key={`${transaction.type}-${transaction.id}`}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {transaction.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          transaction.type === "Income"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-semibold ${
                        transaction.type === "Income"
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "Income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No transactions found for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
