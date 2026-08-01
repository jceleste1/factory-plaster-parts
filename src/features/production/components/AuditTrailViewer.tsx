// T081: Create AuditTrailViewer component
import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { AuditLogEntry } from '../types/batch.types';
import batchService from '../services/batchService';

interface AuditTrailViewerProps {
  batchId: string;
  auditTrail: AuditLogEntry[];
  onExport?: (format: 'pdf' | 'csv') => void;
  isExporting?: boolean;
}

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({
  batchId,
  auditTrail,
  onExport,
  isExporting,
}) => {
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const uniqueActions = Array.from(new Set(auditTrail.map(entry => entry.action)));

  const filteredTrail = filterAction
    ? auditTrail.filter(entry => entry.action === filterAction)
    : auditTrail;

  const sortedTrail = [...filteredTrail].sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
  });

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const blob = await batchService.exportAuditTrail(batchId, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `batch-${batchId}-audit-trail.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export audit trail');
    }
  };

  const formatAction = (action: string): string => {
    return action
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterAction || ''}
            onChange={(e) => setFilterAction(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter audit trail by action"
          >
            <option value="">All Actions ({auditTrail.length})</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {formatAction(action)} ({auditTrail.filter(e => e.action === action).length})
              </option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            aria-label={`Sort by timestamp ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
          </button>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting || sortedTrail.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
            aria-label="Export audit trail as PDF"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting || sortedTrail.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
            aria-label="Export audit trail as CSV"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm" role="table" aria-label="Audit trail">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Timestamp</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Action</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">User</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Details</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrail.length > 0 ? (
              sortedTrail.map((entry, index) => (
                <tr
                  key={entry.log_id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-gray-900">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {formatAction(entry.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{entry.user_name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {entry.reason && <p className="mb-1">{entry.reason}</p>}
                    {entry.details && <p className="text-xs text-gray-500">{entry.details}</p>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-600">
                  No audit log entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination note */}
      {sortedTrail.length > 0 && (
        <p className="text-xs text-gray-500 text-right">
          Showing {sortedTrail.length} of {auditTrail.length} entries
        </p>
      )}
    </div>
  );
};
