// Phase 8: T125 - DefectRecorder Component
// Add, edit, and display defect records for quality inspections

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { DefectRecord, DefectType } from '@/features/quality/types/quality.types';
import { defectRecordSchema, DefectRecordFormData } from '@/features/quality/types/quality.schema';
import qualityService from '@/features/quality/services/qualityService';
import DefectCodeSelector from '@/shared/components/DefectCodeSelector';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

interface DefectRecorderProps {
  batchId: string;
  onDefectsChange: (defects: DefectRecord[]) => void;
  initialDefects?: DefectRecord[];
  readonly?: boolean;
}

/**
 * Component for recording and managing defects during quality inspection
 * Allows adding, editing, deleting defect records with photos
 */
export function DefectRecorder({
  batchId,
  onDefectsChange,
  initialDefects = [],
  readonly = false,
}: DefectRecorderProps) {
  const [defects, setDefects] = useState<DefectRecord[]>(initialDefects);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<DefectRecordFormData>({
    resolver: zodResolver(defectRecordSchema),
    defaultValues: {
      batch_id: batchId,
      defect_type: DefectType.SURFACE_DEFECTS,
      location: '',
      quantity: 1,
      severity: 3,
    },
  });

  const severity = watch('severity');

  const onSubmit = useCallback(
    async (data: DefectRecordFormData) => {
      try {
        let photoUrl: string | undefined;

        // Upload photo if selected
        if (photoFile && !uploadingPhotoId) {
          setUploadingPhotoId(editingId || 'new');
          try {
            const uploadResult = await qualityService.uploadDefectPhoto(batchId, photoFile);
            photoUrl = uploadResult.photo_url;
          } catch (error) {
            console.error('Photo upload failed:', error);
            alert('Photo upload failed. Defect will be saved without photo.');
          } finally {
            setUploadingPhotoId(null);
          }
        }

        const defectRecord: DefectRecord = {
          defect_id: editingId || `defect_${Date.now()}`,
          batch_id: batchId,
          defect_type: data.defect_type as DefectType,
          location: data.location,
          quantity: data.quantity,
          severity: data.severity,
          photo_url: photoUrl,
          created_at: new Date().toISOString(),
          created_by: 'current-user', // Will be filled by API
        };

        // Update or add defect
        const updatedDefects = editingId
          ? defects.map((d) => (d.defect_id === editingId ? defectRecord : d))
          : [...defects, defectRecord];

        setDefects(updatedDefects);
        onDefectsChange(updatedDefects);

        // Reset form
        reset();
        setShowForm(false);
        setEditingId(null);
        setPhotoFile(null);
      } catch (error) {
        console.error('Error submitting defect:', error);
        alert('Failed to save defect. Please try again.');
      }
    },
    [batchId, defects, editingId, photoFile, uploadingPhotoId, onDefectsChange, reset]
  );

  const handleEdit = useCallback((defect: DefectRecord) => {
    setEditingId(defect.defect_id);
    reset({
      batch_id: defect.batch_id,
      defect_type: defect.defect_type,
      location: defect.location,
      quantity: defect.quantity,
      severity: defect.severity,
      photo_url: defect.photo_url,
    });
    setShowForm(true);
  }, [reset]);

  const handleDelete = useCallback((id: string) => {
    const updatedDefects = defects.filter((d) => d.defect_id !== id);
    setDefects(updatedDefects);
    onDefectsChange(updatedDefects);
  }, [defects, onDefectsChange]);

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setPhotoFile(null);
    reset();
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 2) return 'bg-yellow-100 text-yellow-800';
    if (severity <= 3) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getSeverityLabel = (severity: number) => {
    const labels: Record<number, string> = {
      1: 'Minor',
      2: 'Low',
      3: 'Medium',
      4: 'High',
      5: 'Critical',
    };
    return labels[severity] || 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Defect Records</h3>
        {!readonly && (
          <button
            onClick={() => {
              setEditingId(null);
              reset();
              setPhotoFile(null);
              setShowForm(!showForm);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
              ${
                showForm
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
            aria-label="Add new defect"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Add Defect'}
          </button>
        )}
      </div>

      {/* Add/Edit Defect Form */}
      {showForm && !readonly && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4"
        >
          {/* Defect Type */}
          <Controller
            name="defect_type"
            control={control}
            render={({ field }) => (
              <DefectCodeSelector
                value={field.value}
                onChange={field.onChange}
                error={errors.defect_type?.message}
                required
              />
            )}
          />

          {/* Location */}
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  {...field}
                  id="location"
                  type="text"
                  placeholder="E.g., Top surface, left corner, middle edge..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500
                    ${errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                  `}
                  aria-describedby={errors.location ? 'location-error' : undefined}
                />
                {errors.location && (
                  <p id="location-error" className="mt-1 text-sm text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Quantity & Severity in grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...field}
                    id="quantity"
                    type="number"
                    min="1"
                    max="999"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500
                      ${errors.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                    `}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                  />
                  {errors.quantity && (
                    <p id="quantity-error" className="mt-1 text-sm text-red-600">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Severity Level */}
            <Controller
              name="severity"
              control={control}
              render={({ field }) => (
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                    Severity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      {...field}
                      id="severity"
                      type="range"
                      min="1"
                      max="5"
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(severity)}`}>
                      {getSeverityLabel(severity)}
                    </span>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Evidence (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="hidden"
                id="photo-input"
                aria-label="Upload defect photo"
              />
              <label
                htmlFor="photo-input"
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Photo</span>
              </label>
              {photoFile && <span className="text-sm text-gray-600">{photoFile.name}</span>}
            </div>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, WebP (Max 5MB)</p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingPhotoId === (editingId || 'new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadingPhotoId ? 'Saving...' : editingId ? 'Update Defect' : 'Add Defect'}
            </button>
          </div>
        </form>
      )}

      {/* Defects List */}
      <div className="space-y-2">
        {defects.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            {readonly ? 'No defects recorded' : 'No defects recorded yet'}
          </p>
        ) : (
          defects.map((defect) => (
            <div
              key={defect.defect_id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{defect.defect_type}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(defect.severity)}`}>
                      {getSeverityLabel(defect.severity)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {defect.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Quantity:</span> {defect.quantity}
                  </p>
                  {defect.photo_url && (
                    <a
                      href={defect.photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      📷 View Photo
                    </a>
                  )}
                </div>

                {!readonly && (
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => handleEdit(defect)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      aria-label={`Edit defect ${defect.defect_id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(defect.defect_id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      aria-label={`Delete defect ${defect.defect_id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary stats */}
      {defects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <span className="font-medium">{defects.length}</span> defect{defects.length !== 1 ? 's' : ''} recorded
            {defects.some((d) => d.photo_url) && (
              <span> • <span className="font-medium">{defects.filter((d) => d.photo_url).length}</span> with photo evidence</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default DefectRecorder;
