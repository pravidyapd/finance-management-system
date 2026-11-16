
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

const transactions = [
  {
    id: 1,
    title: "Website Development",
    category: "Client Payment",
    date: "Nov 15, 2026",
    amount: 25000,
    type: "income",
    status: "Completed",
  },
  {
    id: 2,
    title: "Office Rent",
    category: "Office",
    date: "Nov 14, 2026",
    amount: 12000,
    type: "expense",
    status: "Completed",
  },
  {
    id: 3,
    title: "Mobile App Development",
    category: "Client Payment",
    date: "Nov 13, 2026",
    amount: 18000,
    type: "income",
    status: "Pending",
  },
  {
    id: 4,
    title: "Software Subscription",
    category: "Software",
    date: "Nov 12, 2026",
    amount: 2500,
    type: "expense",
    status: "Completed",
  },
  {
    id: 5,
    title: "UI Design Project",
    category: "Client Payment",
    date: "Nov 10, 2026",
    amount: 15000,
    type: "income",
    status: "Completed",
  },
];

function RecentTransactions() {
  return (
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

        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
          View All
        </button>
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
            {transactions.map((transaction) => (
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
                  {transaction.date}
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
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentTransactions;
