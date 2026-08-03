/**
 * Report Validation Schemas
 * Zod schemas for runtime validation of report data
 */

import { z } from 'zod';

export const TrendSchema = z.enum(['UP', 'DOWN', 'STABLE']);

export const DateRangeSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
}).refine(
  (data) => new Date(data.start_date) <= new Date(data.end_date),
  {
    message: 'end_date must be after or equal to start_date',
    path: ['end_date'],
  }
);

export const DefectBreakdownSchema = z.object({
  defect_type: z.string().min(1),
  count: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
});

export const StageMetricSchema = z.object({
  stage_id: z.string().uuid(),
  stage_name: z.string().min(1),
  avg_duration: z.number().nonnegative(),
  historical_avg: z.number().nonnegative(),
  trend: TrendSchema,
  bottleneck_flag: z.boolean(),
  trend_percentage: z.number(),
});

export const ScrapDataSchema = z.object({
  stage_id: z.string().uuid(),
  stage_name: z.string().min(1),
  defect_count: z.number().int().nonnegative(),
  rework_rate: z.number().min(0).max(100),
  cost_impact: z.number().nonnegative(),
  defect_breakdown: z.array(DefectBreakdownSchema).optional(),
});

export const EfficiencyReportSchema = z.object({
  report_id: z.string().uuid(),
  date_range: DateRangeSchema,
  generated_at: z.string().datetime(),
  stages: z.array(StageMetricSchema),
  scrap_data: z.array(ScrapDataSchema),
  total_batches_processed: z.number().int().nonnegative(),
  production_velocity: z.number().nonnegative(),
  trends: z.object({
    overall_trend: TrendSchema,
    bottleneck_stages: z.array(z.string()),
    improving_stages: z.array(z.string()),
    declining_stages: z.array(z.string()),
  }),
});

export const BatchDetailForReportSchema = z.object({
  batch_id: z.string().min(1),
  stage_name: z.string().min(1),
  entry_timestamp: z.string().datetime(),
  exit_timestamp: z.string().datetime(),
  duration: z.number().nonnegative(),
  rework_status: z.boolean(),
  quality_result: z.enum(['PASS', 'FAIL', 'CONDITIONAL']).nullable(),
  defect_count: z.number().int().nonnegative(),
});

export const DrillDownDataSchema = z.object({
  stage_name: z.string().min(1),
  date_range: DateRangeSchema,
  batches: z.array(BatchDetailForReportSchema),
  total_duration: z.number().nonnegative(),
  avg_duration: z.number().nonnegative(),
  rework_rate: z.number().min(0).max(100),
});

export const ExportFormatSchema = z.object({
  format: z.enum(['PDF', 'CSV']),
  filename: z.string().min(1),
  timestamp: z.string().datetime(),
});
