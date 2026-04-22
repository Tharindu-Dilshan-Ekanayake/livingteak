"use client";

import { useEffect, useState, useTransition } from "react";
import type { AdminDashboardData } from "@/lib/admin-dashboard";

type DurationKey = keyof AdminDashboardData["topProducts"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function maxPointValue(points: Array<{ value: number }>) {
  return Math.max(...points.map((point) => point.value), 1);
}

function formatMonthLabel(month: number) {
  return new Date(2000, month - 1, 1).toLocaleString("en-US", {
    month: "short",
  });
}

function ChartCard({
  title,
  subtitle,
  total,
  tone,
  points,
}: {
  title: string;
  subtitle: string;
  total: number;
  tone: "emerald" | "amber" | "sky";
  points: Array<{ label: string; value: number }>;
}) {
  const peak = maxPointValue(points);
  const toneClasses = {
    emerald: {
      badge: "bg-emerald-100 text-emerald-700",
      bar: "from-emerald-400 via-emerald-500 to-teal-500",
      dot: "bg-emerald-500",
    },
    amber: {
      badge: "bg-amber-100 text-amber-700",
      bar: "from-amber-400 via-orange-500 to-amber-600",
      dot: "bg-amber-500",
    },
    sky: {
      badge: "bg-sky-100 text-sky-700",
      bar: "from-sky-400 via-cyan-500 to-blue-500",
      dot: "bg-sky-500",
    },
  }[tone];

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{title}</p>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses.badge}`}>
          {formatCurrency(total)}
        </span>
      </div>

      <div className="mt-6 flex h-52 items-end gap-2 sm:gap-3">
        {points.map((point) => {
          const height = Math.max((point.value / peak) * 100, point.value > 0 ? 12 : 6);

          return (
            <div
              key={point.label}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-3"
            >
              <p className="text-[10px] font-semibold text-zinc-400 sm:text-xs">
                {point.value > 0 ? formatCurrency(point.value) : "0"}
              </p>
              <div className="flex h-36 w-full items-end rounded-full bg-zinc-100/80 p-1">
                <div
                  className={`w-full rounded-full bg-gradient-to-t ${toneClasses.bar} transition-all`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${toneClasses.dot}`} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
                  {point.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusCard({
  label,
  count,
  accent,
  hint,
}: {
  label: string;
  count: number;
  accent: string;
  hint: string;
}) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {label}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-zinc-900">{count}</h2>
        </div>
        <span className={`h-14 w-14 rounded-2xl ${accent}`} />
      </div>
      <p className="mt-4 text-sm text-zinc-500">{hint}</p>
    </article>
  );
}

function TimelineSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  options: Array<{ value: number; label: string }>;
}) {
  return (
    <label className="flex min-w-[120px] flex-1 flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none focus:border-emerald-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdminDashboardView({
  dashboard: initialDashboard,
}: {
  dashboard: AdminDashboardData;
}) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [topSellingDuration, setTopSellingDuration] = useState<DurationKey>("date");
  const [selectedYear, setSelectedYear] = useState(initialDashboard.selectedDate.year);
  const [selectedMonth, setSelectedMonth] = useState(initialDashboard.selectedDate.month);
  const [selectedTopSellingDay, setSelectedTopSellingDay] = useState(
    initialDashboard.selectedDate.day
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();

    startTransition(() => {
      void (async () => {
        try {
          setError(null);
          const searchParams = new URLSearchParams();
          searchParams.set("year", String(selectedYear));
          searchParams.set("month", String(selectedMonth));
          searchParams.set("day", String(selectedTopSellingDay));
          const response = await fetch(`/api/admin/dashboard?${searchParams.toString()}`, {
            cache: "no-store",
            signal: controller.signal,
          });
          const data = (await response.json()) as AdminDashboardData | { error?: string };

          if (!response.ok) {
            throw new Error(
              "error" in data && typeof data.error === "string"
                ? data.error
                : "Failed to load dashboard"
            );
          }

          setDashboard(data as AdminDashboardData);
          setSelectedTopSellingDay((current) =>
            Math.min(
              current,
              (data as AdminDashboardData).availableFilters.days[
                (data as AdminDashboardData).availableFilters.days.length - 1
              ] ?? current
            )
          );
        } catch (fetchError) {
          if (controller.signal.aborted) return;
          setError(
            fetchError instanceof Error ? fetchError.message : "Failed to load dashboard"
          );
        }
      })();
    });

    return () => controller.abort();
  }, [selectedYear, selectedMonth, selectedTopSellingDay]);

  const topProducts = dashboard.topProducts[topSellingDuration];
  const topProductPeak = Math.max(...topProducts.map((item) => item.quantity), 1);

  const yearOptions = dashboard.availableFilters.years.map((year) => ({
    value: year,
    label: String(year),
  }));
  const monthOptions = dashboard.availableFilters.months.map((month) => ({
    value: month,
    label: formatMonthLabel(month),
  }));
  const dayOptions = dashboard.availableFilters.days.map((day) => ({
    value: day,
    label: String(day),
  }));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
              Timeline Filter
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
              View current and past dashboard performance
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Choose a year and month for income analysis. Top selling items can use a specific date, month, or year.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TimelineSelect
              label="Year"
              value={selectedYear}
              onChange={setSelectedYear}
              options={yearOptions}
            />
            <TimelineSelect
              label="Month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={monthOptions}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-zinc-100 px-4 py-2 font-semibold text-zinc-700">
            Selected month: {dashboard.selectedDate.year}-{String(dashboard.selectedDate.month).padStart(2, "0")}
          </span>
          {isPending ? (
            <span className="rounded-full bg-amber-50 px-4 py-2 font-semibold text-amber-700">
              Updating dashboard...
            </span>
          ) : null}
          {error ? (
            <span className="rounded-full bg-red-50 px-4 py-2 font-semibold text-red-700">
              {error}
            </span>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          label="Done Projects"
          count={dashboard.projectCounts.done}
          accent="bg-emerald-100"
          hint="Completed orders that are fully closed."
        />
        <StatusCard
          label="Delivering Projects"
          count={dashboard.projectCounts.ongoing}
          accent="bg-sky-100"
          hint="Orders currently marked as delivering."
        />
        <StatusCard
          label="Pending Projects"
          count={dashboard.projectCounts.pending}
          accent="bg-amber-100"
          hint="New orders waiting for work to begin."
        />
        <StatusCard
          label="Processing Projects"
          count={dashboard.projectCounts.processing}
          accent="bg-violet-100"
          hint="Orders in active internal processing."
        />
      </section>

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.35fr_0.95fr]">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard
            title="Weekly Income"
            subtitle={`Daily revenue for the week inside ${dashboard.selectedDate.year}-${String(
              dashboard.selectedDate.month
            ).padStart(2, "0")}`}
            total={dashboard.income.weeklyTotal}
            tone="emerald"
            points={dashboard.income.weekly}
          />
          <ChartCard
            title="Monthly Income"
            subtitle={`Week-by-week revenue for ${formatMonthLabel(
              dashboard.selectedDate.month
            )} ${dashboard.selectedDate.year}`}
            total={dashboard.income.monthlyTotal}
            tone="amber"
            points={dashboard.income.monthly}
          />
          <div className="xl:col-span-2">
            <ChartCard
              title="Yearly Income"
              subtitle={`Monthly revenue across ${dashboard.selectedDate.year}`}
              total={dashboard.income.yearlyTotal}
              tone="sky"
              points={dashboard.income.yearly}
            />
          </div>
        </div>

        <div className="grid gap-6">
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Top Selling Items</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Ranked by sold quantity for the selected mode
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["date", "monthly", "yearly"] as DurationKey[]).map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setTopSellingDuration(duration)}
                    className={
                      "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition " +
                      (topSellingDuration === duration
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200")
                    }
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              {topSellingDuration === "date" ? (
                <TimelineSelect
                  label="Top Selling Date"
                  value={selectedTopSellingDay}
                  onChange={setSelectedTopSellingDay}
                  options={dayOptions}
                />
              ) : null}
              <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
                {topSellingDuration === "date"
                  ? `Showing items sold on ${dashboard.selectedDate.year}-${String(
                      dashboard.selectedDate.month
                    ).padStart(2, "0")}-${String(selectedTopSellingDay).padStart(2, "0")}`
                  : topSellingDuration === "monthly"
                    ? `Showing items sold in ${formatMonthLabel(
                        dashboard.selectedDate.month
                      )} ${dashboard.selectedDate.year}`
                    : `Showing items sold in ${dashboard.selectedDate.year}`}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {topProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-500">
                  No sold items found for this timeline.
                </div>
              ) : (
                topProducts.map((product) => (
                  <article
                    key={product.productId}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                          Rank #{product.rank}
                        </p>
                        <h3 className="mt-2 truncate text-lg font-semibold text-zinc-900">
                          {product.name}
                        </h3>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                        {product.quantity} items sold
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                        style={{
                          width: `${Math.max((product.quantity / topProductPeak) * 100, 18)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
                      <p>
                        Sold quantity:{" "}
                        <span className="font-semibold text-zinc-900">{product.quantity}</span>
                      </p>
                      <p>
                        Revenue:{" "}
                        <span className="font-semibold text-zinc-900">
                          {formatCurrency(product.revenue)}
                        </span>
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-zinc-950 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                  Unread Messages
                </p>
                <p className="mt-3 text-4xl font-semibold">{dashboard.totals.unreadMessages}</p>
                <p className="mt-2 text-sm text-zinc-300">
                  New contact inquiries waiting for a response.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  Paid Revenue
                </p>
                <p className="mt-3 text-3xl font-semibold text-zinc-900">
                  {formatCurrency(dashboard.totals.paidRevenue)}
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  Lifetime paid income across completed and paid orders.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
