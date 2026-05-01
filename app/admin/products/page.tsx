"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import InputField from "@/components/InputField";
import toast from "react-hot-toast";

type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  category?: string;
  images?: string[];
  active?: boolean;
};

type ModalMode = "create" | "edit" | "view";

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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
      />
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

function IconPlus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function AdminProductsPage() {
  const PAGE_SIZE = 9;
  const MAX_IMAGES = 3;

  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selected, setSelected] = useState<Product | null>(null);
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const previews = useMemo(() => {
    return files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      for (const preview of previews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [previews]);

  type ProductsPageResponse = {
    items: Product[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };

  type CategoriesResponse = {
    items: Array<{ name?: string }>;
  };

  const loadProducts = useCallback(async (nextPage: number, nextQuery: string, nextCategory: string) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(nextPage));
      searchParams.set("limit", String(PAGE_SIZE));
      if (nextQuery.trim()) {
        searchParams.set("q", nextQuery.trim());
      }
      if (nextCategory !== "all") {
        searchParams.set("category", nextCategory);
      }

      const response = await fetch(`/api/products?${searchParams.toString()}`, {
        cache: "no-store",
      });

      const data: ProductsPageResponse = await response.json();
      if (!response.ok) {
        throw new Error((data as unknown as { error?: string })?.error ?? "Failed to load products");
      }

      setProducts(Array.isArray(data?.items) ? data.items : []);
      setTotalPages(typeof data?.totalPages === "number" ? data.totalPages : 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [PAGE_SIZE]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories", {
        cache: "no-store",
      });
      const data: CategoriesResponse = await response.json();
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
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadProducts(page, query, categoryFilter);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadProducts, page, query, categoryFilter]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setFiles([]);
    setExistingImages([]);
    setFullScreenImageUrl(null);
  };

  const openDeleteModal = (product: Product) => {
    setDeleteTarget(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelected(null);
    setName("");
    setPrice("");
    setDescription("");
    setCategory("");
    setFiles([]);
    setExistingImages([]);
    setActive(true);
    setIsModalOpen(true);
  };

  const openViewModal = (product: Product) => {
    setModalMode("view");
    setSelected(product);
    setName(product.name);
    setPrice(String(product.price));
    setDescription(product.description ?? "");
    setCategory(product.category ?? "");
    setFiles([]);
    setExistingImages(Array.isArray(product.images) ? product.images : []);
    setActive(product.active !== false);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode("edit");
    setSelected(product);
    setName(product.name);
    setPrice(String(product.price));
    setDescription(product.description ?? "");
    setCategory(product.category ?? "");
    setFiles([]);
    setExistingImages(Array.isArray(product.images) ? product.images : []);
    setActive(product.active !== false);
    setIsModalOpen(true);
  };

  const totalSelectedImagesCount = existingImages.length + files.length;

  const addOneImageFile = (file: File) => {
    if (totalSelectedImagesCount >= MAX_IMAGES) {
      toast.error(`You can add up to ${MAX_IMAGES} images`);
      return;
    }
    setFiles((prev) => [...prev, file].slice(0, Math.max(0, MAX_IMAGES - existingImages.length)));
  };

  const removeNewFileAtIndex = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImageAtIndex = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (files.length === 0) return [];

    const formData = new FormData();
    for (const file of files) {
      formData.append("images", file);
    }

    setUploading(true);
    try {
      const response = await fetch("/api/uploads/products", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Image upload failed");
      return Array.isArray(data?.urls) ? data.urls : [];
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedName = name.trim();
    const parsedDescription = description.trim();
    const parsedCategory = category.trim();
    const parsedPrice = Number(price);

    if (!parsedName) {
      toast.error("Product name is required");
      return;
    }

    if (!parsedDescription) {
      toast.error("Product description is required");
      return;
    }

    if (!parsedCategory) {
      toast.error("Product category is required");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Product price must be a number greater than or equal to 0");
      return;
    }

    if (modalMode === "create") {
      if (totalSelectedImagesCount < 1 || totalSelectedImagesCount > MAX_IMAGES) {
        toast.error(`Please select 1 to ${MAX_IMAGES} images`);
        return;
      }
    }

    if (modalMode !== "create") {
      if (totalSelectedImagesCount < 1) {
        toast.error("Please keep at least 1 image");
        return;
      }
      if (totalSelectedImagesCount > MAX_IMAGES) {
        toast.error(`You can upload up to ${MAX_IMAGES} images`);
        return;
      }
    }

    setLoading(true);
    try {
      const uploadedUrls = await uploadImages();
      const imagesToSave = [...existingImages, ...uploadedUrls].slice(0, MAX_IMAGES);

      const endpoint =
        modalMode === "edit" && selected?._id
          ? `/api/products/${selected._id}`
          : "/api/products";
      const method = modalMode === "edit" ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsedName,
          description: parsedDescription,
          category: parsedCategory,
          price: parsedPrice,
          images: imagesToSave,
          active,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error ?? "Failed to save product");

      toast.success(modalMode === "edit" ? "Product updated" : "Product created");
      closeModal();
      await loadProducts(page, query, categoryFilter);
      await loadCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error ?? "Failed to delete product");
      toast.success("Product deleted");
      await loadProducts(page, query, categoryFilter);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    closeDeleteModal();
    await handleDelete(deleteTarget);
  };

  const isReadOnly = modalMode === "view";

  const canAddMoreImages = totalSelectedImagesCount < MAX_IMAGES;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <AdminHeader label="Products" />
      </header>

      <section className="flex flex-col gap-4 rounded-none border-x-0 border-y border-zinc-200 bg-white p-4 shadow-none md:rounded-2xl md:border md:p-6 md:shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-sm">
            <InputField
              label="Search"
              name="search"
              placeholder="Search products..."
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
            />
          </div>

          <div className="w-full md:max-w-xs">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400"
            >
              <option value="all">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 md:px-5 md:text-sm"
            >
              Add new product
            </button>
            <button
              type="button"
              onClick={() => loadProducts(page, query, categoryFilter)}
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
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              No products found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        {product.category || "Uncategorized"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-700">
                        ${product.price.toFixed(2)}
                      </p>
                      <div className="mt-2">
                        {product.active === false ? (
                          <span className="text-xs font-semibold text-zinc-400">
                            Inactive
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openViewModal(product)}
                        aria-label="View"
                        title="View"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500"
                      >
                        <IconEye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                        aria-label="Edit"
                        title="Edit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500"
                      >
                        <IconPencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(product)}
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

        <div className="hidden overflow-x-auto rounded-2xl border border-zinc-200 md:block">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="sticky left-0 z-10 border-r border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-zinc-500">
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-zinc-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="align-middle">
                    <td className="sticky left-0 z-10 border-r border-zinc-200 bg-white px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      <span className="text-xs font-semibold text-emerald-600">LKR </span>{product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {product.category || "Uncategorized"}
                    </td>
                    <td className="px-4 py-3">
                      {product.active === false ? (
                        <span className="text-xs font-semibold text-zinc-400">
                          Inactive
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(product)}
                          aria-label="View"
                          title="View"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500"
                        >
                          <IconEye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          aria-label="Edit"
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500"
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(product)}
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

        <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-full border border-zinc-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="rounded-full border border-zinc-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 disabled:opacity-50"
            >
              Next
            </button>
          </div>
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
          <div className="relative z-10 w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
                  {modalMode === "create"
                    ? "Add New"
                    : modalMode === "edit"
                      ? "Edit"
                      : "View"}
                </p>
                <h2 className="text-2xl font-semibold">Product</h2>
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

            <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Product name"
                  name="modal_name"
                  placeholder="Oak table"
                  value={name}
                  onChange={isReadOnly ? undefined : setName}
                />
                <InputField
                  label="Price (LKR)"
                  name="modal_price"
                  type="number"
                  placeholder="1200"
                  value={price}
                  onChange={isReadOnly ? undefined : setPrice}
                />
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="modal_category"
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
                  >
                    Category
                  </label>
                  <input
                    id="modal_category"
                    name="modal_category"
                    list="product-categories"
                    placeholder="Outdoor"
                    value={category}
                    readOnly={isReadOnly}
                    onChange={
                      isReadOnly
                        ? undefined
                        : (event) => {
                            setCategory(event.target.value);
                          }
                    }
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400"
                  />
                  <datalist id="product-categories">
                    {categories.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="modal_description"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
                >
                  Description
                </label>
                <textarea
                  id="modal_description"
                  name="modal_description"
                  placeholder="Write a short description"
                  value={description}
                  readOnly={isReadOnly}
                  onChange={
                    isReadOnly
                      ? undefined
                      : (event) => {
                          setDescription(event.target.value);
                        }
                  }
                  className="min-h-28 resize-y rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400"
                />
              </div>

              {modalMode !== "view" ? (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Product images
                  </label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    aria-label="Upload product image"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      event.currentTarget.value = "";
                      if (!file) return;
                      addOneImageFile(file);
                    }}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    {existingImages.map((url, index) => (
                      <div
                        key={url}
                        className="group relative h-24 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50"
                      >
                        <button
                          type="button"
                          onClick={() => setFullScreenImageUrl(url)}
                          className="absolute inset-0"
                          aria-label="View image"
                        />
                        <img src={url} alt="Product image" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImageAtIndex(index)}
                          aria-label="Remove image"
                          title="Remove"
                          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-zinc-700 opacity-100 shadow-sm transition hover:bg-white"
                        >
                          <IconX className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {previews.map((preview, index) => (
                      <div
                        key={preview.url}
                        className="group relative h-24 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50"
                      >
                        <button
                          type="button"
                          onClick={() => setFullScreenImageUrl(preview.url)}
                          className="absolute inset-0"
                          aria-label="View image"
                        />
                        <img src={preview.url} alt={preview.name} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewFileAtIndex(index)}
                          aria-label="Remove image"
                          title="Remove"
                          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-zinc-700 opacity-100 shadow-sm transition hover:bg-white"
                        >
                          <IconX className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {canAddMoreImages ? (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400"
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
                          <IconPlus className="h-4 w-4 text-zinc-700" />
                        </span>
                        Add image
                      </button>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                      {modalMode === "create"
                        ? `Add ${1} to ${MAX_IMAGES} images. Selected: ${totalSelectedImagesCount}/${MAX_IMAGES}.`
                        : `Keep ${1} to ${MAX_IMAGES} images. Selected: ${totalSelectedImagesCount}/${MAX_IMAGES}.`}
                    </p>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={!canAddMoreImages}
                      className="rounded-full border border-zinc-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : selected?.images?.length ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Images
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {selected.images.slice(0, 3).map((url) => (
                      <button
                        type="button"
                        key={url}
                        onClick={() => setFullScreenImageUrl(url)}
                        className="h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
                      >
                        <img
                          src={url}
                          alt={selected.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {modalMode === "view" ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Description
                  </p>
                  <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                    {description || "-"}
                  </p>
                </div>
              ) : null}

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={active}
                  disabled={isReadOnly}
                  onChange={(event) => setActive(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 disabled:opacity-60"
                />
                <span className="text-sm font-semibold text-zinc-700">
                  Active
                </span>
              </label>

              {modalMode !== "view" ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploading
                      ? "Uploading..."
                      : loading
                        ? "Saving..."
                        : modalMode === "edit"
                          ? "Update"
                          : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}

      {fullScreenImageUrl ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close image"
            className="fixed inset-0 bg-black/70"
            onClick={() => setFullScreenImageUrl(null)}
          />
          <div className="relative z-10 w-full max-w-5xl">
            <button
              type="button"
              aria-label="Close"
              title="Close"
              onClick={() => setFullScreenImageUrl(null)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-700 backdrop-blur transition hover:bg-white"
            >
              <IconX className="h-4 w-4" />
            </button>
            <img
              src={fullScreenImageUrl}
              alt="Product image"
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />
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
                <h3 className="text-xl font-semibold text-zinc-900">Delete product</h3>
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
              Are you sure you want to delete <span className="font-semibold text-zinc-900">{deleteTarget?.name}</span>? This action can’t be undone.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={loading}
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
