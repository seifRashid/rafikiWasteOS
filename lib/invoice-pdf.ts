import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice, Client } from "@/server/db/schema";

export interface InvoiceDocumentData {
  invoice: Invoice;
  client: Client | null;
}

export interface InvoiceLineItem {
  index: number;
  description: string;
  subtext?: string;
  rate: number;
  qty: number;
  amount: number;
}

/**
 * Builds the QR code payload for an invoice.
 * Encodes the direct invoice URL when running in a browser so scanning opens/verifies it,
 * along with key verification metadata.
 */
export function buildInvoiceQrPayload(
  invoice: Invoice,
  client: Client | null,
  origin?: string
): string {
  const baseUrl =
    origin || (typeof window !== "undefined" ? window.location.origin : "");

  if (baseUrl) {
    return `${baseUrl}/finance/invoices/${invoice.id}?inv=${encodeURIComponent(
      invoice.invoiceNumber
    )}`;
  }

  return [
    "RAFIKI WASTEOS INVOICE",
    `NO: ${invoice.invoiceNumber}`,
    `CLIENT: ${client?.name || "Client"}`,
    `PERIOD: ${invoice.billingPeriod}`,
    `AMOUNT: ${invoice.currency} ${invoice.amount}`,
    `STATUS: ${invoice.status.toUpperCase()}`,
  ].join(" | ");
}

/**
 * Generates a crisp PNG Data URL for the invoice QR code.
 */
export async function generateInvoiceQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  });
}

/**
 * Derives honest line items strictly from the real invoice + client contract records.
 */
export function buildInvoiceLineItems(
  invoice: Invoice,
  client: Client | null
): InvoiceLineItem[] {
  const totalAmount = parseFloat(invoice.amount || "0");
  const detailsParts: string[] = [];

  if (client?.wasteStreams) detailsParts.push(`Streams: ${client.wasteStreams}`);
  if (client?.binCount) detailsParts.push(`Containers: ${client.binCount}`);
  if (client?.collectionFrequency) {
    detailsParts.push(`Schedule: ${client.collectionFrequency.replace("_", " ")}`);
  }

  return [
    {
      index: 1,
      description: `Waste Collection & Recovery Services — ${invoice.billingPeriod}`,
      subtext:
        detailsParts.length > 0
          ? detailsParts.join(" • ")
          : "Contracted municipal & circular waste management service",
      rate: totalAmount,
      qty: 1,
      amount: totalAmount,
    },
  ];
}

/**
 * Generates and downloads a crisp A4 vector PDF matching the Green-Wave Invoice Template,
 * complete with the embedded QR code.
 */
