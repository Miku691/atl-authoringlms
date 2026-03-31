# IMS Reporting — Frontend Integration Guide

> How the React TypeScript frontend (`atl-web-ui`) integrates with `ims-reports-service`.
> Covers API service layer, page components, download handling, and UI/UX design patterns.

---

## 1. Current Frontend Reports Tab

The Reports tab already exists in the frontend (`atl-web-ui`). We need to build out:
- Report category navigation
- Filter/parameter forms per report type
- Trigger download (binary file from API)
- Optionally: in-app preview for PDF

---

## 2. API Service Layer

### 2.1 `reportService.ts`

```typescript
// src/api/reportService.ts
import { apiClient } from './client';

export type ReportFormat = 'pdf' | 'excel' | 'csv';

export interface AttendanceReportParams {
  offeringId: string;
  yearMonth: string;   // YYYY-MM
  format?: ReportFormat;
}

export interface FeeCollectionParams {
  offeringId: string;
  from: string;        // YYYY-MM-DD
  to: string;
  format?: ReportFormat;
}

export interface FeeOutstandingParams {
  offeringId: string;
  format?: ReportFormat;
}

export interface DefaulterParams {
  offeringId: string;
  threshold?: number;  // default 75.0
  format?: ReportFormat;
}

// Generic binary download helper
const downloadReport = async (url: string, params: Record<string, unknown>, filename: string): Promise<void> => {
  const response = await apiClient.get(url, {
    params,
    responseType: 'blob',   // IMPORTANT: binary response
  });
  
  const contentType = response.headers['content-type'] || 'application/octet-stream';
  const blob = new Blob([response.data], { type: contentType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Attendance Reports
export const reportService = {
  downloadMonthlyAttendance: (params: AttendanceReportParams) =>
    downloadReport(
      '/ims-reports/attendance/monthly',
      params,
      `attendance_${params.yearMonth}.${params.format === 'excel' ? 'xlsx' : 'pdf'}`
    ),

  downloadAttendanceDefaulters: (params: DefaulterParams) =>
    downloadReport(
      '/ims-reports/attendance/defaulters',
      params,
      `attendance_defaulters.${params.format === 'excel' ? 'xlsx' : 'pdf'}`
    ),

  downloadFeeCollection: (params: FeeCollectionParams) =>
    downloadReport(
      '/ims-reports/finance/fee-collection',
      params,
      `fee_collection_${params.from}_to_${params.to}.${params.format === 'excel' ? 'xlsx' : 'pdf'}`
    ),

  downloadFeeOutstanding: (params: FeeOutstandingParams) =>
    downloadReport(
      '/ims-reports/finance/fee-outstanding',
      params,
      `fee_outstanding.${params.format === 'excel' ? 'xlsx' : 'pdf'}`
    ),

  downloadStudentDirectory: (offeringId: string, format: ReportFormat = 'excel') =>
    downloadReport(
      '/ims-reports/student/directory',
      { offeringId, format },
      `student_directory.${format === 'excel' ? 'xlsx' : 'pdf'}`
    ),
};
```

---

## 3. React Page Structure

### 3.1 Reports Page Layout

```
ReportsPage
├── ReportsSidebar          (navigation: Attendance / Finance / Students / Academic)
└── ReportContent
    ├── AttendanceReports
    │   ├── MonthlyAttendanceForm
    │   └── DefaulterReportForm
    ├── FinanceReports
    │   ├── FeeCollectionForm
    │   ├── FeeOutstandingForm
    │   └── BudgetReportForm
    ├── StudentReports
    │   ├── EnrollmentSummaryForm
    │   └── StudentDirectoryForm
    └── AcademicReports
        ├── AssignmentSubmissionForm
        └── OfferingOverviewForm
```

### 3.2 Generic Report Form Pattern

