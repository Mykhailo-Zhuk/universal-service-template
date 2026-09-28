"use client";

/**
 * Admin / Tables & QR (G-262)
 *
 * Lists every physical table in the venue, generates a QR code that points
 * at the public ordering URL, and lets the operator print, download, or
 * toggle table availability (Active / Inactive).
 *
 * The base URL is taken from `window.location.origin` at runtime — that way
 * the same QR works in development (`http://localhost:3000`) and in
 * production without rebuilding.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  Printer,
  Download,
  Copy,
  Check,
  QrCode as QrCodeIcon,
  ExternalLink,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
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
import { DEMO_TABLES } from "@/data/orders";
import { cn } from "@/lib/utils";
import type { Table } from "@/lib/schemas";

const RESTAURANT_ID = "demo-restaurant";

export default function AdminTablesPage() {
  const [origin, setOrigin] = useState<string>("");
  // Set on the client to avoid SSR/hydration mismatch on `window.location`.
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const [tables, setTables] = useState<Table[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_tables_state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore corrupted data
        }
      }
    }
    return DEMO_TABLES;
  });

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleTableStatus = useCallback((tableId: string) => {
    setTables((prev) => {
      const next = prev.map((t) =>
        t.id === tableId ? { ...t, active: !t.active } : t
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_tables_state", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const setAllTablesActive = useCallback((active: boolean) => {
    setTables((prev) => {
      const next = prev.map((t) => ({ ...t, active }));
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_tables_state", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const activeCount = useMemo(
    () => tables.filter((t) => t.active).length,
    [tables]
  );
  const inactiveCount = tables.length - activeCount;

  const filteredTables = useMemo(() => {
    if (filter === "active") return tables.filter((t) => t.active);
    if (filter === "inactive") return tables.filter((t) => !t.active);
    return tables;
  }, [tables, filter]);

  const tableUrl = useCallback(
    (tableId: string) =>
      origin
        ? `${origin}/menu/${RESTAURANT_ID}/table/${tableId}`
        : `/menu/${RESTAURANT_ID}/table/${tableId}`,
    [origin]
  );

  const copyLink = async (tableId: string) => {
    try {
      await navigator.clipboard.writeText(tableUrl(tableId));
      setCopiedId(tableId);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore — clipboard might be blocked in some browsers.
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Tables &amp; QR
          </h1>
          <p className="mt-1 text-muted-foreground">
            Print a QR sticker for each table. Customers scan it to open the
            menu and place an order straight from their phone.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button asChild variant="outline">
            <Link href={`/menu/${RESTAURANT_ID}`}>
              <ExternalLink className="h-4 w-4" />
              Public menu
            </Link>
          </Button>
          <PrintAllButton tables={tables} buildUrl={tableUrl} />
        </div>
      </header>

      <Card className="print:hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <QrCodeIcon className="h-4 w-4 text-indigo-500" />
              {activeCount} of {tables.length} tables active
            </CardTitle>
            <CardDescription className="mt-1">
              Toggle table status to open or close tables for ordering.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-xs dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  filter === "all"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({tables.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("active")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  filter === "active"
                    ? "bg-white text-emerald-700 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter("inactive")}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  filter === "inactive"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Inactive ({inactiveCount})
              </button>
            </div>

            {/* Quick bulk action */}
            {inactiveCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllTablesActive(true)}
                className="text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Activate all
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllTablesActive(false)}
                className="text-xs"
              >
                <XCircle className="h-3.5 w-3.5 text-zinc-500" />
                Deactivate all
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTables.map((table) => (
          <TableQrCard
            key={table.id}
            table={table}
            url={tableUrl(table.id)}
            copied={copiedId === table.id}
            onCopy={() => copyLink(table.id)}
            onToggleStatus={() => toggleTableStatus(table.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

/**
 * Single table card. Renders the QR using QRCodeCanvas (so we can download
 * the PNG directly via `canvas.toDataURL()` without extra deps).
 */
function TableQrCard({
  table,
  url,
  copied,
  onCopy,
  onToggleStatus,
}: {
  table: Table;
  url: string;
  copied: boolean;
  onCopy: () => void;
  onToggleStatus: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const downloadPng = () => {
    // Find the actual <canvas> DOM node — QRCodeCanvas attaches an internal
    // ref via React.forwardRef, but here we render it ourselves so we get
    // a stable handle.
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-table-${table.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all print:break-inside-avoid print:border-zinc-300",
        !table.active && "border-dashed opacity-80"
      )}
    >
      {/* Sticker header — only shown on print. */}
      <div className="hidden print:block print:px-4 print:pt-3">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500">
          Scan to order
        </div>
        <div className="text-base font-bold">Demo Restaurant</div>
      </div>

      <CardHeader className="print:hidden">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {table.id}
              </span>
              {table.label}
            </CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {table.seats} seats
              </span>
              {table.zone && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {table.zone}
                </span>
              )}
            </div>
          </div>

          {/* Clickable Badge */}
          <button
            type="button"
            onClick={onToggleStatus}
            title={
              table.active
                ? "Click to deactivate table"
                : "Click to activate table"
            }
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Badge variant={table.active ? "success" : "secondary"}>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    table.active ? "bg-emerald-500" : "bg-zinc-400"
                  )}
                />
                {table.active ? "Active" : "Inactive"}
              </span>
            </Badge>
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 print:gap-2">
        {/* The QR */}
        <div
          className={cn(
            "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
            "print:border-zinc-300 print:shadow-none",
            !table.active && "grayscale opacity-70"
          )}
        >
          <QRCodeCanvas
            // Attach the ref to a hidden canvas — QRCodeCanvas renders its own
            // <canvas>, so we use a callback ref to capture it.
            ref={(node) => {
              canvasRef.current = node;
            }}
            value={url}
            size={180}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            marginSize={2}
            title={`QR for ${table.label}`}
          />
        </div>

        <div className="w-full text-center text-sm font-semibold print:text-base">
          {table.label}
        </div>

        <code
          className={cn(
            "w-full truncate rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-[10px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
            "print:break-all print:whitespace-normal print:text-[8px]"
          )}
        >
          {url}
        </code>

        {/* Status switcher toggle */}
        <div className="flex w-full items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800/80 dark:bg-zinc-900/40 print:hidden">
          <span className="text-xs font-medium text-muted-foreground">
            Status:{" "}
            <strong
              className={
                table.active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500"
              }
            >
              {table.active ? "Active" : "Inactive"}
            </strong>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={table.active}
            onClick={onToggleStatus}
            title={
              table.active
                ? "Table is active. Click to deactivate"
                : "Table is inactive. Click to activate"
            }
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600",
              table.active ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                table.active ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>

        <div className="flex w-full gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onCopy}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy link
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={downloadPng}
          >
            <Download className="h-3.5 w-3.5" />
            PNG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PrintAllButton({
  tables,
  buildUrl,
}: {
  tables: Table[];
  buildUrl: (tableId: string) => string;
}) {
  const onPrint = () => {
    // Give the browser one tick to apply any layout changes before opening
    // the print dialog — improves the first-page experience.
    window.requestAnimationFrame(() => {
      window.print();
    });
  };
  // Surface that the button exists to keep the prop wiring honest.
  void tables;
  void buildUrl;

  return (
    <Button onClick={onPrint}>
      <Printer className="h-4 w-4" />
      Print all
    </Button>
  );
}