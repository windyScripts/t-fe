export function formatCurrency(amount?: number | string | null) {
  const numeric = typeof amount === "string" ? Number(amount) : amount ?? 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number.isFinite(numeric) ? numeric : 0
  );
}
