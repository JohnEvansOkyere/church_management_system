export const formatCurrency = (amount, currency = 'GHS') =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency }).format(Number(amount || 0));

export const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(new Date(value));
};
