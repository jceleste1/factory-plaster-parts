// T080: Create BatchTimeline component
import React, { useState } from 'react';
import { StageTransition } from '../types/batch.types';
import { formatTime } from '@/shared/utils/formatters';
import { ChevronDown, Clock, User, CheckCircle, Circle } from 'lucide-react';

interface BatchTimelineProps {
  stageTransitions: StageTransition[];
  currentStage?: string;
  onStageClick?: (stageName: string) => void;
}

export const BatchTimeline: React.FC<BatchTimelineProps> = ({
  stageTransitions,
  currentStage,
  onStageClick,
}) => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  if (stageTransitions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>No stage transitions recorded yet</p>
      </div>
    );
  }

  const toggleStageDetails = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId);
  };

  return (
    <div className="space-y-2">
      {stageTransitions.map((transition, index) => {
        const isCurrentStage = currentStage === transition.to_stage;
        const isCompleted = !isCurrentStage;
        const durationHours = (transition.duration_in_stage / 3600).toFixed(1);

        return (
          <div key={transition.transition_id} className="relative">
            {/* Timeline line */}
            {index < stageTransitions.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-12 bg-gray-300"></div>
            )}

            {/* Stage card */}
            <div
              onClick={() => {
                onStageClick?.(transition.to_stage);
                toggleStageDetails(transition.transition_id);
              }}
              className={`relative pl-16 py-4 px-4 rounded-lg border-2 transition-all cursor-pointer ${
                isCurrentStage
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              role="article"
              aria-label={`Stage: ${transition.to_stage}`}
            >
              {/* Status indicator */}
              <div className="absolute left-3 top-5">
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-blue-600 border-2 border-current" />
                )}
              </div>

              {/* Stage header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{transition.to_stage}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Duration: {durationHours}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{transition.completed_by_user_name}</span>
                    </div>
                  </div>
                </div>

                {/* Expand button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStageDetails(transition.transition_id);
                  }}
                  className="ml-2 p-2 hover:bg-gray-100 rounded transition-colors"
                  aria-label={`${expandedStage === transition.transition_id ? 'Collapse' : 'Expand'} stage details`}
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expandedStage === transition.transition_id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600 border-t border-gray-200 pt-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium">ENTRY</p>
                  <p className="font-mono">{new Date(transition.transitioned_at).toLocaleString()}</p>
                </div>
                {transition.duration_in_stage > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">EXIT</p>
                    <p className="font-mono">
                      {new Date(
                        new Date(transition.transitioned_at).getTime() +
                          transition.duration_in_stage * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {expandedStage === transition.transition_id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {transition.from_stage && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">FROM STAGE</p>
                      <p className="text-gray-900">{transition.from_stage}</p>
                    </div>
                  )}

                  {transition.notes && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">NOTES</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{transition.notes}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 font-medium">TRANSITION ID</p>
                    <p className="font-mono text-sm text-gray-600">{transition.transition_id}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
