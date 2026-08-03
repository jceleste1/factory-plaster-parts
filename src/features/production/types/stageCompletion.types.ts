// T089: Stage Completion Types
export interface StageCompletionRequest {
  batch_id: string;
  to_stage: string;
  notes?: string;
  worker_id: string;
  timestamp: string;
}

export interface StageCompletionResponse {
  success: boolean;
  batch: any; // Will reference Batch type from production.types
  message: string;
  transitionId?: string;
  previousStage?: string;
  newStage?: string;
}

export interface QueuedStageCompletion {
  id: string;
  batchId: string;
  toStage: string;
  notes?: string;
  workerId: string;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
  retryCount: number;
  lastRetry?: string;
  createdAt: string;
}

export interface UndoRequest {
  batch_id: string;
  reason?: string;
}

export interface UndoResponse {
  success: boolean;
  batch: any;
  message: string;
  undoTimestamp: string;
  previousStage: string;
  restoredStage: string;
}
