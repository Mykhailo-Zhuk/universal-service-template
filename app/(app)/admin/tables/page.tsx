"use client";

/**
 * Admin / Tables & QR (G-262)
 *
 * Lists every physical table in the venue, generates a QR code that points
 * at the public ordering URL, and lets the operator print, download, or
 * toggle table availability (Active / Inactive).
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
      // clipboard might be blocked
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-normal tracking-[-0.03em] lg:text-3xl">
            Tables &amp; QR
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCodeIcon className="h-4 w-4 text-foreground" />
              {activeCount} of {tables.length} tables active
            </CardTitle>
            <CardDescription className="mt-1">
              Toggle table status to open or close tables for ordering.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-[10px] border border-border bg-surface p-0.5 text-xs">
              {(
                [
                  { value: "all", label: `All (${tables.length})` },
                  { value: "active", label: `Active (${activeCount})` },
                  { value: "inactive", label: `Inactive (${inactiveCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter(tab.value)}
                  className={cn(
                    "rounded-[8px] px-3 py-1.5 font-medium transition-colors",
                    filter === tab.value
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {inactiveCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllTablesActive(true)}
                className="text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-[#a1ffcb]" />
                Activate all
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllTablesActive(false)}
                className="text-xs"
              >
                <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
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
        "overflow-hidden transition-colors print:break-inside-avoid print:border-zinc-300",
        !table.active && "border-dashed opacity-80"
      )}
    >
      <div className="hidden print:block print:px-4 print:pt-3">
        <div className="text-[11px] font-medium text-zinc-500">
          Scan to order
        </div>
        <div className="text-base font-medium">Demo Restaurant</div>
      </div>

      <CardHeader className="print:hidden">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface font-mono text-xs font-medium text-foreground">
                {table.id}
              </span>
              {table.label}
            </CardTitle>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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

          <button
            type="button"
            onClick={onToggleStatus}
            title={
              table.active
                ? "Click to deactivate table"
                : "Click to activate table"
            }
            className="cursor-pointer transition-opacity hover:opacity-80"
          >
            <Badge variant={table.active ? "mint" : "secondary"}>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    table.active ? "bg-[#232323]" : "bg-muted-foreground"
                  )}
                />
                {table.active ? "Active" : "Inactive"}
              </span>
            </Badge>
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 print:gap-2">
        <div
          className={cn(
            "rounded-[14px] border border-border bg-white p-4",
            "print:border-zinc-300",
            !table.active && "opacity-65 grayscale"
          )}
        >
          <QRCodeCanvas
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

        <div className="w-full text-center text-sm font-medium text-foreground print:text-base">
          {table.label}
        </div>

        <code
          className={cn(
            "w-full truncate rounded-[8px] border border-border bg-surface px-3 py-2 text-center font-mono text-[11px] text-muted-foreground",
            "print:whitespace-normal print:break-all print:text-[8px]"
          )}
        >
          {url}
        </code>

        <div className="flex w-full items-center justify-between rounded-[10px] border border-border bg-surface px-3 py-2 print:hidden">
          <span className="text-xs text-muted-foreground">
            Status:{" "}
            <strong className="font-medium text-foreground">
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
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
              table.active ? "bg-primary" : "bg-border-strong"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background transition duration-150",
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
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-[#a1ffcb]" />
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
    window.requestAnimationFrame(() => {
      window.print();
    });
  };
  void tables;
  void buildUrl;

  return (
    <Button onClick={onPrint}>
      <Printer className="h-4 w-4" />
      Print all
    </Button>
  );
}
