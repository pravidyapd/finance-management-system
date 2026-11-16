
import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import IncomeExpenseChart from "../components/dashboard/IncomeExpenseChart";

import { getAllIncomes } from "../services/incomeService";
import { getAllExpenses } from "../services/expenseService";
import { getAllPayments } from "../services/paymentService";

interface Transaction {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  status: string;
}

function Dashboard() {
  const [stats, setStats] = useState([
    {
      title: "Total Income",
      amount: "₹0",
      description: "Income this month",
      icon: TrendingUp,
      iconColor: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Total Expenses",
      amount: "₹0",
      description: "Expenses this month",
      icon: TrendingDown,
      iconColor: "bg-red-50 text-red-500",
    },
    {
      title: "Outstanding Payments",
      amount: "₹0",
      description: "Pending client payments",
      icon: Clock,
      iconColor: "bg-amber-50 text-amber-600",
    },
    {
      title: "Net Profit",
      amount: "₹0",
      description: "Income minus expenses",
      icon: Wallet,
      iconColor: "bg-blue-50 text-blue-600",
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [incomes, expenses, payments] = await Promise.all([
          getAllIncomes(),
          getAllExpenses(),
          getAllPayments(),
        ]);

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}`;

        const monthlyIncomes = incomes.filter(
          (item) => item.date?.slice(0, 7) === currentMonth
        );

        const monthlyExpenses = expenses.filter(
          (item) => item.date?.slice(0, 7) === currentMonth
        );

        const totalIncome = monthlyIncomes.reduce(
          (total, item) => total + Number(item.amount || 0),
          0
        );

        const totalExpenses = monthlyExpenses.reduce(
          (total, item) => total + Number(item.amount || 0),
          0
        );

        const outstandingPayments = payments.reduce((total, payment) => {
          const remaining =
            Number(payment.amount || 0) -
            Number(payment.paidAmount || 0);

          return total + Math.max(0, remaining);
        }, 0);

        const netProfit = totalIncome - totalExpenses;

        const formatCurrency = (amount: number) =>
          `₹${amount.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}`;

        setStats([
          {
            title: "Total Income",
            amount: formatCurrency(totalIncome),
            description: "Income this month",
            icon: TrendingUp,
            iconColor: "bg-emerald-50 text-emerald-600",
          },
          {
            title: "Total Expenses",
            amount: formatCurrency(totalExpenses),
            description: "Expenses this month",
            icon: TrendingDown,
            iconColor: "bg-red-50 text-red-500",
          },
          {
            title: "Outstanding Payments",
            amount: formatCurrency(outstandingPayments),
            description: "Remaining client payments",
            icon: Clock,
            iconColor: "bg-amber-50 text-amber-600",
          },
          {
            title: "Net Profit",
            amount: formatCurrency(netProfit),
            description: "Income minus expenses",
            icon: Wallet,
            iconColor: "bg-blue-50 text-blue-600",
          },
        ]);

        const incomeTransactions: Transaction[] = incomes.map((item) => ({
          id: `income-${item.id}`,
          title: item.source || item.description || "Income",
          category: item.category || "Income",
          date: item.date,
          amount: Number(item.amount || 0),
          type: "income",
          status: item.status === "Received" ? "Completed" : item.status,
        }));

        const expenseTransactions: Transaction[] = expenses.map((item) => ({
          id: `expense-${item.id}`,
          title: item.description || "Expense",
          category: item.category || "Expense",
          date: item.date,
          amount: Number(item.amount || 0),
          type: "expense",
          status: item.status === "Paid" ? "Completed" : item.status,
        }));

        const recentTransactions = [
          ...incomeTransactions,
          ...expenseTransactions,
        ]
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5);

        setTransactions(recentTransactions);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your finances.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading dashboard data...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      )}

      <IncomeExpenseChart />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Recent Transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest income and expenses
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-lg p-2 ${
                            transaction.type === "income"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowDownLeft size={18} />
                          ) : (
                            <ArrowUpRight size={18} />
                          )}
                        </div>
                        <span className="font-medium text-slate-700">
                          {transaction.title}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {transaction.category}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {transaction.date
                        ? new Date(
                            `${transaction.date.slice(0, 10)}T00:00:00`
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    <td
                      className={`whitespace-nowrap px-6 py-4 font-semibold ${
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      ₹{transaction.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          transaction.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {transaction.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
