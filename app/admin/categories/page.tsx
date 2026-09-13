"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  FolderTree,
  CheckCircle2,
  AlertTriangle,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Inline Zod schema — kept self-contained per the task brief.
const CategoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, digits, dashes only"),
  icon: z.string().max(8).optional().or(z.literal("")),
  description: z.string().max(200).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
});

type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

type Category = {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
};

type ConfirmState = {
  open: boolean;
  category: Category | null;
  busy: boolean;
  error: string | null;
};

// Slug helper: turns "Classic Pizzas" into "classic-pizzas".
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const EMPTY_DEFAULTS: CategoryFormValues = {
  name: "",
  slug: "",
  icon: "🍽",
  description: "",
  sortOrder: 0,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    category: null,
    busy: false,
    error: null,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

  // Auto-generate slug from name until the user manually edits slug.
  const [slugTouched, setSlugTouched] = useState(false);
  useEffect(() => {
    if (!slugTouched && !editingId) {
      setValue("slug", slugify(nameValue ?? ""), { shouldValidate: false });
    }
  }, [nameValue, slugTouched, editingId, setValue]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const json = (await res.json()) as { categories: Category[] };
      setCategories(json.categories ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setSlugTouched(false);
    const nextSort =
      categories.length > 0
        ? Math.max(...categories.map((c) => c.sortOrder ?? 0)) + 1
        : 0;
    reset({ ...EMPTY_DEFAULTS, sortOrder: nextSort });
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setSlugTouched(true);
    reset({
      name: category.name,
      slug: category.slug ?? category.id,
      icon: category.icon ?? "",
      description: category.description ?? "",
      sortOrder: category.sortOrder ?? 0,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSlugTouched(false);
    reset(EMPTY_DEFAULTS);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true);
    const payload = {
      id: editingId ?? undefined,
      name: values.name.trim(),
      slug: values.slug.trim() || slugify(values.name),
      icon: values.icon?.trim() || undefined,
      description: values.description?.trim() || undefined,
      sortOrder: values.sortOrder ?? 0,
    };

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(
          (json.details &&
            Object.entries(json.details)
              .map(
                ([k, v]: [string, unknown]) =>
                  `${k}: ${(v as string[]).join(", ")}`
              )
              .join("; ")) ||
            json.error ||
            "Failed to save"
        );
        return;
      }
      await load();
      closeForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  const askDelete = (category: Category) => {
    setConfirm({ open: true, category, busy: false, error: null });
  };

  const cancelDelete = () => {
    setConfirm({ open: false, category: null, busy: false, error: null });
  };

  const performDelete = async () => {
    if (!confirm.category) return;
    setConfirm((s) => ({ ...s, busy: true, error: null }));
    try {
      const res = await fetch(
        `/api/admin/categories/${confirm.category.id}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setConfirm((s) => ({
          ...s,
          busy: false,
          error: json.error ?? "Failed to delete",
        }));
        return;
      }
      setCategories((prev) =>
        prev.filter((c) => c.id !== confirm.category!.id)
      );
      cancelDelete();
    } catch (err) {
      setConfirm((s) => ({
        ...s,
        busy: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  };

  const filtered = categories.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.slug ?? "").toLowerCase().includes(q) ||
      (c.description ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-muted-foreground">
            Group menu items into browsable categories.{" "}
            {categories.length} categor
            {categories.length === 1 ? "y" : "ies"} total.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-48 pl-9"
            />
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : loadError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-red-600">
            {loadError}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTree className="h-4 w-4 text-indigo-500" />
              Menu categories
            </CardTitle>
            <CardDescription>
              Drag-handle (sortOrder) controls the display order on the public
              menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wider text-muted-foreground dark:border-zinc-800 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3">Icon</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filtered.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                    >
                      <td className="px-4 py-3 text-2xl">
                        {category.icon ?? "🍽"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {category.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                          {category.slug ?? category.id}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          {/* itemCount would normally come from API; show n/a here */}
                          —
                        </Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        #{category.sortOrder ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(category)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => askDelete(category)}
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        <FolderTree className="mx-auto h-8 w-8" />
                        <p className="mt-2 font-medium">
                          {search.trim()
                            ? "No matches"
                            : "No categories yet"}
                        </p>
                        <p className="mt-1 text-xs">
                          {search.trim()
                            ? "Try a different search term."
                            : 'Click "Add category" to create your first one.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={closeForm}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>
                      {editingId ? "Edit category" : "Add new category"}
                    </CardTitle>
                    <CardDescription>
                      {editingId
                        ? "Update the category details."
                        : "Create a new menu category."}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={closeForm}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <Field
                      label="Name"
                      required
                      error={errors.name?.message}
                      className="sm:col-span-2"
                    >
                      <Input
                        {...register("name")}
                        maxLength={60}
                        placeholder="Starters"
                      />
                    </Field>

                    <Field
                      label="Slug"
                      required
                      error={errors.slug?.message}
                      className="sm:col-span-2"
                      hint={
                        !slugTouched && !editingId
                          ? "Auto-generated from name"
                          : undefined
                      }
                    >
                      <Input
                        {...register("slug", {
                          onChange: () => setSlugTouched(true),
                        })}
                        maxLength={60}
                        placeholder="starters"
                        className="font-mono"
                      />
                    </Field>

                    <Field label="Icon (emoji)">
                      <Input
                        {...register("icon")}
                        maxLength={8}
                        placeholder="🥗"
                        className="text-2xl"
                      />
                    </Field>

                    <Field label="Sort order" error={errors.sortOrder?.message}>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        {...register("sortOrder")}
                      />
                    </Field>

                    <Field
                      label="Description (optional)"
                      className="sm:col-span-2"
                      error={errors.description?.message}
                    >
                      <Textarea
                        {...register("description")}
                        maxLength={200}
                        rows={3}
                        placeholder="Light dishes to start your meal…"
                      />
                    </Field>

                    <div className="flex items-center justify-end gap-2 sm:col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeForm}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        {editingId ? "Save changes" : "Create category"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirm.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Delete category?
                  </CardTitle>
                  <CardDescription>
                    <span className="font-medium text-foreground">
                      {confirm.category?.name}
                    </span>{" "}
                    will be permanently removed. This cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {confirm.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                      {confirm.error}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={cancelDelete}
                      disabled={confirm.busy}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={performDelete}
                      disabled={confirm.busy}
                    >
                      {confirm.busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slug-touch indicator (helpful for the user) */}
      <span className="hidden" aria-hidden>
        current-slug:{slugValue}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  className,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}