"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaStar } from "react-icons/fa6";
import AdminHeader from "@/components/AdminHeader";
import InputField from "@/components/InputField";

type SiteSettings = {
  projectsCompleted: number;
  happyClients: number;
  yearsExperience: number;
};

type Testimonial = {
  _id: string;
  clientName: string;
  rating: number;
  feedback: string;
  active?: boolean;
};

type ModalMode = "create" | "edit";

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

export default function AdminSettingsPage() {
  const [projectsCompleted, setProjectsCompleted] = useState("10");
  const [happyClients, setHappyClients] = useState("20");
  const [yearsExperience, setYearsExperience] = useState("2");
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [clientName, setClientName] = useState("");
  const [rating, setRating] = useState("5");
  const [feedback, setFeedback] = useState("");
  const [active, setActive] = useState(true);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const response = await fetch("/api/settings", { cache: "no-store" });
      const data = (await response.json()) as SiteSettings & { error?: string };
      if (!response.ok) throw new Error(data?.error ?? "Failed to load settings");

      setProjectsCompleted(String(data.projectsCompleted ?? 10));
      setHappyClients(String(data.happyClients ?? 20));
      setYearsExperience(String(data.yearsExperience ?? 2));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load settings");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const loadTestimonials = useCallback(async () => {
    setTestimonialsLoading(true);
    try {
      const response = await fetch("/api/testimonials", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to load testimonials");
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load testimonials");
    } finally {
      setTestimonialsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSettings();
      void loadTestimonials();
    });
  }, [loadSettings, loadTestimonials]);

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const projects = Number(projectsCompleted);
    const clients = Number(happyClients);
    const years = Number(yearsExperience);

    if (![projects, clients, years].every((value) => Number.isFinite(value) && value >= 0)) {
      toast.error("Please enter valid positive numbers");
      return;
    }

    setSettingsLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectsCompleted: projects,
          happyClients: clients,
          yearsExperience: years,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to save settings");
      toast.success("Settings saved");
      setProjectsCompleted(String(data.projectsCompleted));
      setHappyClients(String(data.happyClients));
      setYearsExperience(String(data.yearsExperience));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const resetModal = () => {
    setSelected(null);
    setClientName("");
    setRating("5");
    setFeedback("");
    setActive(true);
  };

  const openCreateModal = () => {
    setModalMode("create");
    resetModal();
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setModalMode("edit");
    setSelected(testimonial);
    setClientName(testimonial.clientName);
    setRating(String(testimonial.rating));
    setFeedback(testimonial.feedback);
    setActive(testimonial.active !== false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetModal();
  };

  const saveTestimonial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedClientName = clientName.trim();
    const parsedFeedback = feedback.trim();
    const parsedRating = Number(rating);

    if (!parsedClientName) {
      toast.error("Client name is required");
      return;
    }
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }
    if (!parsedFeedback) {
      toast.error("Client feedback is required");
      return;
    }

    setTestimonialsLoading(true);
    try {
      const endpoint =
        modalMode === "edit" && selected?._id
          ? `/api/testimonials/${selected._id}`
          : "/api/testimonials";
      const method = modalMode === "edit" ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: parsedClientName,
          rating: parsedRating,
          feedback: parsedFeedback,
          active,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to save testimonial");

      toast.success(modalMode === "edit" ? "Testimonial updated" : "Testimonial added");
      closeModal();
      await loadTestimonials();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save testimonial");
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setTestimonialsLoading(true);
    try {
      const response = await fetch(`/api/testimonials/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to delete testimonial");

      toast.success("Testimonial deleted");
      setDeleteTarget(null);
      await loadTestimonials();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete testimonial");
    } finally {
      setTestimonialsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader label="Settings" />

      <section className="rounded-none border-x-0 border-y border-zinc-200 bg-white p-4 shadow-none md:rounded-2xl md:border md:p-6 md:shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-zinc-900">About counters</h2>
          <p className="text-sm text-zinc-500">
            These numbers appear in the About section on the website.
          </p>
        </div>

        <form onSubmit={saveSettings} className="mt-5 grid gap-4 md:grid-cols-3">
          <InputField
            label="Projects"
            name="projectsCompleted"
            type="number"
            value={projectsCompleted}
            onChange={setProjectsCompleted}
          />
          <InputField
            label="Clients"
            name="happyClients"
            type="number"
            value={happyClients}
            onChange={setHappyClients}
          />
          <InputField
            label="Years experience"
            name="yearsExperience"
            type="number"
            value={yearsExperience}
            onChange={setYearsExperience}
          />
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={settingsLoading}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {settingsLoading ? "Saving..." : "Save counters"}
            </button>
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-4 rounded-none border-x-0 border-y border-zinc-200 bg-white p-4 shadow-none md:rounded-2xl md:border md:p-6 md:shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Testimonials</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Add client feedback for the animated section under About.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void loadTestimonials()}
              className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 md:px-5 md:text-sm"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 md:px-5 md:text-sm"
            >
              Add testimonial
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {testimonialsLoading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              Loading testimonials...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              No testimonials added yet.
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div
                key={testimonial._id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-none"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-zinc-900">
                        {testimonial.clientName}
                      </p>
                      <span className="flex gap-1 text-emerald-600">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <FaStar
                            key={index}
                            className={index < testimonial.rating ? "h-3.5 w-3.5" : "h-3.5 w-3.5 opacity-25"}
                          />
                        ))}
                      </span>
                      <span
                        className={
                          testimonial.active === false
                            ? "text-xs font-semibold text-zinc-400"
                            : "text-xs font-semibold text-emerald-600"
                        }
                      >
                        {testimonial.active === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {testimonial.feedback}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(testimonial)}
                      aria-label="Edit"
                      title="Edit"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500"
                    >
                      <IconPencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(testimonial)}
                      aria-label="Delete"
                      title="Delete"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
                  {modalMode === "edit" ? "Edit" : "Add New"}
                </p>
                <h2 className="text-2xl font-semibold">Testimonial</h2>
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

            <form onSubmit={saveTestimonial} className="mt-6 flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Client name"
                  name="clientName"
                  placeholder="Client name"
                  value={clientName}
                  onChange={setClientName}
                />
                <InputField
                  label="Rating"
                  name="rating"
                  type="number"
                  placeholder="5"
                  value={rating}
                  onChange={setRating}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="feedback"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
                >
                  Client feedback
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Write client feedback"
                  className="min-h-32 resize-y rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
                />
                <span className="text-sm font-semibold text-zinc-700">Active</span>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={testimonialsLoading}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {testimonialsLoading ? "Saving..." : modalMode === "edit" ? "Update" : "Create"}
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

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            className="fixed inset-0 bg-black/40"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-red-600">
                  Confirm
                </p>
                <h3 className="text-xl font-semibold text-zinc-900">Delete testimonial</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                aria-label="Close"
                title="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm text-zinc-600">
              Are you sure you want to delete the testimonial from{" "}
              <span className="font-semibold text-zinc-900">{deleteTarget.clientName}</span>?
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={testimonialsLoading}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {testimonialsLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={testimonialsLoading}
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
