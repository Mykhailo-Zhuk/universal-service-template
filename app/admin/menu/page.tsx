"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  UtensilsCrossed,
  CheckCircle2,
  CircleX,
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
import { cn, formatPrice } from "@/lib/utils";
import {
  ALLERGEN_CODES,
  type MenuItem,
  type MenuCategory,
} from "@/lib/schemas";

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  available: boolean;
  weight: string;
  calories: string;
  ingredientsRaw: string;
  allergens: string[];
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  available: true,
  weight: "",
  calories: "",
  ingredientsRaw: "",
  allergens: [],
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch("/api/admin/menu", { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
      ]);
      const menu = await menuRes.json();
      const cat = await catRes.json();
      setItems(menu.items ?? []);
      setCategories(cat.categories ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      category: categories[0]?.id ?? "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image ?? "",
      available: item.available,
      weight: item.weight ?? "",
      calories: item.calories?.toString() ?? "",
      ingredientsRaw: (item.ingredients ?? []).join("\n"),
      allergens: item.allergens ?? [],
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      image: form.image.trim() || undefined,
      available: form.available,
      weight: form.weight.trim() || undefined,
      calories: form.calories ? Number(form.calories) : undefined,
      ingredients: form.ingredientsRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      allergens: form.allergens,
    };

    try {
      const url = editingId
        ? `/api/admin/menu/${editingId}`
        : "/api/admin/menu";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.details
          ? Object.entries(json.details)
              .map(([k, v]: [string, unknown]) =>
                `${k}: ${(v as string[]).join(", ")}`
              )
              .join("; ")
          : json.error ?? "Failed to save");
        return;
      }
      await load();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error ?? "Failed to delete");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Menu
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your restaurant menu items. {items.length} item
            {items.length === 1 ? "" : "s"} across {categories.length}{" "}
            categor{categories.length === 1 ? "y" : "ies"}.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wider text-muted-foreground dark:border-zinc-800 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {items.map((item) => {
                    const cat = categories.find(
                      (c) => c.id === item.category
                    );
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.name}</div>
                          <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                            {cat?.icon ?? "🍽"} {cat?.name ?? item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-4 py-3">
                          {item.available ? (
                            <Badge variant="success">Available</Badge>
                          ) : (
                            <Badge variant="warning">Hidden</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        <UtensilsCrossed className="mx-auto h-8 w-8" />
                        <p className="mt-2 font-medium">No items yet</p>
                        <p className="mt-1 text-xs">
                          Click &ldquo;Add item&rdquo; to create your first menu item.
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
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>
                      {editingId ? "Edit item" : "Add new item"}
                    </CardTitle>
                    <CardDescription>
                      {editingId
                        ? "Update menu item details"
                        : "Create a new menu item"}
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
                    onSubmit={handleSubmit}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <Field label="Name" required className="sm:col-span-2">
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        required
                        maxLength={100}
                      />
                    </Field>
                    <Field
                      label="Description"
                      required
                      className="sm:col-span-2"
                    >
                      <Textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        required
                        maxLength={500}
                        rows={3}
                      />
                    </Field>
                    <Field label="Price (UAH)" required>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: e.target.value })
                        }
                        required
                      />
                    </Field>
                    <Field label="Category" required>
                      <select
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                        required
                      >
                        <option value="" disabled>
                          Select…
                        </option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Weight (e.g. 350 g)">
                      <Input
                        value={form.weight}
                        onChange={(e) =>
                          setForm({ ...form, weight: e.target.value })
                        }
                        maxLength={20}
                      />
                    </Field>
                    <Field label="Calories (kcal)">
                      <Input
                        type="number"
                        min="0"
                        value={form.calories}
                        onChange={(e) =>
                          setForm({ ...form, calories: e.target.value })
                        }
                      />
                    </Field>
                    <Field
                      label="Image URL (optional)"
                      className="sm:col-span-2"
                    >
                      <Input
                        type="url"
                        value={form.image}
                        onChange={(e) =>
                          setForm({ ...form, image: e.target.value })
                        }
                      />
                    </Field>
                    <Field
                      label="Ingredients (one per line)"
                      className="sm:col-span-2"
                    >
                      <Textarea
                        value={form.ingredientsRaw}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            ingredientsRaw: e.target.value,
                          })
                        }
                        rows={4}
                        placeholder="Mozzarella&#10;Tomato sauce&#10;Basil"
                      />
                    </Field>
                    <Field
                      label="Allergens"
                      className="sm:col-span-2"
                    >
                      <div className="flex flex-wrap gap-2">
                        {ALLERGEN_CODES.map((code) => {
                          const active = form.allergens.includes(code);
                          return (
                            <button
                              key={code}
                              type="button"
                              onClick={() =>
                                setForm({
                                  ...form,
                                  allergens: active
                                    ? form.allergens.filter((c) => c !== code)
                                    : [...form.allergens, code],
                                })
                              }
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                                active
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                  : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                              )}
                            >
                              {code}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                    <Field label="Availability" className="sm:col-span-2">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.available}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              available: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm">
                          Visible to customers
                        </span>
                      </label>
                    </Field>

                    {error && (
                      <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                        {error}
                      </div>
                    )}

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
                        {editingId ? "Save changes" : "Create item"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// Suppress unused warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _internal = { CircleX };