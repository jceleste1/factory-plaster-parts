/**
 * Report Types - Efficiency Reports & Waste Reduction
 * User Story 5: System generates automated efficiency metrics, bottleneck identification,
 * waste patterns, scrap rates, and predictive alerts for management decision-making.
 */

export type TrendDirection = 'UP' | 'DOWN' | 'STABLE';

export interface StageMetric {
  stage_id: string;
  stage_name: string;
  avg_duration: number; // hours
  historical_avg: number; // hours
  trend: TrendDirection;
  bottleneck_flag: boolean;
  trend_percentage: number; // % change from historical
}

export interface ScrapData {
  stage_id: string;
  stage_name: string;
  defect_count: number;
  rework_rate: number; // percentage 0-100
  cost_impact: number; // USD
  defect_breakdown?: DefectBreakdown[];
}

export interface DefectBreakdown {
  defect_type: string;
  count: number;
  percentage: number;
}

export interface DateRange {
  start_date: string; // ISO 8601 format YYYY-MM-DD
  end_date: string; // ISO 8601 format YYYY-MM-DD
}

export interface EfficiencyReport {
  report_id: string;
  date_range: DateRange;
  generated_at: string; // ISO 8601 timestamp
  stages: StageMetric[];
  scrap_data: ScrapData[];
  total_batches_processed: number;
  production_velocity: number; // batches per day
  trends: {
    overall_trend: TrendDirection;
    bottleneck_stages: string[]; // stage names
    improving_stages: string[];
    declining_stages: string[];
  };
}

export interface BatchDetailForReport {
  batch_id: string;
  stage_name: string;
  entry_timestamp: string; // ISO 8601
  exit_timestamp: string; // ISO 8601
  duration: number; // hours
  rework_status: boolean;
  quality_result: 'PASS' | 'FAIL' | 'CONDITIONAL' | null;
  defect_count: number;
}

export interface DrillDownData {
  stage_name: string;
  date_range: DateRange;
  batches: BatchDetailForReport[];
  total_duration: number; // combined hours
  avg_duration: number; // hours
  rework_rate: number; // percentage
}

export interface ExportFormat {
  format: 'PDF' | 'CSV';
  filename: string;
  timestamp: string;
}
