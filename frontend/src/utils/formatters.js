export const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(new Date(value));
};
