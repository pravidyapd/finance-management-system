
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  TrendingUp,
  IndianRupee,
} from "lucide-react";

import {
  getAllIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../services/incomeService";

import type { Income } from "../services/incomeService";

interface IncomeRecord {
  id: number;
  description: string;
  category: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: "Received" | "Pending";
}

const emptyForm = {
  description: "",
  category: "Client Payment",
  date: "",
  amount: "",
  paymentMethod: "Bank Transfer",
  status: "Received" as "Received" | "Pending",
};

function IncomePage() {
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Convert backend data into frontend records
  const mapIncome = (item: Income): IncomeRecord => ({
    id: item.id ?? 0,
    description: item.description || item.source || "",
    category: item.category || "Other",
    date: item.date,
    amount: Number(item.amount),
    paymentMethod: item.paymentMethod || "Bank Transfer",
    status: item.status || "Received",
  });

  // Fetch income records
  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllIncomes();
        setIncome(data.map(mapIncome));
      } catch (err) {
        console.error("Failed to fetch incomes:", err);
        setError("Unable to load income records. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncomes();
  }, []);

  // Summary calculations
  const totalIncome = useMemo(
    () =>
      income
        .filter((item) => item.status === "Received")
        .reduce((total, item) => total + item.amount, 0),
    [income]
  );

  const pendingIncome = useMemo(
    () =>
      income
        .filter((item) => item.status === "Pending")
        .reduce((total, item) => total + item.amount, 0),
    [income]
  );

  // Search and filter
  const filteredIncome = useMemo(() => {
    return income.filter((item) => {
      const matchesSearch = item.description
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [income, search, statusFilter]);

  // Open add modal
  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (item: IncomeRecord) => {
    setEditingId(item.id);

    setForm({
      description: item.description,
      category: item.category,
      date: item.date,
      amount: String(item.amount),
      paymentMethod: item.paymentMethod,
      status: item.status,
    });

    setShowModal(true);
  };

  // Add or update income
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setError("");

      const record: Income = {
        source: form.description.trim(),
        description: form.description.trim(),
        category: form.category,
        date: form.date,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        status: form.status,
      };

      if (editingId !== null) {
        const updated = await updateIncome(editingId, record);

        setIncome((prev) =>
          prev.map((item) =>
            item.id === editingId ? mapIncome(updated) : item
          )
        );
      } else {
        const created = await createIncome(record);

        setIncome((prev) => [mapIncome(created), ...prev]);
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      console.error("Failed to save income:", err);
      setError("Unable to save income. Please try again.");
    }
  };

  // Delete income
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this income record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteIncome(id);

      setIncome((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete income:", err);
      setError("Unable to delete income. Please try again.");
    }
  };

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Income
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage all your income records.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add Income
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Received Income
            </p>
            <TrendingUp className="text-emerald-600" size={22} />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {formatCurrency(totalIncome)}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Total received from all records
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Pending Income
            </p>
            <IndianRupee className="text-amber-600" size={22} />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {formatCurrency(pendingIncome)}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Amount yet to be received
          </p>
        </div>
      </div>

      {/* Income Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Search and Filter */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Income Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your income transactions.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <Search size={17} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search income..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm outline-none sm:w-44"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Received">Received</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Payment Method</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Loading income records...
                  </td>
                </tr>
              ) : filteredIncome.length > 0 ? (
                filteredIncome.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                      {item.description}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {item.category}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN")}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {item.paymentMethod}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-emerald-600">
                      {formatCurrency(item.amount)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.status === "Received"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit"
                          className="text-slate-500 hover:text-emerald-600"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          className="text-slate-500 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No income records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
          Showing {filteredIncome.length} of {income.length} records
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId !== null ? "Edit Income" : "Add Income"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Enter income description"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option>Client Payment</option>
                    <option>Freelance</option>
                    <option>Consultation</option>
                    <option>Sales</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Amount (₹)
                  </label>

                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Date
                  </label>

                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Payment Method
                  </label>

                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option>Bank Transfer</option>
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Credit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "Received" | "Pending",
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  {editingId !== null ? "Save Changes" : "Add Income"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default IncomePage;
