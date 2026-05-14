const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

// ── Types ──
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  token?: string;
  role?: string;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  sort_order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  problems: Problem[];
}

export interface Problem {
  id: string;
  chapter_id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  youtube_url: string;
  practice_url: string;
  article_url: string;
  sort_order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  problem_id: string;
  completed: boolean;
  completed_at: string | null;
  problem_title?: string;
  problem_slug?: string;
  difficulty?: string;
  chapter_title?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

// ── Token Management ──
function getToken(): string | null {
  return localStorage.getItem('algotrack_token') || sessionStorage.getItem('algotrack_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ── Auth API ──
export async function loginAPI(email: string, password: string): Promise<ApiResponse<User>> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function registerAPI(email: string, password: string, display_name: string): Promise<ApiResponse<User>> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, display_name }),
  });
  return res.json();
}

// ── User API ──
export async function getUserAPI(id: string): Promise<ApiResponse<User>> {
  const res = await fetch(`${API_BASE}/users/${id}`, { headers: authHeaders() });
  return res.json();
}

export async function updateUserAPI(id: string, data: { display_name?: string; photo_url?: string }): Promise<ApiResponse<User>> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// ── Chapters API ──
export async function getChaptersAPI(): Promise<ApiResponse<Chapter[]>> {
  const res = await fetch(`${API_BASE}/chapters`, { headers: authHeaders() });
  return res.json();
}

// ── Progress API ──
export async function getProgressAPI(userId: string): Promise<ApiResponse<string[]>> {
  const res = await fetch(`${API_BASE}/progress`, { headers: authHeaders() });
  return res.json();
}

export async function toggleProgressAPI(problemId: string, completed: boolean): Promise<ApiResponse<{ id?: string; completed: boolean }>> {
  const res = await fetch(`${API_BASE}/progress/toggle`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ problemId, completed }), 
  });
  return res.json();
}

export async function getProgressStatsAPI(userId: string): Promise<ApiResponse<{
  totalCompleted: number;
  totalProblems: number;
  progressPercentage: number;
  byDifficulty: { difficulty: string; completed: number; total: number }[];
  byChapter: { 
    chapter_id: string; 
    chapter_title: string; 
    completed: number; 
    total: number;
    easy_completed: number;
    easy_total: number;
    medium_completed: number;
    medium_total: number;
    hard_completed: number;
    hard_total: number;
  }[];
}>> {
  const res = await fetch(`${API_BASE}/progress/stats`, { headers: authHeaders() });
  return res.json();
}

// ── Admin API ──
export interface AdminStudent {
  id: string;
  email: string;
  display_name: string | null;
  createdAt: string;
  completed_count: number;
  total_problems: number;
}

export async function getAdminStudentsAPI(): Promise<ApiResponse<AdminStudent[]>> {
  const res = await fetch(`${API_BASE}/admin/students`, { headers: authHeaders() });
  return res.json();
}

export async function getAdminStudentProgressAPI(studentId: string): Promise<ApiResponse<ProgressEntry[]>> {
  const res = await fetch(`${API_BASE}/admin/students/${studentId}/progress`, { headers: authHeaders() });
  return res.json();
}

export async function updateAdminProblemAPI(problemId: string, data: Partial<Problem>): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/admin/problems/${problemId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createAdminProblemAPI(data: Partial<Problem> & { chapter_id: string }): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/admin/problems`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createAdminChapterAPI(data: { title: string; sort_order?: number }): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/admin/chapters`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}
