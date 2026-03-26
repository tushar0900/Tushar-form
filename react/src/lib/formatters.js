const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
});

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
};

export const formatCurrency = (value) =>
  currencyFormatter.format(Number(value || 0));