```tsx
// src/components/reports/MonthlyAttendanceReport.tsx
import { useState } from 'react';
import { reportService } from '../../api/reportService';
import { useOfferings } from '../../hooks/useOfferings';

const MonthlyAttendanceReport: React.FC = () => {
  const [offeringId, setOfferingId] = useState('');
  const [yearMonth, setYearMonth] = useState('');
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { offerings, isLoading: offeringsLoading } = useOfferings();

  const handleDownload = async () => {
    if (!offeringId || !yearMonth) {
      setError('Please select a class and month.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await reportService.downloadMonthlyAttendance({ offeringId, yearMonth, format });
    } catch (err) {
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form">
      <h3>Monthly Attendance Report</h3>
      <p className="report-description">
        Download attendance summary for all students in a class for a selected month.
      </p>
      
      <div className="form-group">
        <label>Class / Batch / Semester</label>
        <select value={offeringId} onChange={e => setOfferingId(e.target.value)}>
          <option value="">Select...</option>
          {offerings.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label>Month</label>
        <input type="month" value={yearMonth} onChange={e => setYearMonth(e.target.value)} />
      </div>
      
      <div className="form-group">
        <label>Format</label>
        <div className="format-selector">
          <button 
            className={format === 'pdf' ? 'active' : ''}
            onClick={() => setFormat('pdf')}>
            PDF
          </button>
          <button 
            className={format === 'excel' ? 'active' : ''}
            onClick={() => setFormat('excel')}>
            Excel
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <button onClick={handleDownload} disabled={loading} className="btn-primary">
        {loading ? 'Generating...' : '⬇ Download Report'}
      </button>
    </div>
  );
};
```

---

## 4. Gateway Routing

Add reports service route to `atl-gateway-service`:

```yaml
# In application.yml of gateway
spring:
  cloud:
    gateway:
      routes:
        - id: ims-reports-service
          uri: lb://ims-reports-service
          predicates:
            - Path=/ims-reports/**
          filters:
            - RewritePath=/ims-reports/(?<segment>.*), /${segment}
```

---

## 5. UI/UX Design Principles for Reports Tab

### 5.1 Report Card Layout
Each report should appear as a card with:
- **Icon** representing the report category
- **Name** (clear, user-friendly)
- **Description** (1 line)
- **Filters** (inline or expandable)
- **Format buttons** (PDF / Excel / CSV)
- **Download button** with loading state

### 5.2 Loading and Error States
```
Before download:
  [Select options] → [⬇ Download PDF / Excel / CSV]

During generation:
  [Spinner] Generating report...

On success:
  Browser download dialog opens automatically

On failure:
  [Error message with retry option]
```

### 5.3 Feedback Toast
After triggering download, show a toast:
- **Success:** "Your report is being downloaded..."
- **Error:** "Report generation failed. Check filters and try again."

---

## 6. Role-Based Report Visibility

On the frontend, filter reports by user role (in addition to backend enforcement):

```typescript
// Example visibility rules
const reportVisibility = {
  finance: ['ADMIN', 'TENANT_ADMIN', 'FINANCE'],
  attendance: ['ADMIN', 'TENANT_ADMIN', 'TEACHER'],
  student: ['ADMIN', 'TENANT_ADMIN'],
  academic: ['ADMIN', 'TENANT_ADMIN', 'TEACHER'],
};
```

---

## 7. Implementation Phases

### Phase 1 (Start Immediately)
- [ ] `reportService.ts` with binary download helper
- [ ] Monthly Attendance Report page
- [ ] Fee Collection Report page
- [ ] Fee Outstanding Report page
- [ ] Student Directory Report page

### Phase 2
- [ ] Attendance Defaulters Report
- [ ] Budget vs Actual Report
- [ ] Assignment Submission Status Report
- [ ] Enrollment Summary Report

### Phase 3
- [ ] In-browser PDF preview (using PDF.js or iframe)
- [ ] Schedule/email reports
- [ ] KPI Dashboard with charts (Recharts or Chart.js)
