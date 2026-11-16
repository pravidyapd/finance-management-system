
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CreditCard,
  IndianRupee,
  Clock,
  CheckCircle,
} from "lucide-react";

import {
  getAllPayments,
  createPayment,
  updatePayment,
  deletePayment,
  type Payment as ApiPayment,
} from "../services/paymentService";

type PaymentMethod = "Cash" | "UPI" | "Bank Transfer" | "Card";

interface Payment {
  id: number;
  invoiceNumber: string;
  client: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  method: PaymentMethod;
}

const emptyForm = {
  invoiceNumber: "",
  client: "",
  date: new Date().toISOString().split("T")[0],
  dueDate: "",
  amount: "",
  paidAmount: "",
  method: "UPI" as PaymentMethod,
};

function getStatus(payment: Payment) {
  if (payment.paidAmount === 0) return "Pending";
  if (payment.paidAmount >= payment.amount) return "Paid";
  return "Partially Paid";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllPayments();

      setPayments(
        data.map((payment: ApiPayment) => ({
          id: payment.id!,
          invoiceNumber: payment.invoiceNumber,
          client: payment.clientName,
          date: payment.date,
          dueDate: payment.dueDate,
          amount: Number(payment.amount),
          paidAmount: Number(payment.paidAmount ?? 0),
          method: payment.paymentMethod as PaymentMethod,
        }))
      );
    } catch (err) {
      console.error("Error loading payments:", err);
      setError("Unable to load payment records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const totalReceived = payments.reduce(
    (sum, payment) => sum + payment.paidAmount,
    0
  );

  const outstanding = totalAmount - totalReceived;

  const paidCount = payments.filter(
    (payment) => getStatus(payment) === "Paid"
  ).length;

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        payment.client.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || getStatus(payment) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (payment: Payment) => {
    setEditingId(payment.id);
    setFormData({
      invoiceNumber: payment.invoiceNumber,
      client: payment.client,
      date: payment.date,
      dueDate: payment.dueDate,
      amount: String(payment.amount),
      paidAmount: String(payment.paidAmount),
      method: payment.method,
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amount = Number(formData.amount);
    const paidAmount = Number(formData.paidAmount);

    if (!formData.invoiceNumber.trim() || !formData.client.trim()) {
      setError("Please enter invoice number and client name.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Total amount must be greater than zero.");
      return;
    }

    if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > amount) {
      setError("Paid amount cannot exceed the total amount.");
      return;
    }

    const paymentData: ApiPayment = {
      invoiceNumber: formData.invoiceNumber.trim(),
      clientName: formData.client.trim(),
      amount,
      paidAmount,
      date: formData.date,
      dueDate: formData.dueDate,
      paymentMethod: formData.method,
      status:
        paidAmount === 0
          ? "Pending"
          : paidAmount >= amount
            ? "Paid"
            : "Partially Paid",
    };

    try {
      setError("");

      if (editingId !== null) {
        await updatePayment(editingId, paymentData);
      } else {
        await createPayment(paymentData);
      }

      await fetchPayments();

      setIsModalOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error("Error saving payment:", err);
      setError("Unable to save payment. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await deletePayment(id);
      await fetchPayments();
    } catch (err) {
      console.error("Error deleting payment:", err);
      setError("Unable to delete payment. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track received payments and outstanding balances.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Payments</p>
            <CreditCard size={20} className="text-blue-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {payments.length}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Received</p>
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-emerald-600">
            {formatCurrency(totalReceived)}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Outstanding</p>
            <Clock size={20} className="text-orange-500" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-orange-600">
            {formatCurrency(outstanding)}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Fully Paid</p>
            <IndianRupee size={20} className="text-blue-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {paidCount}
          </h2>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search invoice or client..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {error && !isModalOpen && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <span>{error}</span>
          <button onClick={fetchPayments} className="font-medium underline">
            Retry
          </button>
        </div>
      )}

      {/* Payments Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Invoice</th>
                <th className="px-5 py-4 font-semibold">Client</th>
                <th className="px-5 py-4 font-semibold">Due Date</th>
                <th className="px-5 py-4 font-semibold">Total</th>
                <th className="px-5 py-4 font-semibold">Received</th>
                <th className="px-5 py-4 font-semibold">Balance</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => {
                  const status = getStatus(payment);
                  const balance = payment.amount - payment.paidAmount;

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {payment.invoiceNumber}
                        <p className="mt-1 text-xs font-normal text-slate-400">
                          {payment.date}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {payment.client}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {payment.dueDate}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="px-5 py-4 text-emerald-700">
                        {formatCurrency(payment.paidAmount)}
                      </td>

                      <td className="px-5 py-4 text-orange-600">
                        {formatCurrency(balance)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                            status === "Paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : status === "Pending"
                                ? "bg-red-50 text-red-600"
                                : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(payment)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit payment"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => handleDelete(payment.id)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            title="Delete payment"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId !== null ? "Edit Payment" : "Add New Payment"}
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Invoice Number *
                </label>
                <input
                  required
                  value={formData.invoiceNumber}
                  onChange={(event) =>
                    setFormData({ ...formData, invoiceNumber: event.target.value })
                  }
                  placeholder="INV-004"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Client Name *
                </label>
                <input
                  required
                  value={formData.client}
                  onChange={(event) =>
                    setFormData({ ...formData, client: event.target.value })
                  }
                  placeholder="Enter client name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Payment Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(event) =>
                      setFormData({ ...formData, date: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Due Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.dueDate}
                    onChange={(event) =>
                      setFormData({ ...formData, dueDate: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Total Amount (₹) *
                  </label>
                  <input
                    required
                    min="1"
                    type="number"
                    value={formData.amount}
                    onChange={(event) =>
                      setFormData({ ...formData, amount: event.target.value })
                    }
                    placeholder="25000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Amount Paid (₹) *
                  </label>
                  <input
                    required
                    min="0"
                    type="number"
                    value={formData.paidAmount}
                    onChange={(event) =>
                      setFormData({ ...formData, paidAmount: event.target.value })
                    }
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Payment Method *
                </label>
                <select
                  value={formData.method}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      method: event.target.value as PaymentMethod,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  {editingId !== null ? "Save Changes" : "Add Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;
