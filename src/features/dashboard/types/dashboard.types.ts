// T060: Create production types for dashboard
import { ManufacturingStage, StatusIndicator } from '../../shared/types/domain.types';

export interface Stage {
  stage_name: ManufacturingStage;
  batch_count: number;
  avg_duration_hours: number;
  status: StatusIndicator;
  trend: 'up' | 'down' | 'stable';
  last_update?: string;
}

export interface DashboardResponse {
  timestamp: string;
  production_velocity: number; // batches per day
  stages: Stage[];
  bottleneck_stage?: ManufacturingStage;
  total_active_batches: number;
  efficiency_rate?: number; // percentage
}

export interface ProductionVelocityMetric {
  velocity: number;
  unit: 'batches_per_day' | 'batches_per_hour';
  trend: 'up' | 'down' | 'stable';
  change_percentage?: number;
}

export interface BottleneckInfo {
  stage: ManufacturingStage;
  batch_count: number;
  expected_throughput: number;
  delay_hours: number;
}

export interface DashboardMetrics {
  total_active_batches: number;
  stages_in_progress: number;
  avg_batch_duration_hours: number;
  production_velocity: ProductionVelocityMetric;
  bottleneck?: BottleneckInfo;
  last_updated: Date;
}
