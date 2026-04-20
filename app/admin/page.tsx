"use client";

import AdminHeader from "@/components/AdminHeader";

export default function AdminDashboard() {
  return (
    <div>
      <header>
        <AdminHeader label="Dashboard" />
      </header>
      <main className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600"> 
            Total Sales
          </p>
          <h1 className="text-2xl font-semibold">$12,345</h1>
          <p className="text-sm text-zinc-500">Total sales for the current month.</p>
        </div>
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Total Orders
          </p>
          <h1 className="text-2xl font-semibold">123</h1>
          <p className="text-sm text-zinc-500">Total orders for the current month.</p>
        </div>
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Total Customers
          </p>
          <h1 className="text-2xl font-semibold">45</h1>
          <p className="text-sm text-zinc-500">Total customers for the current month.</p>
        </div>
      </main>
    </div>
  );
}
