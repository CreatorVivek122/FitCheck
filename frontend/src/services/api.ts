import type {
  UploadResponse,
  AnalysisJob,
  FitReport,
  UserProfile,
  CompareResult
} from '../types';

const RAW_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

let currentAuthToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentAuthToken = token;
}

export function getAuthToken(): string | null {
  return currentAuthToken;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }
  return headers;
}

export function resolveImageUrl(urlOrPath?: string | null): string {
  if (!urlOrPath) return '';
  if (/^blob:/i.test(urlOrPath) || /^data:/i.test(urlOrPath)) {
    return urlOrPath;
  }
  let fullUrl = urlOrPath;
  if (!/^(https?:|\/\/)/i.test(urlOrPath)) {
    const cleanPath = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
    fullUrl = `${API_BASE}${cleanPath}`;
  }
  // Attach token parameter to direct image tags if available
  if (currentAuthToken && fullUrl.includes('/api/v1/uploads/') && !fullUrl.includes('token=')) {
    const delimiter = fullUrl.includes('?') ? '&' : '?';
    fullUrl = `${fullUrl}${delimiter}token=${encodeURIComponent(currentAuthToken)}`;
  }
  return fullUrl;
}

function normalizeReport(r: FitReport): FitReport {
  return {
    ...r,
    image_url: r.image_url ? resolveImageUrl(r.image_url) : (r.image_id ? `${API_BASE}/api/v1/uploads/${r.image_id}/file` : undefined),
    thumbnail_url: r.thumbnail_url ? resolveImageUrl(r.thumbnail_url) : (r.image_id ? `${API_BASE}/api/v1/uploads/${r.image_id}/thumbnail` : undefined),
  };
}

function normalizeUpload(u: UploadResponse): UploadResponse {
  return {
    ...u,
    preview_url: resolveImageUrl(u.preview_url),
    thumbnail_url: u.thumbnail_url ? resolveImageUrl(u.thumbnail_url) : (u.id ? `${API_BASE}/api/v1/uploads/${u.id}/thumbnail` : undefined),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        errMsg = errJson.error.message;
      } else if (errJson?.detail) {
        errMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  API_BASE,
  resolveImageUrl,
  setAuthToken,
  getAuthToken,

  // Uploads
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/v1/uploads`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    const data = await handleResponse<UploadResponse>(res);
    return normalizeUpload(data);
  },

  getImageUrl(imageId: string): string {
    const url = `${API_BASE}/api/v1/uploads/${imageId}/file`;
    return resolveImageUrl(url);
  },

  getThumbnailUrl(imageId: string): string {
    const url = `${API_BASE}/api/v1/uploads/${imageId}/thumbnail`;
    return resolveImageUrl(url);
  },

  // Analyses
  async createAnalysis(params: {
    imageId: string;
    occasion?: string;
    targetStyle?: string;
    feedbackTone?: string;
  }): Promise<AnalysisJob> {
    const res = await fetch(`${API_BASE}/api/v1/analyses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        image_id: params.imageId,
        occasion: params.occasion,
        target_style: params.targetStyle,
        feedback_tone: params.feedbackTone,
      }),
    });
    const data = await handleResponse<AnalysisJob>(res);
    if (data.report) {
      data.report = normalizeReport(data.report);
    }
    return data;
  },

  async getAnalysis(analysisId: string): Promise<AnalysisJob> {
    const res = await fetch(`${API_BASE}/api/v1/analyses/${analysisId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await handleResponse<AnalysisJob>(res);
    if (data.report) {
      data.report = normalizeReport(data.report);
    }
    return data;
  },

  // Reports
  async listReports(params?: {
    page?: number;
    limit?: number;
    q?: string;
    occasion?: string;
    sort?: 'newest' | 'score_desc' | 'score_asc';
  }): Promise<{ items: FitReport[]; total: number; has_more: boolean }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.q) searchParams.set('q', params.q);
    if (params?.occasion) searchParams.set('occasion', params.occasion);
    if (params?.sort) searchParams.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/api/v1/reports?${searchParams.toString()}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await handleResponse<{ items: FitReport[]; total: number; has_more: boolean }>(res);
    return {
      ...data,
      items: (data.items || []).map(normalizeReport),
    };
  },

  async getReport(reportId: string): Promise<FitReport> {
    const res = await fetch(`${API_BASE}/api/v1/reports/${reportId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await handleResponse<FitReport>(res);
    return normalizeReport(data);
  },

  async updateReport(
    reportId: string,
    data: { user_note?: string; is_favorite?: boolean }
  ): Promise<FitReport> {
    const res = await fetch(`${API_BASE}/api/v1/reports/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    const resData = await handleResponse<FitReport>(res);
    return normalizeReport(resData);
  },

  async deleteReport(reportId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/reports/${reportId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    await handleResponse(res);
  },

  async compareReports(
    reportAId: string,
    reportBId: string,
    occasion?: string
  ): Promise<CompareResult> {
    const res = await fetch(`${API_BASE}/api/v1/reports/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        report_a_id: reportAId,
        report_b_id: reportBId,
        target_occasion: occasion,
      }),
    });
    const data = await handleResponse<CompareResult>(res);
    return {
      ...data,
      report_a: normalizeReport(data.report_a),
      report_b: normalizeReport(data.report_b),
    };
  },

  getExportUrl(reportId: string): string {
    const url = `${API_BASE}/api/v1/reports/${reportId}/export`;
    return resolveImageUrl(url);
  },

  // User Profile
  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/v1/me`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return handleResponse<UserProfile>(res);
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/v1/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<UserProfile>(res);
  },

  getUserExportUrl(): string {
    const url = `${API_BASE}/api/v1/me/export`;
    return resolveImageUrl(url);
  },

  async exportUserData(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/v1/me/export`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
    });
    return handleResponse(res);
  },

  async wipeUserData(): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/me`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    await handleResponse(res);
  },
};
