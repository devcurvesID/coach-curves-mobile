import dayjs from "dayjs";

export interface BillingPdfTransaction {
  payment_date?: string | Date | null;
  payment_category?: string | null;
  payment_number?: string | null;
  amount_paid?: number | string | null;
  dc_amount?: number | string | null;
}

interface BillingHistoryPdfOptions {
  clubName: string;
  memberName: string;
  cashierName: string;
  transactions: BillingPdfTransaction[];
  serviceFee: number;
  membershipFee: number;
  discount: number;
  amountDue: number;
  amountPaid: number;
  remainingDebt: number;
  isPaidOff: boolean;
}

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const formatDate = (value?: string | Date | null): string => {
  const date = dayjs(value);
  return value && date.isValid() ? date.format("DD MMM YYYY") : "-";
};

const toNumber = (value?: number | string | null): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const buildBillingHistoryPdfHtml = ({
  clubName,
  memberName,
  cashierName,
  transactions,
  serviceFee,
  membershipFee,
  discount,
  amountDue,
  amountPaid,
  remainingDebt,
  isPaidOff,
}: BillingHistoryPdfOptions): string => {
  const transactionRows = transactions.length
    ? transactions
        .map(
          (transaction, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${formatDate(transaction.payment_date)}</td>
              <td>${escapeHtml(transaction.payment_category || "-")}</td>
              <td>${escapeHtml(transaction.payment_number || "-")}</td>
              <td class="money">${formatCurrency(toNumber(transaction.amount_paid))}</td>
              <td class="money">${formatCurrency(toNumber(transaction.dc_amount))}</td>
            </tr>`,
        )
        .join("")
    : `<tr><td colspan="6" class="empty">Belum ada detail transaksi pembayaran.</td></tr>`;

  return `<!DOCTYPE html>
  <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <style>
        @page { margin: 28px; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #1f2937; font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
        .header { padding: 23px; border-radius: 18px; color: white; background: #6F3FA0; }
        .brand { color: #e9d5ff; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; }
        h1 { margin: 5px 0 0; font-size: 24px; }
        .club { margin-top: 5px; color: #ede9fe; font-size: 13px; }
        .identity { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
        .identity-card { padding: 12px; border: 1px solid #ede9fe; border-radius: 12px; }
        .label { color: #6b7280; font-size: 9px; text-transform: uppercase; }
        .value { margin-top: 5px; font-size: 13px; font-weight: 700; }
        .section { margin-top: 18px; break-inside: avoid; }
        .section-title { margin: 0 0 9px; color: #6F3FA0; font-size: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 9px 7px; color: #6b7280; background: #f5f3ff; font-size: 9px; text-align: left; }
        td { padding: 9px 7px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        .money { white-space: nowrap; text-align: right; }
        .empty { padding: 20px; color: #6b7280; text-align: center; }
        .summary { margin-top: 17px; padding: 15px; border-radius: 14px; background: #f5f3ff; }
        .summary-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #ddd6fe; }
        .summary-row:last-child { border-bottom: 0; }
        .summary-total { color: #6F3FA0; font-size: 15px; font-weight: 700; }
        .status { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding: 14px; border-radius: 12px; }
        .paid { color: #047857; background: #ecfdf5; }
        .unpaid { color: #b91c1c; background: #fef2f2; }
        .status-title { font-size: 14px; font-weight: 700; }
        .status-description { margin-top: 4px; font-size: 9px; }
        .status-amount { font-size: 16px; font-weight: 700; }
        .footer { margin-top: 24px; padding-top: 11px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 9px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">CURVES - RIWAYAT PEMBAYARAN</div>
        <h1>Detail Pembayaran</h1>
        <div class="club">${escapeHtml(clubName)}</div>
      </div>

      <div class="identity">
        <div class="identity-card"><div class="label">Terima Dari</div><div class="value">${escapeHtml(memberName)}</div></div>
        <div class="identity-card"><div class="label">Kasir</div><div class="value">${escapeHtml(cashierName)}</div></div>
      </div>

      <div class="section">
        <h2 class="section-title">Riwayat Transaksi</h2>
        <table>
          <thead><tr><th>No.</th><th>Tanggal</th><th>Kategori</th><th>Invoice</th><th>Jumlah Dibayar</th><th>Diskon</th></tr></thead>
          <tbody>${transactionRows}</tbody>
        </table>
      </div>

      <div class="summary">
        <div class="summary-row"><span>Total Biaya Layanan</span><strong>${formatCurrency(serviceFee)}</strong></div>
        <div class="summary-row"><span>Total Biaya Keanggotaan</span><strong>${formatCurrency(membershipFee)}</strong></div>
        <div class="summary-row"><span>Total Diskon</span><strong>${formatCurrency(discount)}</strong></div>
        <div class="summary-row"><span>Total yang Harus Dibayar</span><strong>${formatCurrency(amountDue)}</strong></div>
        <div class="summary-row summary-total"><span>Total yang Sudah Dibayar</span><span>${formatCurrency(amountPaid)}</span></div>
      </div>

      <div class="status ${isPaidOff ? "paid" : "unpaid"}">
        <div><div class="status-title">${isPaidOff ? "Pembayaran Lunas" : "Sisa Hutang"}</div><div class="status-description">${isPaidOff ? "Tidak ada sisa hutang yang perlu dibayarkan." : "Pembayaran masih perlu diselesaikan."}</div></div>
        <div class="status-amount">${formatCurrency(isPaidOff ? 0 : remainingDebt)}</div>
      </div>

      <div class="footer">Dibuat pada ${dayjs().format("DD MMM YYYY HH:mm")} - Dokumen ini merupakan ringkasan riwayat pembayaran member.</div>
    </body>
  </html>`;
};
