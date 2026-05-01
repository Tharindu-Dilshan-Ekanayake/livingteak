"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductsSet, { type ProductCardItem } from "@/components/ProductsSet";

const PAGE_SIZE = 12;

type ProductsPageResponse = {
  items: Array<{
    _id: string;
    name: string;
    price: number;
    description?: string;
    category?: string;
    images?: string[];
    active?: boolean;
  }>;
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

type CategoriesResponse = {
  items: Array<{ name?: string }>;
};

export default function ProductsSection() {
  const [items, setItems] = useState<ProductCardItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const hasPagedRef = useRef(false);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const scrollToProducts = () => {
    const section = document.getElementById("products");
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const loadProducts = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          params.set("page", String(page));
          params.set("limit", String(PAGE_SIZE));
          params.set("active", "true");
          if (trimmedQuery) params.set("q", trimmedQuery);
          if (category !== "all") params.set("category", category);

          const response = await fetch(`/api/products?${params.toString()}`, {
            cache: "no-store",
          });
          const data = (await response.json()) as ProductsPageResponse;
          if (!response.ok) {
            throw new Error((data as unknown as { error?: string })?.error ?? "Failed to load products");
          }

          const mapped = (Array.isArray(data?.items) ? data.items : []).map((product) => ({
            id: product._id,
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            imageUrl: product.images?.[0],
            active: product.active !== false,
          }));

          setItems(mapped);
          setTotalPages(typeof data?.totalPages === "number" ? data.totalPages : 1);
        } catch {
          setItems([]);
          setTotalPages(1);
        } finally {
          setLoading(false);
        }
      };

      void loadProducts();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [page, trimmedQuery, category]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories?active=true", {
          cache: "no-store",
        });
        const data = (await response.json()) as CategoriesResponse;
        if (!response.ok) {
          throw new Error((data as unknown as { error?: string })?.error ?? "Failed to load categories");
        }
        const names = Array.isArray(data?.items)
          ? data.items
              .map((item) => (typeof item?.name === "string" ? item.name : ""))
              .filter(Boolean)
          : [];
        setCategories(names);
      } catch {
        setCategories([]);
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    if (!hasPagedRef.current) return;
    scrollToProducts();
  }, [page]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="border border-emerald-400 rounded-lg px-4 py-1">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Products</h2>
          
        </div>

        <div className="flex w-full flex-col gap-3 md:max-w-lg md:flex-row md:items-end">
          <div className="w-full">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              Search
            </label>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-emerald-400"
            />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              Category
            </label>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none transition focus:border-emerald-400"
            >
              <option value="all">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/60">
          Loading products...
        </div>
      ) : (
        <ProductsSet items={items} emptyMessage="No active products found." />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => {
              hasPagedRef.current = true;
              setPage((prev) => Math.max(1, prev - 1));
            }}
            className="rounded-full border border-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => {
              hasPagedRef.current = true;
              setPage((prev) => Math.min(totalPages, prev + 1));
            }}
            className="rounded-full border border-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
