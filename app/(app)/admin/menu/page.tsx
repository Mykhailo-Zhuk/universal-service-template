"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  UtensilsCrossed,
  CheckCircle2,
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
import { FormField } from "@/components/admin/form-field";
import { ModalDialog } from "@/components/admin/modal-dialog";
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
        setError(
          json.details
            ? Object.entries(json.details)
                .map(
                  ([k, v]: [string, unknown]) =>
                    `${k}: ${(v as string[]).join(", ")}`
                )
                .join("; ")
            : json.error ?? "Failed to save"
        );
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
    <>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-normal tracking-[-0.03em] lg:text-3xl">
              Menu
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
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
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-surface text-left text-xs font-medium text-muted-foreground">
                    <tr>
                      <th className="min-w-[200px] px-5 py-3.5 font-medium">
                        Item
                      </th>
                      <th className="px-4 py-3.5 font-medium">Category</th>
                      <th className="px-4 py-3.5 text-right font-medium">
                        Price
                      </th>
                      <th className="px-4 py-3.5 font-medium">Status</th>
                      <th className="px-5 py-3.5 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item) => {
                      const cat = categories.find(
                        (c) => c.id === item.category
                      );
                      return (
                        <tr
                          key={item.id}
                          className="transition-colors hover:bg-surface"
                        >
                          <td className="min-w-[200px] px-5 py-3.5">
                            <div className="font-medium text-foreground">
                              {item.name}
                            </div>
                            <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground">
                              {cat?.name ?? item.category}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-medium tabular-nums text-foreground">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-4 py-3.5">
                            {item.available ? (
                              <Badge variant="mint">Available</Badge>
                            ) : (
                              <Badge variant="warning">Hidden</Badge>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEdit(item)}
                                aria-label={`Edit ${item.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(item.id)}
                                aria-label={`Delete ${item.name}`}
                                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
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
                          <p className="mt-2 font-medium text-foreground">
                            No items yet
                          </p>
                          <p className="mt-1 text-xs">
                            Click &ldquo;Add item&rdquo; to create your first
                            menu item.
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
      </div>

      <ModalDialog
        open={showForm}
        onClose={closeForm}
        maxWidth="max-w-2xl"
        scrollable
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
              aria-label="Close modal"
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
              <FormField label="Name" required className="sm:col-span-2">
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={100}
                />
              </FormField>
              <FormField label="Description" required className="sm:col-span-2">
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                  maxLength={500}
                  rows={3}
                />
              </FormField>
              <FormField label="Price (UAH)" required>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="font-mono"
                />
              </FormField>
              <FormField label="Category" required>
                <select
                  className="flex h-11 w-full rounded-[8px] border border-border-strong bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
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
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Weight (e.g. 350 g)">
                <Input
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  maxLength={20}
                />
              </FormField>
              <FormField label="Calories (kcal)">
                <Input
                  type="number"
                  min="0"
                  value={form.calories}
                  onChange={(e) =>
                    setForm({ ...form, calories: e.target.value })
                  }
                  className="font-mono"
                />
              </FormField>
              <FormField label="Image URL (optional)" className="sm:col-span-2">
                <Input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </FormField>
              <FormField
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
              </FormField>
              <FormField label="Allergens" className="sm:col-span-2">
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
                            ? "border-foreground bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-border-strong"
                        )}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
              </FormField>
              <FormField label="Availability" className="sm:col-span-2">
                <div className="pt-0.5">
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
                      className="h-4 w-4 rounded border-border-strong accent-[#232323] dark:accent-[#a1ffcb]"
                    />
                    <span className="text-sm text-foreground">
                      Visible to customers
                    </span>
                  </label>
                </div>
              </FormField>

              {error && (
                <div className="rounded-[10px] border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 sm:col-span-2 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 sm:col-span-2">
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
      </ModalDialog>
    </>
  );
}
