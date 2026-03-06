// TypeScript types — Fixio

// ============================================================
// User
// ============================================================
export type UserRole = 'creator' | 'moderator' | 'administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  location: string;
  role: UserRole;
  provider: 'google';
  created_at: string;
  updated_at: string;
}

// ============================================================
// Post
// ============================================================
export type PostStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export interface Post {
  id: string;
  user_id: string;
  title: string;
  sector_id: string;
  region_id: string;
  criticism: string;
  solution: string;
  impact_estimate: string;
  references: string;
  status: PostStatus;
  reviewed_by: string | null;
  review_note: string;
  vote_count: number;
  comment_count?: number;
  created_at: string;
  updated_at: string;

  // Relations (populated by API)
  user?: User;
  sector?: Sector;
  region?: Region;
}

// ============================================================
// Vote
// ============================================================
export type VoteType = 'up' | 'down';

export interface Vote {
  id: string;
  user_id: string;
  post_id: string;
  type: VoteType;
}

// ============================================================
// Comment
// ============================================================
export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;

  // Relations
  user?: User;
  replies?: Comment[];
}

// ============================================================
// Sector & Region
// ============================================================
export interface Sector {
  id: string;
  name: string;
  slug: string;
  post_count?: number;
}

export type RegionType = 'nasional' | 'provinsi' | 'kota';

export interface Region {
  id: string;
  name: string;
  type: RegionType;
  parent_id: string | null;
}

// ============================================================
// API Response (Standard dari backend)
// ============================================================
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

// ============================================================
// Admin Stats (matches backend dto.StatsResponse)
// ============================================================
export interface AdminStats {
  total_users: number;
  total_posts: number;
  total_approved: number;
  total_pending_review: number;
  total_rejected: number;
  total_comments: number;
  total_votes: number;
}
