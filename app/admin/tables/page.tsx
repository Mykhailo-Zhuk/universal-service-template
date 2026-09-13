"use client";

/**
 * Admin / Tables & QR (G-262)
 *
 * Lists every physical table in the venue, generates a QR code that points
 * at the public ordering URL, and lets the operator print or download the
 * sticker as PNG.
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

  const tables = useMemo<Table[]>(() => DEMO_TABLES, []);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCodeIcon className="h-4 w-4 text-indigo-500" />
            {tables.length} tables ready
          </CardTitle>
          <CardDescription>
            Each QR code is unique to its table — orders are automatically
            associated with <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">{`<tableId>`}</code>{" "}
            from the URL.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <TableQrCard
            key={table.id}
            table={table}
            url={tableUrl(table.id)}
            copied={copiedId === table.id}
            onCopy={() => copyLink(table.id)}
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
}: {
  table: Table;
  url: string;
  copied: boolean;
  onCopy: () => void;
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
    <Card className="overflow-hidden print:break-inside-avoid print:border-zinc-300">
      {/* Sticker header — only shown on print. */}
      <div className="hidden print:block print:px-4 print:pt-3">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500">
          Scan to order
        </div>
        <div className="text-base font-bold">Demo Restaurant</div>
      </div>

      <CardHeader className="print:hidden">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            {table.id}
          </span>
          {table.label}
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
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
          <Badge variant={table.active ? "success" : "secondary"}>
            {table.active ? "Active" : "Inactive"}
          </Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 print:gap-2">
        {/* The QR */}
        <div
          className={cn(
            "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
            "print:border-zinc-300 print:shadow-none"
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