/**
 * ReportsPage - T112
 * Main reports dashboard with tabs for Efficiency, Scrap, and Trend analysis
 * Includes date range selector, report generation, and export functionality
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Printer, RefreshCw } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import DateRangeSelector from '@/shared/components/DateRangeSelector';
import EfficiencyChart from '@/features/reports/components/EfficiencyChart';
import WasteAnalysis from '@/features/reports/components/WasteAnalysis';
import BottleneckReport from '@/features/reports/components/BottleneckReport';
import { useReportsData, useScrapAnalysis, useTrendAnalysis } from '@/features/reports/hooks/useReportsData';
import reportService from '@/features/reports/services/reportService';

type TabType = 'efficiency' | 'scrap' | 'trends';

/**
 * Get today's date in YYYY-MM-DD format
 */
function getToday(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date 7 days ago
 */
function get7DaysAgo(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('efficiency');
  const [dateRange, setDateRange] = useState({
    start_date: get7DaysAgo(),
    end_date: getToday(),
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | null>(null);
  const [selectedStageForDrilldown, setSelectedStageForDrilldown] = useState<string | null>(null);

  // Fetch data
  const efficiencyData = useReportsData(dateRange);
  const scrapData = useScrapAnalysis(dateRange);
  const trendData = useTrendAnalysis(dateRange);

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ start_date: startDate, end_date: endDate });
    setSelectedStageForDrilldown(null); // Reset drill-down
  };

  /**
   * Handle export
   */
  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!efficiencyData.data?.report_id) {
      alert('No report data to export. Please generate a report first.');
      return;
    }

    setIsExporting(true);
    setExportFormat(format);

    try {
      const blob = await reportService.exportEfficiencyReport(
        efficiencyData.data.report_id,
        format
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `efficiency-report-${dateRange.start_date}-to-${dateRange.end_date}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      const message = format === 'pdf' ? 'PDF exported successfully!' : 'CSV exported successfully!';
      alert(message);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  /**
   * Handle drill-down
   */
  const handleDrillDown = (stageName: string) => {
    setSelectedStageForDrilldown(stageName);
    // Could navigate to a detailed drill-down page if needed
  };

  // Loading state
  const isLoading = efficiencyData.isLoading || scrapData.isLoading || trendData.isLoading;

  // Tabs
  const tabs: { label: string; value: TabType; icon: string }[] = [
    { label: 'Efficiency Analysis', value: 'efficiency', icon: '📊' },
    { label: 'Scrap & Waste', value: 'scrap', icon: '🗑️' },
    { label: 'Trend Analysis', value: 'trends', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Efficiency Reports</h1>
              <p className="text-gray-600 mt-1">
                Analyze production metrics, identify bottlenecks, and track waste reduction
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Date Range Selector */}
        <DateRangeSelector
          startDate={dateRange.start_date}
          endDate={dateRange.end_date}
          onDateRangeChange={handleDateRangeChange}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-lg text-gray-600">Generating reports...</p>
              <p className="text-sm text-gray-500 mt-2">This may take up to 10 seconds</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && efficiencyData.error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900">Error Loading Reports</h3>
            <p className="text-red-700 mt-2">{efficiencyData.error.message}</p>
            <button
              onClick={() => efficiencyData.refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Reports Content */}
        {!isLoading && !efficiencyData.error && (
          <>
            {/* Tabs and Controls */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex gap-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`flex-1 px-4 py-4 text-center font-medium transition-colors border-b-2 ${
                        activeTab === tab.value
                          ? 'border-teal-600 text-teal-600 bg-teal-50'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => efficiencyData.refetch()}
                  disabled={isLoading}
                  className="px-4 py-2 bg-teal-600 text-white rounded font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>

                <div className="flex-1 flex gap-2 justify-end">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting || !efficiencyData.data}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {exportFormat === 'pdf' ? 'Exporting...' : 'Export PDF'}
                  </button>

                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting || !efficiencyData.data}
                    className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {exportFormat === 'csv' ? 'Exporting...' : 'Export CSV'}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'efficiency' && (
                  <div className="space-y-6">
                    {efficiencyData.data && (
                      <>
                        <EfficiencyChart
                          stages={efficiencyData.data.stages}
                          isLoading={isLoading}
                        />
                        <BottleneckReport
                          stages={efficiencyData.data.stages}
                          onDrillDown={handleDrillDown}
                          isLoading={isLoading}
                        />
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'scrap' && (
                  <div>
                    {scrapData.data && (
                      <WasteAnalysis scrapData={scrapData.data} isLoading={isLoading} />
                    )}
                  </div>
                )}

                {activeTab === 'trends' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <p className="text-blue-900 font-medium">📈 Trend analysis coming soon</p>
                    <p className="text-blue-700 text-sm mt-2">
                      This view will show historical trends and predictive alerts
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Statistics */}
            {efficiencyData.data && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-600 text-sm font-medium">Total Batches</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {efficiencyData.data?.total_batches_processed ?? 0}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-600 text-sm font-medium">Production Velocity</p>
                  <p className="text-3xl font-bold text-teal-600 mt-2">
                    {efficiencyData.data?.production_velocity ?? 0}
                    <span className="text-lg">/day</span>
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-600 text-sm font-medium">Bottleneck Stages</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {efficiencyData.data?.trends?.bottleneck_stages?.length ?? 0}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-600 text-sm font-medium">Improving Stages</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {efficiencyData.data?.trends?.improving_stages?.length ?? 0}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
