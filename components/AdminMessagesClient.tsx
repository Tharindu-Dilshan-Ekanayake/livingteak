"use client";

import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
};

type IconProps = { className?: string };
const PAGE_SIZE = 5;

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

function IconReply({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9 5 12l5 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h9a5 5 0 0 1 5 5v1" />
    </svg>
  );
}

function IconX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildReplyLink(message: ContactMessage) {
  const subject = encodeURIComponent("Reply to your Living Teak message");
  const body = encodeURIComponent(
    `Hello ${message.name},\n\nThank you for contacting Living Teak.\n\n`
  );

  return `mailto:${message.email}?subject=${subject}&body=${body}`;
}

function MessageTable({
  title,
  description,
  messages,
  currentPage,
  totalPages,
  loading,
  onView,
  onDelete,
  onPrevPage,
  onNextPage,
}: {
  title: string;
  description: string;
  messages: ContactMessage[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onView: (message: ContactMessage) => void;
  onDelete: (message: ContactMessage) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}) {
  return (
    <section className="flex flex-col gap-4 overflow-hidden rounded-none border-x-0 border-y border-zinc-200 bg-white p-4 shadow-none md:rounded-2xl md:border md:p-6 md:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            {messages.length}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      <div className="md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
            No messages found.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div key={message._id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">{message.name}</p>
                    <p className="truncate text-xs text-zinc-500">{message.email}</p>
                    <p className="mt-1 text-xs text-zinc-500">{formatDateTime(message.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-3">
                  <button
                    type="button"
                    onClick={() => onView(message)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500"
                    aria-label="View"
                    title="View"
                  >
                    <IconEye className="h-4 w-4" />
                  </button>
                  <a
                    href={buildReplyLink(message)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500"
                    aria-label="Reply"
                    title="Reply"
                  >
                    <IconReply className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(message)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500"
                    aria-label="Delete"
                    title="Delete"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-zinc-200 md:block">
        <table className="min-w-[720px] divide-y divide-zinc-200 text-sm lg:min-w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Sender Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Time
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  Loading messages...
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  No messages found.
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr key={message._id} className="align-middle hover:bg-zinc-50/50">
                  <td className="px-4 py-3 font-semibold text-zinc-900">{message.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{message.email}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatDateTime(message.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(message)}
                        aria-label="View"
                        title="View"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500"
                      >
                        <IconEye className="h-4 w-4" />
                      </button>
                      <a
                        href={buildReplyLink(message)}
                        aria-label="Reply"
                        title="Reply"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500"
                      >
                        <IconReply className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => onDelete(message)}
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

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          5 items per page
        </p>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={onPrevPage}
            className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={onNextPage}
            className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default function AdminMessagesClient({
  initialMessages,
}: {
  initialMessages: ContactMessage[];
}) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [unreadPage, setUnreadPage] = useState(1);
  const [readPage, setReadPage] = useState(1);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/contact", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to load messages");
      }

      setMessages(Array.isArray(data) ? data : []);
      setUnreadPage(1);
      setReadPage(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  const unreadMessages = useMemo(
    () => messages.filter((message) => message.readStatus === false),
    [messages]
  );
  const readMessages = useMemo(
    () => messages.filter((message) => message.readStatus === true),
    [messages]
  );

  const unreadTotalPages = Math.max(1, Math.ceil(unreadMessages.length / PAGE_SIZE));
  const readTotalPages = Math.max(1, Math.ceil(readMessages.length / PAGE_SIZE));

  const unreadCurrentPage = Math.min(unreadPage, unreadTotalPages);
  const readCurrentPage = Math.min(readPage, readTotalPages);

  const paginatedUnreadMessages = useMemo(() => {
    const start = (unreadCurrentPage - 1) * PAGE_SIZE;
    return unreadMessages.slice(start, start + PAGE_SIZE);
  }, [unreadCurrentPage, unreadMessages]);

  const paginatedReadMessages = useMemo(() => {
    const start = (readCurrentPage - 1) * PAGE_SIZE;
    return readMessages.slice(start, start + PAGE_SIZE);
  }, [readCurrentPage, readMessages]);

  const markAsRead = useCallback(async (messageId: string) => {
    const response = await fetch(`/api/contact/${messageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readStatus: true }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error ?? "Failed to update message");
    }

    setMessages((prev) =>
      prev.map((message) =>
        message._id === messageId ? { ...message, readStatus: true } : message
      )
    );
  }, []);

  const openViewModal = async (message: ContactMessage) => {
    setSelected(message);

    if (!message.readStatus) {
      try {
        await markAsRead(message._id);
        setSelected((prev) => (prev ? { ...prev, readStatus: true } : prev));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to mark message as read");
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/contact/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to delete message");
      }

      setMessages((prev) => prev.filter((message) => message._id !== deleteTarget._id));
      setDeleteTarget(null);
      if (selected?._id === deleteTarget._id) {
        setSelected(null);
      }
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete message");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void loadMessages()}
          className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 md:px-5 md:text-sm"
        >
          Refresh
        </button>
      </div>

      <MessageTable
        title="Unread Messages"
        description="New contact form messages with read status set to false."
        messages={paginatedUnreadMessages}
        currentPage={unreadCurrentPage}
        totalPages={unreadTotalPages}
        loading={loading}
        onView={(message) => void openViewModal(message)}
        onDelete={setDeleteTarget}
        onPrevPage={() => setUnreadPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() => setUnreadPage((prev) => Math.min(unreadTotalPages, prev + 1))}
      />

      <MessageTable
        title="Read Messages"
        description="Messages that have already been opened by an admin."
        messages={paginatedReadMessages}
        currentPage={readCurrentPage}
        totalPages={readTotalPages}
        loading={loading}
        onView={(message) => void openViewModal(message)}
        onDelete={setDeleteTarget}
        onPrevPage={() => setReadPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() => setReadPage((prev) => Math.min(readTotalPages, prev + 1))}
      />

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close message modal"
            className="fixed inset-0 bg-black/40"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-4 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
                  Message Details
                </p>
                <h2 className="mt-1 text-2xl font-bold text-zinc-900">{selected.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                title="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Sender Name</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Email</p>
                  <p className="mt-1 text-sm text-zinc-700">{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Phone</p>
                  <p className="mt-1 text-sm text-zinc-700">{selected.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Time</p>
                  <p className="mt-1 text-sm text-zinc-700">{formatDateTime(selected.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Status</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-600">
                    {selected.readStatus ? "Read" : "Unread"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Message</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                  {selected.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-100 pt-4">
              <a
                href={buildReplyLink(selected)}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Reply
              </a>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(selected);
                  setSelected(null);
                }}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300"
              >
                Close
              </button>
            </div>
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
          <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-4 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-red-600">Confirm</p>
                <h3 className="mt-1 text-xl font-semibold text-zinc-900">Delete message</h3>
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
              Are you sure you want to delete the message from{" "}
              <span className="font-semibold text-zinc-900">{deleteTarget.name}</span>? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-full bg-zinc-100 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
