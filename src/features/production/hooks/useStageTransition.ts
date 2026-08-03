// T092: useStageTransition Hook
// Handles stage transitions with offline support, optimistic updates, and undo capability
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import productionService from '../services/productionService';
import { offlineQueueService } from '@/shared/services/offlineQueueService';
import { useConnectionStatus } from '@/shared/hooks/useConnectionStatus';
import { Batch } from '../types/production.types';

interface UseStageTransitionOptions {
  onSuccess?: (batch: Batch) => void;
  onError?: (error: Error) => void;
  onUndo?: (batch: Batch) => void;
}

interface StageTransitionState {
  lastTransitionId?: string;
  lastBatchId?: string;
  lastPreviousStage?: string;
  lastNewStage?: string;
  transitionTime?: number;
  undoAvailable: boolean;
}

export const useStageTransition = (options: UseStageTransitionOptions = {}) => {
  const { onSuccess, onError, onUndo } = options;
  const queryClient = useQueryClient();
  const { isOnline } = useConnectionStatus();
  const [queuedCount, setQueuedCount] = useState(0);
  const [isOnlineMode, setIsOnlineMode] = useState(isOnline);
  const stateRef = useRef<StageTransitionState>({
    undoAvailable: false,
  });
  const undoTimeoutRef = useRef<NodeJS.Timeout>();

  // Update undo availability
  const updateUndoAvailability = useCallback((available: boolean) => {
    stateRef.current.undoAvailable = available;
  }, []);

  // Stage transition mutation
  const transitionMutation = useMutation({
    mutationFn: async (batchId: string) => {
      if (!isOnlineMode) {
        // Queue for later
        const userId = 'worker-' + Date.now(); // TODO: Get from auth context
        await offlineQueueService.enqueue({
          batchId,
          toStage: 'NEXT',
          workerId: userId,
          timestamp: new Date().toISOString(),
          status: 'pending',
          retryCount: 0,
        });

        // Update queue count
        const stats = await offlineQueueService.getStats();
        setQueuedCount(stats.pending);

        throw new Error('OFFLINE_QUEUED');
      }

      return productionService.logStageCompletion(batchId);
    },
    onSuccess: (batch: Batch) => {
      // Store transition state for undo
      stateRef.current.lastBatchId = batch.batch_id;
      stateRef.current.transitionTime = Date.now();
      updateUndoAvailability(true);

      // Set 5-second undo window
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      undoTimeoutRef.current = setTimeout(() => {
        updateUndoAvailability(false);
      }, 5000);

      // Optimistic update
      queryClient.setQueryData(
        ['production', 'batch', batch.batch_id],
        batch
      );

      // Refetch my work list
      queryClient.refetchQueries({ queryKey: ['production', 'my-work'] });

      if (onSuccess) {
        onSuccess(batch);
      }
    },
    onError: (error: Error) => {
      if (error.message !== 'OFFLINE_QUEUED') {
        console.error('Stage transition failed:', error);
        if (onError) {
          onError(error);
        }
      }
    },
  });

  // Undo mutation
  const undoMutation = useMutation({
    mutationFn: async () => {
      if (!stateRef.current.lastBatchId) {
        throw new Error('No recent transition to undo');
      }

      if (!stateRef.current.undoAvailable) {
        throw new Error('Undo window expired (5 seconds)');
      }

      return productionService.undoStageCompletion(stateRef.current.lastBatchId);
    },
    onSuccess: (batch: Batch) => {
      updateUndoAvailability(false);

      // Update cache
      queryClient.setQueryData(
        ['production', 'batch', batch.batch_id],
        batch
      );

      // Refetch my work list
      queryClient.refetchQueries({ queryKey: ['production', 'my-work'] });

      if (onUndo) {
        onUndo(batch);
      }
    },
    onError: (error: Error) => {
      console.error('Undo failed:', error);
      if (onError) {
        onError(error);
      }
    },
  });

  // Manual undo function
  const undo = useCallback(async () => {
    if (!stateRef.current.undoAvailable) {
      throw new Error('Undo is no longer available');
    }
    return undoMutation.mutate();
  }, [undoMutation]);

  return {
    mutate: (batchId: string) => transitionMutation.mutate(batchId),
    mutateAsync: (batchId: string) => transitionMutation.mutateAsync(batchId),
    undo,
    isLoading: transitionMutation.isPending || undoMutation.isPending,
    isTransitioning: transitionMutation.isPending,
    isUndoing: undoMutation.isPending,
    isOnline: isOnlineMode,
    queuedCount,
    undoAvailable: stateRef.current.undoAvailable,
    error: transitionMutation.error || undoMutation.error,
  };
};
