import { connectMongoose } from "@/lib/mongoose";
import { Contact } from "@/models/Contact";
import Order from "@/models/Order";
import Product from "@/models/Product";

type OrderItem = {
  productId?: string;
  name?: string;
  price?: number;
  quantity?: number;
};

type OrderRecord = {
  subtotal?: number;
  orderStatus?: "pending" | "processing" | "delivering" | "completed";
  paymentStatus?: boolean;
  createdAt?: Date | string;
  items?: OrderItem[];
};

type ChartPoint = {
  label: string;
  value: number;
};

type RankedProduct = {
  rank: number;
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

type DurationKey = "date" | "monthly" | "yearly";

export type AdminDashboardFilters = {
  year?: number;
  month?: number;
  day?: number;
};

export type AdminDashboardData = {
  generatedAt: string;
  selectedDate: {
    year: number;
    month: number;
    day: number;
    isoDate: string;
  };
  availableFilters: {
    years: number[];
    months: number[];
    days: number[];
  };
  totals: {
    orders: number;
    activeProducts: number;
    unreadMessages: number;
    paidRevenue: number;
  };
  projectCounts: {
    done: number;
    ongoing: number;
    pending: number;
    processing: number;
  };
  income: {
    weekly: ChartPoint[];
    monthly: ChartPoint[];
    yearly: ChartPoint[];
    weeklyTotal: number;
    monthlyTotal: number;
    yearlyTotal: number;
  };
  topProducts: Record<DurationKey, RankedProduct[]>;
};

function asDate(value: Date | string | undefined) {
  const date = value ? new Date(value) : new Date(NaN);
  return Number.isNaN(date.getTime()) ? null : date;
}

function currencySafe(value: number | undefined) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, diff));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

function formatShortDay(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatWeekLabel(index: number) {
  return `W${index + 1}`;
}

function formatShortMonth(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function parseDashboardDate(filters: AdminDashboardFilters) {
  const now = new Date();
  const fallbackYear = now.getFullYear();
  const fallbackMonth = now.getMonth() + 1;
  const fallbackDay = now.getDate();

  const year =
    typeof filters.year === "number" && Number.isInteger(filters.year)
      ? filters.year
      : fallbackYear;
  const month =
    typeof filters.month === "number" && filters.month >= 1 && filters.month <= 12
      ? filters.month
      : fallbackMonth;
  const maxDay = new Date(year, month, 0).getDate();
  const day =
    typeof filters.day === "number" && filters.day >= 1 && filters.day <= maxDay
      ? filters.day
      : Math.min(fallbackDay, maxDay);

  return new Date(year, month - 1, day);
}

function parseDashboardMonth(filters: AdminDashboardFilters) {
  const now = new Date();
  const fallbackYear = now.getFullYear();
  const fallbackMonth = now.getMonth() + 1;

  const year =
    typeof filters.year === "number" && Number.isInteger(filters.year)
      ? filters.year
      : fallbackYear;
  const month =
    typeof filters.month === "number" && filters.month >= 1 && filters.month <= 12
      ? filters.month
      : fallbackMonth;

  return {
    year,
    month,
  };
}

function buildWeeklyIncome(orders: OrderRecord[], referenceDate: Date) {
  const weekStart = startOfWeek(referenceDate);
  const points: ChartPoint[] = Array.from({ length: 7 }, (_, index) => {
    const bucketStart = addDays(weekStart, index);
    const bucketEnd = addDays(bucketStart, 1);
    const value = orders.reduce((sum, order) => {
      const createdAt = asDate(order.createdAt);
      if (!createdAt) return sum;
      if (createdAt >= bucketStart && createdAt < bucketEnd) {
        return sum + currencySafe(order.subtotal);
      }
      return sum;
    }, 0);

    return { label: formatShortDay(bucketStart), value };
  });

  return points;
}

function buildMonthlyIncome(orders: OrderRecord[], referenceDate: Date) {
  const monthStart = startOfMonth(referenceDate);
  const nextMonthStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    1
  );
  const daysInMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0
  ).getDate();
  const weekCount = Math.ceil(daysInMonth / 7);

  const points: ChartPoint[] = Array.from({ length: weekCount }, (_, index) => {
    const bucketStart = addDays(monthStart, index * 7);
    const bucketEnd = index === weekCount - 1 ? nextMonthStart : addDays(bucketStart, 7);
    const value = orders.reduce((sum, order) => {
      const createdAt = asDate(order.createdAt);
      if (!createdAt) return sum;
      if (createdAt >= bucketStart && createdAt < bucketEnd) {
        return sum + currencySafe(order.subtotal);
      }
      return sum;
    }, 0);

    return { label: formatWeekLabel(index), value };
  });

  return points;
}

function buildYearlyIncome(orders: OrderRecord[], referenceDate: Date) {
  const yearStart = startOfYear(referenceDate);

  const points: ChartPoint[] = Array.from({ length: 12 }, (_, index) => {
    const bucketStart = new Date(yearStart.getFullYear(), index, 1);
    const bucketEnd = new Date(yearStart.getFullYear(), index + 1, 1);
    const value = orders.reduce((sum, order) => {
      const createdAt = asDate(order.createdAt);
      if (!createdAt) return sum;
      if (createdAt >= bucketStart && createdAt < bucketEnd) {
        return sum + currencySafe(order.subtotal);
      }
      return sum;
    }, 0);

    return { label: formatShortMonth(bucketStart), value };
  });

  return points;
}

