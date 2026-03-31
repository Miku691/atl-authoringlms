import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { reportsService, type ReportRequestDto } from '../../../../api/reportsService';
import { FileSpreadsheet, Download, Loader2, AlertCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

type ReportCategory = 'PEOPLE' | 'ACADEMIC' | 'FINANCE';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  requiresStartDate?: boolean;
  requiresEndDate?: boolean;
}

const AVAILABLE_REPORTS: ReportConfig[] = [
  // People
  { id: 'student_directory_report', name: 'Student Directory', description: 'Complete list of all enrolled students with contact and offering details.', category: 'PEOPLE' },
  { id: 'student_guardian_contact_report', name: 'Guardian Contacts', description: 'Student guardian mappings and primary contact information.', category: 'PEOPLE' },
  
  // Academic & Attendance Combined
  { id: 'academic_offerings_report', name: 'Academic Offerings', description: 'List of all classes, batches, or semesters along with term dates.', category: 'ACADEMIC' },
  { id: 'student_attendance_summary_report', name: 'Attendance Summary', description: 'Aggregated attendance totals and percentages for students.', category: 'ACADEMIC' },
  
  // Finance
  { id: 'daily_collection_summary_report', name: 'Collection Summary', description: 'Daily summary of fee collections and payment modes.', category: 'FINANCE', requiresStartDate: true, requiresEndDate: true },
  { id: 'fee_defaulters_report', name: 'Fee Defaulters', description: 'List of students with overdue fees up to a specific date.', category: 'FINANCE', requiresEndDate: true },
  { id: 'expense_summary_report', name: 'Expense Summary', description: 'Summary of institutional expenses grouped by category and month.', category: 'FINANCE' },
  { id: 'budget_vs_actual_report', name: 'Budget vs Actual', description: 'Comparison of allocated budget versus actual expenses.', category: 'FINANCE' },
];

