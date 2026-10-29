export interface CategoryScore {
  score: number | null;
  confidence: 'high' | 'medium' | 'low';
  visibility: 'sufficient' | 'partial' | 'insufficient';
  rationale: string;
}

export interface ColorPaletteItem {
  hex: string;
  name: string;
  prominence: number;
}

export interface FitReport {
  id: string;
  analysis_id: string;
  image_id?: string;
  style_title: string;
  style_description: string;
  overall_score: number | null;
  overall_confidence: 'high' | 'medium' | 'low';
  scores: {
    color_coordination: CategoryScore;
    styling: CategoryScore;
    fit_proportion: CategoryScore;
    occasion_match: CategoryScore;
    [key: string]: CategoryScore;
  };
  what_works: string[];
  improvements: string[];
  styling_ideas: string[];
  limitations: string[];
  extracted_palette: ColorPaletteItem[];
  user_note?: string;
  is_favorite: boolean;
  rubric_version: string;
  model_id: string;
  created_at: string;
  image_url?: string;
}

export interface UploadResponse {
  id: string;
  mime_type: string;
  file_size_bytes: number;
  width: number;
  height: number;
  created_at: string;
  preview_url: string;
}

export interface AnalysisJob {
  id: string;
  user_id: string;
  image_id: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  occasion?: string;
  target_style?: string;
  feedback_tone?: string;
  attempt_count: number;
  error_code?: string;
  error_message?: string;
  model_provider?: string;
  rubric_version: string;
  created_at: string;
  updated_at: string;
  report?: FitReport;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  default_occasion: string;
  preferred_style: string;
  feedback_tone: string;
  privacy_mode: boolean;
  total_fits: number;
  created_at: string;
}

export interface CompareResult {
  report_a: FitReport;
  report_b: FitReport;
  score_delta: number;
  winning_report_id?: string;
  verdict: string;
  occasion_advice: string;
  pillar_comparisons: Record<string, string>;
}
