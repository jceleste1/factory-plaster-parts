// T061: Create dashboard Zod schema for API response validation
import { ManufacturingStage, StatusIndicator } from '@/shared/types/domain.types';
import { z } from 'zod';
export const stageSchema = z.object({
  stage_name: z.nativeEnum(ManufacturingStage),
  batch_count: z.number().int().min(0),
  avg_duration_hours: z.number().min(0),
  status: z.nativeEnum(StatusIndicator),
  trend: z.enum(['up', 'down', 'stable']),
  last_update: z.string().datetime().optional(),
});

export const dashboardSchema = z.object({
  timestamp: z.string().datetime(),
  production_velocity: z.number().positive(),
  stages: z.array(stageSchema),
  bottleneck_stage: z.nativeEnum(ManufacturingStage).optional(),
  total_active_batches: z.number().int().min(0),
  efficiency_rate: z.number().min(0).max(100).optional(),
});

export const productionVelocitySchema = z.object({
  velocity: z.number().positive(),
  unit: z.enum(['batches_per_day', 'batches_per_hour']),
  trend: z.enum(['up', 'down', 'stable']),
  change_percentage: z.number().optional(),
});

export const bottleneckInfoSchema = z.object({
  stage: z.nativeEnum(ManufacturingStage),
  batch_count: z.number().int().min(0),
  expected_throughput: z.number().positive(),
  delay_hours: z.number().min(0),
});

export type StageData = z.infer<typeof stageSchema>;
export type DashboardData = z.infer<typeof dashboardSchema>;
export type ProductionVelocityData = z.infer<typeof productionVelocitySchema>;
export type BottleneckData = z.infer<typeof bottleneckInfoSchema>;
