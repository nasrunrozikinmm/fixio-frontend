/**
 * Format ISO date string ke waktu relatif bahasa Indonesia.
 * Contoh: "2 jam lalu", "3 hari lalu", "1 bulan lalu"
 *
 * Reusable — dipakai PostCard, CommentItem, DetailPost, dll.
 */
export function formatRelativeDate(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;

  if (diffMs < 0) return 'baru saja';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 30) return `${days} hari lalu`;
  if (months < 12) return `${months} bulan lalu`;
  return `${years} tahun lalu`;
}

/**
 * Format ISO date string ke format lokal Indonesia.
 * Contoh: "3 Januari 2026"
 */
export function formatLocalDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
