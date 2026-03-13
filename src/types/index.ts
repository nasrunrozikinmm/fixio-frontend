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

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  location?: string;
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
  images: string[];
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
  vote_count: number;
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

// ============================================================
// Follow
// ============================================================
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowCounts {
  follower_count: number;
  following_count: number;
}

// ============================================================
// Bookmark
// ============================================================
export interface Bookmark {
  id: string;
  post_id: string;
  created_at: string;
}

export interface BookmarkListResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================
// Notification
// ============================================================
export type NotificationType = 'new_follower' | 'post_vote' | 'post_comment';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string;
  reference_id: string;
  reference_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================
// Report
// ============================================================
export type ReportReason = 'spam' | 'harassment' | 'misinformation' | 'hate_speech' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'post' | 'comment';
  target_id: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  reviewed_by: string | null;
  review_note: string;
  created_at: string;
  updated_at: string;
  reporter?: User;
  reviewer?: User;
}