export const ReportsDashboardPage: React.FC = () => {
  const location = useLocation();
  
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('PEOPLE');
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'EXCEL' | 'CSV'>('EXCEL');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Date Filters
  const [dateSelectionType, setDateSelectionType] = useState<'SINGLE' | 'RANGE'>('RANGE');
  const [singleDate, setSingleDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Sync category with URL pattern
  useEffect(() => {
    const path = location.pathname;
    let newCategory: ReportCategory = 'PEOPLE';
    if (path.includes('/reports/academic')) newCategory = 'ACADEMIC';
    else if (path.includes('/reports/financial')) newCategory = 'FINANCE';
    else if (path.includes('/reports/people')) newCategory = 'PEOPLE';
    
    setActiveCategory(newCategory);
  }, [location.pathname]);

  // Auto-select first report when category changes
  useEffect(() => {
    const firstReport = AVAILABLE_REPORTS.find(r => r.category === activeCategory);
    if (firstReport) {
        setSelectedReportId(firstReport.id);
    }
  }, [activeCategory]);


  const selectedReport = useMemo(() => AVAILABLE_REPORTS.find(r => r.id === selectedReportId), [selectedReportId]);

  const handleGenerateReport = async () => {
    if (!selectedReport) return;

    try {
      setIsGenerating(true);
      
      const request: ReportRequestDto = {
        reportName: selectedReport.id,
        format: selectedFormat,
      };

      // Apply date filters if the report requires them
      if (selectedReport.requiresStartDate || selectedReport.requiresEndDate) {
        if (dateSelectionType === 'SINGLE') {
           if (!singleDate) {
               toast.error('Please select a date.');
               setIsGenerating(false);
               return;
           }
           request.startDate = singleDate;
           request.endDate = singleDate;
        } else {
           if (selectedReport.requiresStartDate && !startDate) {
               toast.error('Please select a start date.');
               setIsGenerating(false);
               return;
           }
           if (selectedReport.requiresEndDate && !endDate) {
               toast.error('Please select an end date.');
               setIsGenerating(false);
               return;
           }
           if (selectedReport.requiresStartDate) request.startDate = startDate;
           if (selectedReport.requiresEndDate) request.endDate = endDate;
        }
      }

      const blob = await reportsService.generateReport(request);
      reportsService.downloadBlob(blob, selectedReport.name.replace(/\s+/g, '_').toLowerCase(), selectedFormat);
      
      toast.success('Report downloaded successfully.');
    } catch (error: any) {
      console.error('Report generation failed', error);
      
      let errorMessage = 'Failed to generate report. Please try again.';
      
      // If error response is a Blob (due to responseType: 'blob'), parse it to get the message
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const apiResponse = JSON.parse(text);
          errorMessage = apiResponse.message || errorMessage;
        } catch (e) {
          // If parsing fails, fall back to default
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const categoryTitle = 
    activeCategory === 'PEOPLE' ? 'People Reports' : 
    activeCategory === 'ACADEMIC' ? 'Academic & Attendance Reports' : 
    'Financial Reports';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl shadow-sm border border-indigo-200">
            <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{categoryTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">Export analytical and operational data extracts</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Report Selection */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-base font-semibold text-gray-900">Select Report</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AVAILABLE_REPORTS.filter(r => r.category === activeCategory).map((report) => (
                  <label 
                    key={report.id}
                    className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${
                      selectedReportId === report.id ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/30' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_selection"
                      value={report.id}
                      className="peer sr-only"
                      checked={selectedReportId === report.id}
                      onChange={() => setSelectedReportId(report.id)}
                    />
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">{report.name}</span>
                      <span className="mt-1 flex items-center text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {report.description}
                      </span>
                    </div>
                    {/* Active Indicator */}
                    <div className={`absolute top-4 right-4 h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                       selectedReportId === report.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                    }`}>
                       {selectedReportId === report.id && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Configuration</h3>
            </div>
            
            <div className="p-6 space-y-8">
              
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedFormat('EXCEL')}
                    className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                      selectedFormat === 'EXCEL' 
                      ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500 shadow-sm' 
                      : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-gray-50'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Excel
                  </button>
                  <button
                    onClick={() => setSelectedFormat('CSV')}
                    className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                      selectedFormat === 'CSV' 
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-500 shadow-sm' 
                      : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" /> CSV
                  </button>
                </div>
              </div>

              {/* Conditional Date Pickers */}
              {(selectedReport?.requiresStartDate || selectedReport?.requiresEndDate) && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Date Filter
                    </label>
                    
                    {/* Toggle Single / Range */}
                    {selectedReport.requiresStartDate && selectedReport.requiresEndDate && (
                        <div className="bg-gray-100 p-0.5 rounded-lg flex text-xs font-medium">
                            <button 
                                onClick={() => setDateSelectionType('SINGLE')}
                                className={`px-3 py-1.5 rounded-md transition-all ${dateSelectionType === 'SINGLE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Single Day
                            </button>
                            <button 
                                onClick={() => setDateSelectionType('RANGE')}
                                className={`px-3 py-1.5 rounded-md transition-all ${dateSelectionType === 'RANGE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Range
                            </button>
                        </div>
                    )}
                  </div>

                  <div className="space-y-4">
                      {dateSelectionType === 'SINGLE' || !(selectedReport.requiresStartDate && selectedReport.requiresEndDate) ? (
                          /* SINGLE DATE OR ONLY END DATE REQUIRED (e.g., balance up to) */
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                                {selectedReport.requiresStartDate && selectedReport.requiresEndDate ? 'Select Date' : (selectedReport.requiresEndDate ? 'Up to Date' : 'From Date')}
                            </label>
                            <input 
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                value={singleDate}
                                onChange={(e) => {
                                    setSingleDate(e.target.value);
                                    if (!selectedReport.requiresStartDate && selectedReport.requiresEndDate) {
                                        setEndDate(e.target.value); // Sync to end date for reports like Fee Defaulters
                                    }
                                }}
                            />
                          </div>
                      ) : (
                          /* RANGE DATES */
                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                <input 
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                <input 
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                              </div>
                          </div>
                      )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-6 border-t border-gray-100">
                <button 
                  onClick={handleGenerateReport} 
                  disabled={isGenerating}
                  className={`w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${isGenerating ? 'opacity-70 pointer-events-none' : ''}`}
                >
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating File...</>
                  ) : (
                    <><Download className="mr-2 h-5 w-5" /> Download {selectedFormat}</>
                  )}
                </button>
                <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <p>Large datasets may take a few moments to aggregate and download.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
