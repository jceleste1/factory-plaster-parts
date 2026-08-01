// T082 + T084: Create BatchDetailPage
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { BatchSearchBox } from '../features/production/components/BatchSearchBox';
import { BatchTimeline } from '../features/production/components/BatchTimeline';
import { AuditTrailViewer } from '../features/production/components/AuditTrailViewer';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useBatchDetail } from '../features/production/hooks/useBatchDetail';
import { UserRole } from '../features/auth/types/auth.types';
import { QualityResult, BatchStatus } from '../features/production/types/batch.types';
import { AlertCircle, CheckCircle, Truck, Package } from 'lucide-react';

export const BatchDetailPage: React.FC = () => {
  const { batch_id } = useParams<{ batch_id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: batchDetail, isLoading, error } = useBatchDetail(batch_id);
  const [showAuditTrail, setShowAuditTrail] = useState(true);

  // Permission check
  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Not authenticated</p>
        </div>
      </AppLayout>
    );
  }

  const canViewBatch = [
    UserRole.MANAGER,
    UserRole.SUPERVISOR,
    UserRole.ADMIN,
  ].includes(user.role);

  if (!canViewBatch) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-800">Your role does not have permission to view batch details.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with navigation */}
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 text-sm mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Batch Details</h1>
          <p className="text-gray-600 mt-2">View complete manufacturing timeline and audit trail</p>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search for a Different Batch
          </label>
          <BatchSearchBox
            onSelectBatch={(batchId) => {
              navigate(`/batches/${batchId}`);
            }}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Failed to load batch</h3>
              <p className="text-sm text-red-800 mt-1">{error.message}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner text="Loading batch details..." />
          </div>
        )}

        {/* Batch Details */}
        {batchDetail && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Batch ID */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Batch ID</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2 font-mono">
                  {batchDetail.batch.batch_id}
                </p>
              </div>

              {/* Current Status */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Status</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{batchDetail.batch.status}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Progress: {((batchDetail.stages.length / 8) * 100).toFixed(0)}%
                </p>
              </div>

              {/* Current Stage */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Current Stage</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">{batchDetail.batch.current_stage}</p>
              </div>

              {/* Quality Status */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Quality</h3>
                <div className="flex items-center gap-2 mt-2">
                  {batchDetail.batch.quality_status === QualityResult.PASSED ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                  <p className="text-lg font-bold text-gray-900">{batchDetail.batch.quality_status}</p>
                </div>
              </div>
            </div>

            {/* Batch Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-medium">MATERIAL BATCH ID</p>
                <p className="font-mono text-sm text-gray-900 mt-1">{batchDetail.batch.material_batch_id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-medium">CREATED</p>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(batchDetail.batch.created_at).toLocaleString()}
                </p>
              </div>
              {batchDetail.batch.completed_at && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium">COMPLETED</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(batchDetail.batch.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Timeline Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Manufacturing Timeline</h2>
              <BatchTimeline
                stageTransitions={batchDetail.stages}
                currentStage={batchDetail.batch.current_stage}
              />
            </div>

            {/* Quality Inspection */}
            {batchDetail.quality_inspection && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Quality Inspection Result</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Result</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {batchDetail.quality_inspection.result}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inspector</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {batchDetail.quality_inspection.inspector_name}
                    </p>
                  </div>
                  {batchDetail.quality_inspection.defects.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 font-medium mb-2">Defects Found</p>
                      <ul className="space-y-2">
                        {batchDetail.quality_inspection.defects.map(defect => (
                          <li key={defect.defect_id} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            <strong>{defect.defect_type}</strong> ({defect.severity}) - {defect.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Info */}
            {batchDetail.shipping_record && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Shipping Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {batchDetail.shipping_record.destination}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Carrier</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {batchDetail.shipping_record.carrier}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-mono text-sm text-gray-900 mt-1">
                      {batchDetail.shipping_record.tracking_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shipped</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(batchDetail.shipping_record.shipped_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Trail */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Audit Trail</h2>
                <button
                  onClick={() => setShowAuditTrail(!showAuditTrail)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showAuditTrail ? 'Hide' : 'Show'}
                </button>
              </div>
              {showAuditTrail && (
                <AuditTrailViewer
                  batchId={batchDetail.batch.batch_id}
                  auditTrail={batchDetail.audit_trail}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default BatchDetailPage;
