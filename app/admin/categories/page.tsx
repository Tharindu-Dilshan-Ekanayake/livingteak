"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import InputField from "@/components/InputField";
import toast from "react-hot-toast";

type Category = {
  _id: string;
  name: string;
  count: number;
};

type ModalMode = "create" | "edit";

type CategoriesResponse = {
  items: Category[];
};

type IconProps = { className?: string };

function IconX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selected, setSelected] = useState<Category | null>(null);
  const [name, setName] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/categories", { cache: "no-store" });
      const data: CategoriesResponse = await response.json();
      if (!response.ok) {
        throw new Error((data as unknown as { error?: string })?.error ?? "Failed to load categories");
      }
      setCategories(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(term));
  }, [categories, query]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelected(null);
    setName("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setModalMode("edit");
    setSelected(category);
    setName(category.name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setName("");
  };

  const openDeleteModal = (category: Category) => {
    setDeleteTarget(category);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setIsDeleteModalOpen(false);
  };

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedName = name.trim();
    if (!parsedName) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        modalMode === "edit" && selected?._id
          ? `/api/categories/${selected._id}`
          : "/api/categories";
      const method = modalMode === "edit" ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: parsedName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to save category");
      }

      toast.success(modalMode === "edit" ? "Category updated" : "Category created");
      closeModal();
      await loadCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/categories/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to delete category");
      }
      toast.success("Category deleted");
      closeDeleteModal();
      await loadCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <AdminHeader label="Categories" />
      </header>

      <section className="flex flex-col gap-4 rounded-none border-x-0 border-y border-zinc-200 bg-white p-4 shadow-none md:rounded-2xl md:border md:p-6 md:shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-sm">
            <InputField
              label="Search"
              name="search"
              placeholder="Search categories..."
              value={query}
              onChange={setQuery}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 md:px-5 md:text-sm"
            >
              Add new category
            </button>
            <button
              type="button"
              onClick={() => void loadCategories()}
              className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 md:px-5 md:text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              No categories found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((category) => (
                <div
                  key={category._id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {category.name}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        {category.count} items
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        aria-label="Edit"
                        title="Edit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500"
                      >
                        <IconPencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(category)}
                        aria-label="Delete"
                        title="Delete"
                        disabled={category.count > 0}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="hidden overflow-x-auto rounded-2xl border border-zinc-200 md:block">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Items
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-zinc-500">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-zinc-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filtered.map((category) => (
                  <tr key={category._id} className="align-middle">
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {category.count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(category)}
                          aria-label="Edit"
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500"
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(category)}
                          aria-label="Delete"
                          title="Delete"
                          disabled={category.count > 0}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
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
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
            className="fixed inset-0 bg-black/40"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
                  {modalMode === "edit" ? "Edit" : "Add New"}
                </p>
                <h2 className="text-2xl font-semibold">Category</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                title="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={saveCategory} className="mt-6 flex flex-col gap-4">
              <InputField
                label="Category name"
                name="modal_category"
                placeholder="Outdoor"
                value={name}
                onChange={setName}
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Saving..." : modalMode === "edit" ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isDeleteModalOpen ? (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            className="fixed inset-0 bg-black/40"
            onClick={closeDeleteModal}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-red-600">
                  Confirm
                </p>
                <h3 className="text-xl font-semibold text-zinc-900">Delete category</h3>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                aria-label="Close"
                title="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm text-zinc-600">
              Are you sure you want to delete <span className="font-semibold text-zinc-900">{deleteTarget?.name}</span>?
            </p>
            {deleteTarget?.count ? (
              <p className="mt-2 text-sm text-red-600">
                This category has {deleteTarget.count} items. Remove them first.
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={loading || Boolean(deleteTarget?.count)}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={loading}
                className="rounded-full bg-zinc-100 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