function sumPoints(points: ChartPoint[]) {
  return points.reduce((sum, point) => sum + point.value, 0);
}

function filterOrdersBetween(orders: OrderRecord[], start: Date, end: Date) {
  return orders.filter((order) => {
    const createdAt = asDate(order.createdAt);
    return createdAt ? createdAt >= start && createdAt < end : false;
  });
}

function buildTopProducts(orders: OrderRecord[]) {
  const rankedMap = new Map<
    string,
    { productId: string; name: string; quantity: number; revenue: number }
  >();

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const productId = item.productId?.trim() || item.name?.trim() || "unknown-product";
      const name = item.name?.trim() || "Unnamed product";
      const quantity = Math.max(0, Number(item.quantity ?? 0));
      const revenue = Math.max(0, Number(item.price ?? 0) * quantity);
      const existing = rankedMap.get(productId);

      if (existing) {
        existing.quantity += quantity;
        existing.revenue += revenue;
        continue;
      }

      rankedMap.set(productId, {
        productId,
        name,
        quantity,
        revenue,
      });
    }
  }

  return Array.from(rankedMap.values())
    .sort((left, right) => {
      if (right.quantity !== left.quantity) {
        return right.quantity - left.quantity;
      }

      return right.revenue - left.revenue;
    })
    .slice(0, 4)
    .map((item, index) => ({
      rank: index + 1,
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      revenue: item.revenue,
    }));
}

function buildTopProductsByDuration(orders: OrderRecord[], referenceDate: Date) {
  const dayStart = startOfDay(referenceDate);
  const nextDayStart = addDays(dayStart, 1);
  const monthStart = startOfMonth(referenceDate);
  const nextMonthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
  const yearStart = startOfYear(referenceDate);
  const nextYearStart = new Date(referenceDate.getFullYear() + 1, 0, 1);

  return {
    date: buildTopProducts(filterOrdersBetween(orders, dayStart, nextDayStart)),
    monthly: buildTopProducts(filterOrdersBetween(orders, monthStart, nextMonthStart)),
    yearly: buildTopProducts(filterOrdersBetween(orders, yearStart, nextYearStart)),
  };
}

function buildAvailableYears(orders: OrderRecord[], referenceDate: Date) {
  const years = new Set<number>([referenceDate.getFullYear()]);

  for (const order of orders) {
    const createdAt = asDate(order.createdAt);
    if (createdAt) {
      years.add(createdAt.getFullYear());
    }
  }

  return Array.from(years).sort((left, right) => right - left);
}

function buildAvailableDays(referenceDate: Date) {
  const dayCount = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0
  ).getDate();

  return Array.from({ length: dayCount }, (_, index) => index + 1);
}

export async function getAdminDashboardData(
  filters: AdminDashboardFilters = {}
): Promise<AdminDashboardData> {
  await connectMongoose();

  const [ordersRaw, unreadMessages, activeProducts] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).lean<OrderRecord[]>(),
    Contact.countDocuments({ readStatus: false }),
    Product.countDocuments({ active: true }),
  ]);

  const orders = Array.isArray(ordersRaw) ? ordersRaw : [];
  const paidOrders = orders.filter(
    (order) => order.paymentStatus === true || order.orderStatus === "completed"
  );
  const selectedMonth = parseDashboardMonth(filters);
  const fallbackDay = new Date(
    selectedMonth.year,
    selectedMonth.month,
    0
  ).getDate();
  const requestedDay =
    typeof filters.day === "number" && filters.day >= 1 && filters.day <= fallbackDay
      ? filters.day
      : Math.min(new Date().getDate(), fallbackDay);
  const referenceDate = parseDashboardDate({
    year: selectedMonth.year,
    month: selectedMonth.month,
    day: requestedDay,
  });

  const weekly = buildWeeklyIncome(paidOrders, referenceDate);
  const monthly = buildMonthlyIncome(paidOrders, referenceDate);
  const yearly = buildYearlyIncome(paidOrders, referenceDate);

  return {
    generatedAt: new Date().toISOString(),
    selectedDate: {
      year: referenceDate.getFullYear(),
      month: referenceDate.getMonth() + 1,
      day: referenceDate.getDate(),
      isoDate: referenceDate.toISOString(),
    },
    availableFilters: {
      years: buildAvailableYears(paidOrders, referenceDate),
      months: Array.from({ length: 12 }, (_, index) => index + 1),
      days: buildAvailableDays(referenceDate),
    },
    totals: {
      orders: orders.length,
      activeProducts,
      unreadMessages,
      paidRevenue: paidOrders.reduce(
        (sum, order) => sum + currencySafe(order.subtotal),
        0
      ),
    },
    projectCounts: {
      done: orders.filter((order) => order.orderStatus === "completed").length,
      ongoing: orders.filter((order) => order.orderStatus === "delivering").length,
      pending: orders.filter((order) => order.orderStatus === "pending").length,
      processing: orders.filter((order) => order.orderStatus === "processing").length,
    },
    income: {
      weekly,
      monthly,
      yearly,
      weeklyTotal: sumPoints(weekly),
      monthlyTotal: sumPoints(monthly),
      yearlyTotal: sumPoints(yearly),
    },
    topProducts: buildTopProductsByDuration(paidOrders, referenceDate),
  };
}
