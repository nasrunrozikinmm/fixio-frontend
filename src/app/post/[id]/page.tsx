import type { Metadata } from 'next';
import type { Post } from '@/types';
import PostDetailClient from './PostDetailClient';

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Server-side fetch for post data (public endpoint, no auth required). */
async function fetchPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });
    if (!res.ok) return null;
    const json: ApiResponse<Post> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Strip HTML tags and truncate text for meta descriptions. */
function stripAndTruncate(html: string, maxLength = 160): string {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

// ────────────────────────────────────────────
// Dynamic SEO metadata
// ────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPost(id);

  if (!post) {
    return {
      title: 'Post tidak ditemukan — Fixio',
      description: 'Post yang Anda cari tidak ditemukan atau telah dihapus.',
    };
  }

  const description = stripAndTruncate(post.criticism);
  const sectorLabel = post.sector?.name ?? '';
  const title = `${post.title} — Fixio`;

  return {
    title,
    description,
    keywords: [sectorLabel, 'kebijakan publik', 'kritik', 'solusi'].filter(Boolean),
    authors: post.user ? [{ name: post.user.name }] : undefined,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: post.user ? [post.user.name] : undefined,
      tags: [sectorLabel].filter(Boolean),
      images: post.images?.length
        ? post.images.map((img) => ({ url: img, alt: post.title }))
        : undefined,
    },
    twitter: {
      card: post.images?.length ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: post.images?.length ? [post.images[0]] : undefined,
    },
  };
}

// ────────────────────────────────────────────
// Page (Server Component)
// ────────────────────────────────────────────

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PostDetailClient id={id} />;
}
