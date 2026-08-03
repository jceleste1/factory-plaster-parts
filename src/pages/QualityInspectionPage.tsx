// Phase 8: T127 - QualityInspectionPage
// Quality inspection queue and workflow page

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { useQualityQueue } from '@/features/quality/hooks/useQualityQueue';
import { useQualityInspection } from '@/features/quality/hooks/useQualityInspection';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Batch } from '@/features/production/types/production.types';
import { QualityInspectionForm } from '@/features/quality/components/QualityInspectionForm';
import { TimeInQualityIndicator } from '@/features/quality/components/TimeInQualityIndicator';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { QualityResult } from '@/features/quality/types/quality.types';

interface InspectionBatch {
  batch_id: string;
  material_type: string;
  batch_size: number;
  entered_quality_at: string;
  time_in_quality_seconds: number;
  material_batch_code: string;
  stage: string;
}

/**
 * Quality Inspection Page
 * Displays batches waiting for inspection and allows QC controllers to record results
 */
export function QualityInspectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { batches = [], isLoading, error, refetch } = useQualityQueue();
  const { mutate: submitInspection, isPending: isSubmitting } = useQualityInspection();

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Check if user has QC role
  const isQualityController = user?.role === 'QUALITY_CONTROLLER' || user?.role === 'MANAGER' || user?.role === 'ADMIN';

  if (!isQualityController) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-red-900">Access Denied</h2>
              <p className="text-red-700 mt-1">Only Quality Controllers can access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedBatch = batches?.find((b) => b.batch_id === selectedBatchId) as
    | (InspectionBatch & Partial<Batch>)
    | undefined;

  const handleInspectClick = useCallback((batch: InspectionBatch) => {
    setSelectedBatchId(batch.batch_id);
    setShowForm(true);
  }, []);

  const handleFormSuccess = useCallback(
    (result: QualityResult, message: string) => {
      setSuccessMessage(message);
      setShowForm(false);
      setSelectedBatchId(null);

      // Refetch queue after 1 second
      setTimeout(() => {
        refetch();
        setSuccessMessage('');
      }, 1000);
    },
    [refetch]
  );

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedBatchId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-blue-600"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">Quality Inspections</span>
          </div>

          {/* Title and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quality Inspections</h1>
              <p className="text-gray-600 mt-1">Review and approve batches awaiting quality control</p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              aria-label="Refresh quality queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <div className="text-green-700">
              <p className="font-medium">✓ Success</p>
              <p className="text-sm mt-1">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="text-red-700">
              <p className="font-medium">Error loading quality queue</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <LoadingSpinner />
              <p className="text-gray-600 mt-4">Loading batches...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!batches || batches.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No batches waiting for inspection</p>
            <p className="text-gray-500 mt-2">All batches have been processed or are in other stages</p>
          </div>
        )}

        {/* Batches Grid */}
        {!isLoading && batches && batches.length > 0 && (
          <div className="grid gap-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Batch ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Material Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Batch Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Time in Quality</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {batches.map((batch) => (
                      <tr
                        key={batch.batch_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-mono font-medium text-gray-900">{batch.batch_id}</p>
                          <p className="text-xs text-gray-500 mt-1">{batch.material_batch_code}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-gray-900">{batch.material_type}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-gray-900">{batch.batch_size} units</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TimeInQualityIndicator
                            enteredQualityAt={batch.entered_quality_at}
                            showAlert={true}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleInspectClick(batch)}
                            disabled={showForm && selectedBatchId === batch.batch_id}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                              ${
                                showForm && selectedBatchId === batch.batch_id
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }
                              disabled:opacity-50 transition-colors
                            `}
                            aria-label={`Inspect batch ${batch.batch_id}`}
                          >
                            {showForm && selectedBatchId === batch.batch_id ? 'Inspecting...' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inspection Form Modal */}
      {showForm && selectedBatch && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleFormCancel();
          }}
        >
          <QualityInspectionForm
            batch={selectedBatch as Batch}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Mobile Responsive Notes */}
      <div className="fixed bottom-4 right-4 md:hidden bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs">
        <p className="text-xs text-gray-600">
          💡 Tap "Inspect" to open the quality inspection form for any batch
        </p>
      </div>
    </div>
  );
}

export default QualityInspectionPage;
