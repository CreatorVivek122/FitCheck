import type {
  UploadResponse,
  AnalysisJob,
  FitReport,
  UserProfile,
  CompareResult
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        errMsg = errJson.error.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Uploads
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/v1/uploads`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<UploadResponse>(res);
  },

  getImageUrl(imageId: string): string {
    return `${API_BASE}/api/v1/uploads/${imageId}/file`;
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
      },
      body: JSON.stringify({
        image_id: params.imageId,
        occasion: params.occasion,
        target_style: params.targetStyle,
        feedback_tone: params.feedbackTone,
      }),
    });
    return handleResponse<AnalysisJob>(res);
  },

  async getAnalysis(analysisId: string): Promise<AnalysisJob> {
    const res = await fetch(`${API_BASE}/api/v1/analyses/${analysisId}`);
    return handleResponse<AnalysisJob>(res);
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

    const res = await fetch(`${API_BASE}/api/v1/reports?${searchParams.toString()}`);
    return handleResponse(res);
  },

  async getReport(reportId: string): Promise<FitReport> {
    const res = await fetch(`${API_BASE}/api/v1/reports/${reportId}`);
    return handleResponse<FitReport>(res);
  },

  async updateReport(
    reportId: string,
    data: { user_note?: string; is_favorite?: boolean }
  ): Promise<FitReport> {
    const res = await fetch(`${API_BASE}/api/v1/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<FitReport>(res);
  },

  async deleteReport(reportId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/reports/${reportId}`, {
      method: 'DELETE',
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_a_id: reportAId,
        report_b_id: reportBId,
        target_occasion: occasion,
      }),
    });
    return handleResponse<CompareResult>(res);
  },

  getExportUrl(reportId: string): string {
    return `${API_BASE}/api/v1/reports/${reportId}/export`;
  },

  // User Profile
  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/v1/me`);
    return handleResponse<UserProfile>(res);
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/v1/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<UserProfile>(res);
  },

  getUserExportUrl(): string {
    return `${API_BASE}/api/v1/me/export`;
  },

  async wipeUserData(): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/me`, {
      method: 'DELETE',
    });
    await handleResponse(res);
  },
};
