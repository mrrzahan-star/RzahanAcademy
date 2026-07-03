import { getToken } from "@/lib/api";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminStats {
  totalUsers: number; totalTests: number; totalCertificates: number;
  totalComments: number; pendingComments: number; blockedUsers: number;
  todayUsers: number; todayTests: number; todayCerts: number;
  totalJournals: number; totalDailyTasks: number; activeToday: number;
}

export interface AdminUser {
  id: number; userId: string; firstName: string | null; lastName: string | null;
  email: string | null; avatarUrl: string | null; consciousnessLevel: number | null;
  consciousnessStage: string | null; bio: string | null; streak: number;
  tasksCompleted: number; isBlocked: boolean; createdAt: string; lastActiveAt: string | null;
}

export interface AdminTest {
  id: number; userId: string; totalScore: number; stage: number; stageName: string;
  createdAt: string; firstName?: string | null; lastName?: string | null;
  email?: string | null; avatarUrl?: string | null;
}

export interface AdminCert {
  id: number; userId: string; stage: number; stageName: string;
  certificateCode: string; issuedAt: string;
  firstName?: string | null; lastName?: string | null; email?: string | null;
}

export interface AdminJournal {
  id: number; userId: string; title: string; category: string; mood: string | null;
  createdAt: string; firstName?: string | null; lastName?: string | null; email?: string | null;
}

export interface AdminComment {
  id: number; userId: string | null; authorName: string; content: string;
  rating: number | null; stage: number | null; stageName: string | null;
  approved: boolean; createdAt: string;
}

export interface AdminAuditLog {
  id: number; adminEmail: string; action: string; target: string | null;
  details: Record<string, unknown> | null; createdAt: string;
}

export interface AdminDailyTaskStat {
  userId: string; profileId: number | null; firstName: string | null; lastName: string | null;
  email: string | null; avatarUrl: string | null; streak: number | null;
  totalSlots: number; completedSlots: number; daysLogged: number;
}

export interface AdminLeaderboardEntry {
  rank: number; id: number; userId: string; firstName: string | null;
  lastName: string | null; email: string | null; avatarUrl: string | null;
  consciousnessLevel: number | null; consciousnessStage: string | null;
  streak: number; testCount: number; certCount: number;
}

export interface UserProfileDetail {
  profile: AdminUser;
  tests: AdminTest[];
  certificates: AdminCert[];
  journals: AdminJournal[];
  dailyTasks: { id: number; userId: string; date: string; taskSlot: string; done: boolean }[];
  leaderboardRank: number;
}

export async function adminFetch(url: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Xəta" }));
    throw new Error(err.error || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}


export function userName(u: { firstName?: string | null; lastName?: string | null }) {
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || "İsimsiz";
}

export function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("az-AZ");
}

export function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("az-AZ");
}
