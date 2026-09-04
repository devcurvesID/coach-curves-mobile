import dayjs from "dayjs";

interface PaymentDueInfo {
  payment_date?: string | null;
  payment_status?: string | null;
  rest_of_bill?: string | number | null;
}

/** API uses payment_date as the scheduled payment date for unpaid bills. */
export function getPaymentOverdueDays(
  payment: PaymentDueInfo,
  today: Date = new Date(),
): number | null {
  const status = payment.payment_status?.trim().toLowerCase();
  if (status === "paid" || status === "lunas") return null;

  const balance = payment.rest_of_bill;
  if (balance != null && String(balance).trim() !== "") {
    const remaining = Number(balance);
    if (!Number.isFinite(remaining) || remaining <= 0) return null;
  } else if (status !== "unpaid") {
    return null;
  }

  if (!payment.payment_date) return null;
  const dueDate = dayjs(payment.payment_date);
  const currentDate = dayjs(today);
  if (!dueDate.isValid() || !currentDate.isValid()) return null;

  return Math.max(
    0,
    currentDate.startOf("day").diff(dueDate.startOf("day"), "day"),
  );
}
