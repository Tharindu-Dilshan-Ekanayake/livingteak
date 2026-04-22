"use client";

import { useCallback, useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import InputField from "@/components/InputField";
import toast from "react-hot-toast";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderCustomer = {
  name: string;
  mobile: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
};

type Order = {
  _id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  orderStatus: "pending" | "processing" | "delivering" | "completed";
  paymentStatus: boolean;
  createdAt: string;
};

type ModalMode = "edit" | "view";
type IconProps = { className?: string };

function IconX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconEye({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

function IconPencil({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l4 4" />
    </svg>
  );
}

function IconTrash({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 11v7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l1 14h10l1-14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V4h6v3" />
    </svg>
  );
}

const parseDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "processing":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "delivering":
      return "text-purple-600 bg-purple-50 border-purple-200";
    default:
      return "text-amber-600 bg-amber-50 border-amber-200";
  }
};

export default function AdminOrdersPage() {
  const PAGE_SIZE = 9;

  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("view");
  const [selected, setSelected] = useState<Order | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  // Form states for editing
  const [orderStatus, setOrderStatus] = useState<Order["orderStatus"]>("pending");
  const [paymentStatus, setPaymentStatus] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const loadOrders = useCallback(async (nextPage: number, nextQuery: string, nextStatus: string) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(nextPage));
      searchParams.set("limit", String(PAGE_SIZE));
      if (nextQuery.trim()) {
        searchParams.set("q", nextQuery.trim());
      }
      if (nextStatus && nextStatus !== "all") {
        searchParams.set("status", nextStatus);
      }

      const response = await fetch(`/api/orders?${searchParams.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to load orders");
      }

      setOrders(Array.isArray(data?.items) ? data.items : []);
      setTotalPages(typeof data?.totalPages === "number" ? data.totalPages : 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [PAGE_SIZE]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadOrders(page, query, filterStatus);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [loadOrders, page, query, filterStatus]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const openViewModal = (order: Order) => {
    setModalMode("view");
    setSelected(order);
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setModalMode("edit");
    setSelected(order);
    setOrderStatus(order.orderStatus);
    setPaymentStatus(order.paymentStatus);
    setIsModalOpen(true);
  };

  const openDeleteModal = (order: Order) => {
    setDeleteTarget(order);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to update order");

      toast.success("Order updated successfully");
      closeModal();
      await loadOrders(page, query, filterStatus);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to delete order");

      toast.success("Order deleted");
      closeDeleteModal();
      await loadOrders(page, query, filterStatus);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <AdminHeader label="Orders" />
      </header>

      <section className="flex flex-col gap-4 rounded-none border-x-0 border-y border-zinc-200 bg-white p-4 shadow-none md:rounded-2xl md:border md:p-6 md:shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-sm">
            <InputField
              label="Search"
              name="search"
              placeholder="Search by customer name..."
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <div className="flex flex-col flex-1 sm:flex-none">
              <span className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Status Filter</span>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-full sm:w-40"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivering">Delivering</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => loadOrders(page, query, filterStatus)}
              className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 md:px-5 md:text-sm self-end h-10"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              Loading...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              No orders found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <div key={order._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-none">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{order.customer.name}</p>
                        <p className="text-xs text-zinc-500 mt-1">{parseDate(order.createdAt)}</p>
                      </div>
                      <p className="text-sm font-semibold text-zinc-900">LKR {order.subtotal.toFixed(2)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      {order.paymentStatus ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                          Unpaid
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-2 mt-3 pt-3 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => openViewModal(order)}
                        aria-label="View"
                        title="View"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500"
                      >
                        <IconEye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(order)}
                        aria-label="Edit"
                        title="Edit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500"
                      >
                        <IconPencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(order)}
                        aria-label="Delete"
                        title="Delete"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden overflow-x-auto rounded-2xl border border-zinc-200 md:block">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="sticky left-0 z-10 border-r border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Total Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Order Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Payment Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-zinc-500 text-center">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-zinc-500 text-center">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="align-middle hover:bg-zinc-50/50">
                    <td className="sticky left-0 z-10 border-r border-zinc-200 bg-white px-4 py-4">
                      <div>
                        <p className="font-semibold text-zinc-900">{order.customer.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{parseDate(order.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-600">
                      LKR {order.subtotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.paymentStatus ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(order)}
                          aria-label="View"
                          title="View"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500"
                        >
                          <IconEye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(order)}
                          aria-label="Edit"
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500"
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(order)}
                          aria-label="Delete"
                          title="Delete"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Box */}
        <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600 disabled:opacity-50 hover:bg-zinc-50 transition"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600 disabled:opacity-50 hover:bg-zinc-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Primary Modal (Edit/View) */}
      {isModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
                  {modalMode === "edit" ? "Update Status" : "Order Details"}
                </p>
                <h2 className="text-2xl font-bold text-zinc-900 mt-1">Order #{selected._id.slice(-6).toUpperCase()}</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-50 text-zinc-500 transition hover:bg-zinc-100"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-3 border-b pb-2">Customer Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-zinc-500">Name:</span> {selected.customer.name}</p>
                  <p><span className="font-medium text-zinc-500">Mobile:</span> {selected.customer.mobile}</p>
                  {selected.customer.email && <p><span className="font-medium text-zinc-500">Email:</span> {selected.customer.email}</p>}
                  <p><span className="font-medium text-zinc-500">City:</span> {selected.customer.city}</p>
                  <p><span className="font-medium text-zinc-500">Address:</span> {selected.customer.addressLine1} {selected.customer.addressLine2}</p>
                </div>
              </div>

              {/* Status Update Form OR Status View */}
              {modalMode === "edit" ? (
                <form id="edit-order-form" onSubmit={handleSave} className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-0 border-b pb-2">Update Order</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Order Status
                    </label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value as Order["orderStatus"])}
                      className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivering">Delivering</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus.toString()}
                      onChange={(e) => setPaymentStatus(e.target.value === "true")}
                      className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="false">Unpaid</option>
                      <option value="true">Paid</option>
                    </select>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3 border-b pb-2">Order Info</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Status</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider flex-shrink-0 ${getStatusColor(selected.orderStatus)}`}>
                        {selected.orderStatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Payment</span>
                      {selected.paymentStatus ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-600">Paid</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-600">Unpaid</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items Table */}
            <div className="mt-6 border-t border-zinc-100 pt-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Order Items</h3>
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-500">Product</th>
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-500">Qty</th>
                      <th className="px-4 py-2.5 text-right font-medium text-zinc-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {selected.items.map((item, idx) => (
                      <tr key={idx}>
                        
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">x{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-medium text-zinc-900">LKR {(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-zinc-50 border-t border-zinc-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right font-semibold text-zinc-900">Subtotal</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">LKR {selected.subtotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Actions Footer */}
            {modalMode === "edit" && (
              <div className="mt-8 flex justify-end gap-3 border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  form="edit-order-form"
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50 shadow-sm"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeDeleteModal}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4">
              <IconTrash className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Delete Order?</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Are you sure you want to delete this order for <span className="font-semibold text-zinc-700">{deleteTarget.customer.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
