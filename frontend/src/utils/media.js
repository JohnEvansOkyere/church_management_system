export function resolvePhotoUrl(photoUrl) {
  if (!photoUrl) return '';
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl;

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
  const baseRoot = apiBase.replace(/\/api\/v1\/?$/, '');
  return `${baseRoot}${photoUrl}`;
}