export async function downloadInvoicePdf({
  invoice,
  client,
  qrDataUrl,
}: InvoiceDocumentData & { qrDataUrl?: string }): Promise<void> {
  const resolvedQr =
    qrDataUrl ||
    (await generateInvoiceQrDataUrl(buildInvoiceQrPayload(invoice, client)));

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageW = 210;
  const pageH = 297;
  const currency = invoice.currency || "KES";
  const lineItems = buildInvoiceLineItems(invoice, client);
  const subtotal = parseFloat(invoice.amount || "0");
  const taxRate = 0;
  const total = subtotal;

  // ── 1. Top Subtle Grey Curve Backdrop ──
  doc.setFillColor(244, 246, 245);
  doc.moveTo(0, 0);
  doc.lineTo(pageW, 0);
  doc.lineTo(pageW, 56);
  doc.curveTo(155, 76, 80, 62, 12, 0);
  doc.close();
  doc.fill();

  // ── 2. Top-Right Deep Forest Green Wave (#00993F) ──
  doc.setFillColor(0, 153, 63);
  doc.moveTo(86, 0);
  doc.lineTo(pageW, 0);
  doc.lineTo(pageW, 34);
  doc.curveTo(175, 48, 125, 42, 86, 0);
  doc.close();
  doc.fill();

  // ── 3. Top-Right Fresh Leaf Green Wave (#76C043) ──
  doc.setFillColor(118, 192, 67);
  doc.moveTo(100, 0);
  doc.lineTo(pageW, 0);
  doc.lineTo(pageW, 24);
  doc.curveTo(172, 40, 130, 32, 100, 0);
  doc.close();
  doc.fill();

  // ── 4. Top-Left Brand Identity (Rafiki WasteOS) ──
  // Leaf / Brand badge mark
  doc.setFillColor(0, 153, 63);
  doc.roundedRect(18, 16, 9, 9, 2.2, 2.2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("R", 22.5, 22.2, { align: "center" });

  // Brand name
  doc.setTextColor(0, 130, 53);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("RAFIKI", 30, 21.8);
  doc.setTextColor(60, 145, 78);
  doc.setFont("helvetica", "normal");
  doc.text("WASTEOS", 52.5, 21.8);

  // Slogan
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Circular Economy & Waste Logistics OS", 30, 26.5);

  // ── 5. Billing To & Invoice Metadata Row ──
  // Left: BILLING TO
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BILLING TO:", 18, 44);

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const clientNameLines = doc.splitTextToSize(client?.name || "Valued Client", 78);
  doc.text(clientNameLines, 18, 50);

  let clientInfoY = 50 + clientNameLines.length * 5.2 + 3;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);

  doc.setFont("helvetica", "bold");
  doc.text("P :", 18, clientInfoY);
  doc.setFont("helvetica", "normal");
  doc.text(client?.phone || "—", 24, clientInfoY);
  clientInfoY += 4.8;

  doc.setFont("helvetica", "bold");
  doc.text("E :", 18, clientInfoY);
  doc.setFont("helvetica", "normal");
  doc.text(client?.email || "—", 24, clientInfoY);
  clientInfoY += 4.8;

  doc.setFont("helvetica", "bold");
  doc.text("A :", 18, clientInfoY);
  doc.setFont("helvetica", "normal");
  const addressText = [client?.physicalAddress, client?.countyRegion]
    .filter(Boolean)
    .join(", ");
  const addrLines = doc.splitTextToSize(addressText || "—", 68);
  doc.text(addrLines, 24, clientInfoY);

  // Center: INVOICE heading & metadata
  doc.setTextColor(0, 153, 63);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INVOICE", 104, 52);

  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice", 104, 60);
  doc.text("Date", 104, 65);
  doc.text("Due Date", 104, 70);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(`: ${invoice.invoiceNumber}`, 121, 60);
  doc.text(`: ${formatDate(invoice.issueDate)}`, 121, 65);
  doc.text(`: ${formatDate(invoice.dueDate)}`, 121, 70);

  // Right: BILLING PERIOD & Status
  doc.setTextColor(0, 153, 63);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BILLING PERIOD", 160, 60);
  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(invoice.billingPeriod, 160, 65);

  // Status badge pill
  const statusLabel = invoice.status.toUpperCase();
  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";
  if (isPaid) {
    doc.setFillColor(237, 249, 241);
    doc.setTextColor(0, 104, 43);
  } else if (isOverdue) {
    doc.setFillColor(254, 226, 226);
    doc.setTextColor(185, 28, 28);
  } else {
    doc.setFillColor(255, 248, 214);
    doc.setTextColor(120, 86, 8);
  }
  doc.roundedRect(160, 68, 28, 6, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(statusLabel, 174, 72.1, { align: "center" });

  // ── 6. Green Header Line Items Table ──
  const tableTop = 86;
  const colX = {
    st: 18,
    desc: 32,
    rate: 122,
    qty: 148,
    amount: 168,
    right: 192,
  };

  // Header bar (#00993F)
  doc.setFillColor(0, 153, 63);
  doc.rect(18, tableTop, 174, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("ST", colX.st + 5, tableTop + 6.5, { align: "center" });
  doc.text("ITEM DESCRIPTION", colX.desc + 2, tableTop + 6.5);
  doc.text("RATE", colX.rate + 12, tableTop + 6.5, { align: "center" });
  doc.text("QTY", colX.qty + 8, tableTop + 6.5, { align: "center" });
  doc.text("AMOUNT", colX.right - 2, tableTop + 6.5, { align: "right" });

  // Table Rows
  let rowY = tableTop + 10;
  doc.setDrawColor(227, 233, 229);
  doc.setLineWidth(0.3);

  lineItems.forEach((item) => {
    const descLines = doc.splitTextToSize(item.description, 84);
    const subLines = item.subtext ? doc.splitTextToSize(item.subtext, 84) : [];
    const rowHeight = Math.max(14, descLines.length * 4.5 + subLines.length * 3.8 + 7);

    // Row divider
    doc.line(18, rowY + rowHeight, 192, rowY + rowHeight);
    // Vertical light dividers
    doc.line(30, rowY, 30, rowY + rowHeight);
    doc.line(120, rowY, 120, rowY + rowHeight);
    doc.line(146, rowY, 146, rowY + rowHeight);
    doc.line(164, rowY, 164, rowY + rowHeight);

    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(String(item.index), colX.st + 5, rowY + 7, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.text(descLines, colX.desc + 2, rowY + 6.5);
    if (subLines.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(subLines, colX.desc + 2, rowY + 6.5 + descLines.length * 4.5);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(formatCurrency(item.rate, currency), colX.rate + 12, rowY + 7, {
      align: "center",
    });
    doc.text(String(item.qty), colX.qty + 8, rowY + 7, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(item.amount, currency), colX.right - 2, rowY + 7, {
      align: "right",
    });

    rowY += rowHeight;
  });

  // Add subtle empty filler rows to preserve clean invoice proportions
  const minTableBottom = tableTop + 56;
  while (rowY < minTableBottom) {
    const emptyH = 11;
    doc.line(18, rowY + emptyH, 192, rowY + emptyH);
    doc.line(30, rowY, 30, rowY + emptyH);
    doc.line(120, rowY, 120, rowY + emptyH);
    doc.line(146, rowY, 146, rowY + emptyH);
    doc.line(164, rowY, 164, rowY + emptyH);
    rowY += emptyH;
  }

  // ── 7. Payment Method & Totals Split ──
  const summaryTop = rowY + 10;

  // Left: PAYMENT METHOD
  doc.setTextColor(0, 153, 63);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PAYMENT METHOD", 18, summaryTop);

  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  let payY = summaryTop + 5.5;
  doc.text("M-PESA PAYBILL : 400222 • ACCOUNT: " + (client?.accountNumber || invoice.invoiceNumber), 18, payY);
  payY += 4.5;
  doc.text("BANK EFT : RAFIKI WASTEOS LTD • KCB NAIROBI", 18, payY);
  payY += 4.5;
  if (invoice.paymentReference) {
    doc.setTextColor(0, 104, 43);
    doc.setFont("helvetica", "bold");
    doc.text(
      `PAID REF : ${invoice.paymentReference} (${invoice.paymentMethod || "Reconciled"})`,
      18,
      payY
    );
    payY += 4.5;
  }

  // Left: TERMS & CONDITIONS / NOTES
  const notesTop = payY + 5;
  doc.setTextColor(0, 153, 63);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TERMS & CONDITIONS / NOTES", 18, notesTop);

  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  const notesText =
    invoice.notes ||
    "1. Payment is due within 30 days via M-Pesa Business Till, Bank EFT, or County Voucher.\n2. Please quote your Invoice Number as the payment reference for instant reconciliation.";
  const noteLines = doc.splitTextToSize(notesText, 95);
  doc.text(noteLines, 18, notesTop + 5);

  // Right: SUBTOTAL, TAX, TOTAL Banner
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("SUBTOTAL", 136, summaryTop + 2);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(subtotal, currency), 192, summaryTop + 2, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text("TAX / VAT", 136, summaryTop + 9);
  doc.setFont("helvetica", "normal");
  doc.text(`${taxRate.toFixed(1)}%`, 192, summaryTop + 9, { align: "right" });

  // Green TOTAL Box
  const totalBoxY = summaryTop + 15;
  doc.setFillColor(118, 192, 67);
  doc.rect(134, totalBoxY, 16, 10, "F");
  doc.setFillColor(0, 153, 63);
  doc.rect(146, totalBoxY, 16, 10, "F");
  doc.setFillColor(240, 244, 242);
  doc.rect(162, totalBoxY, 30, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("TOTAL", 148, totalBoxY + 6.8, { align: "center" });

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(formatCurrency(total, currency), 190, totalBoxY + 6.8, { align: "right" });

  // ── 8. Bottom Subtle Grey Curve Backdrop ──
  doc.setFillColor(244, 246, 245);
  doc.moveTo(0, 212);
  doc.curveTo(65, 192, 145, 200, pageW, 236);
  doc.lineTo(pageW, pageH);
  doc.lineTo(0, pageH);
  doc.close();
  doc.fill();

  // ── 9. QR Code & Verification Label (Embedded in PDF!) ──
  const qrY = 226;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(96, qrY - 1.5, 25, 25, 2, 2, "F");
  doc.addImage(resolvedQr, "PNG", 97.5, qrY, 22, 22);

  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("More Info", 124, qrY + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("Scan QR to verify", 124, qrY + 14);
  doc.text(invoice.invoiceNumber, 124, qrY + 18.5);

  // ── 10. Signature Block (Right) ──
  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.35);
  doc.line(156, 224, 192, 224);
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Finance & Billing Dept", 156, 229);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Rafiki WasteOS Ltd", 156, 233);

  // ── 11. Bottom-Left Layered Green Waves ──
  doc.setFillColor(0, 153, 63);
  doc.moveTo(0, 252);
  doc.curveTo(58, 232, 118, 254, 148, pageH);
  doc.lineTo(0, pageH);
  doc.close();
  doc.fill();

  doc.setFillColor(118, 192, 67);
  doc.moveTo(0, 260);
  doc.curveTo(54, 244, 108, 262, 136, pageH);
  doc.lineTo(0, pageH);
  doc.close();
  doc.fill();

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("w w w . r a f i k i w a s t e . c o . k e", 18, 279);

  // ── 12. Bottom-Right Company Contact Details ──
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("+254 700 000 000", 192, 260, { align: "right" });
  doc.text("billing@rafikiwaste.co.ke", 192, 266, { align: "right" });
  doc.text("www.rafikiwaste.co.ke", 192, 270.5, { align: "right" });
  doc.text("Nairobi Industrial Area, Kenya", 192, 277.5, { align: "right" });

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
