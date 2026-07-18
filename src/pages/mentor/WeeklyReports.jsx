import { useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../components/common/Toast';
import * as mentorApi from '../../api/mentor.api';

function defaultWeekRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    weekStartDate: start.toISOString().slice(0, 10),
    weekEndDate: end.toISOString().slice(0, 10),
  };
}

function ReportCard({ report }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card mb-4">
      {/* Report header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <p className="text-sm font-semibold text-ink">
            {new Date(report.weekStartDate).toLocaleDateString()} –{' '}
            {new Date(report.weekEndDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted mt-0.5">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-mentor hover:underline"
        >
          {expanded ? 'Hide details' : 'View details'}
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-5 py-4">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Students counseled</p>
          <p className="text-2xl font-semibold text-ink mt-1">{report.totalStudentsCounseled}</p>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Sessions held</p>
          <p className="text-2xl font-semibold text-ink mt-1">{report.totalSessionsHeld}</p>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Attendance (P/A/E)</p>
          <p className="text-2xl font-semibold text-ink mt-1">
            {report.attendanceSummary?.present ?? 0} /{' '}
            {report.attendanceSummary?.absent ?? 0} /{' '}
            {report.attendanceSummary?.excused ?? 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Open concerns</p>
          <p className={`text-2xl font-semibold mt-1 ${report.openConcerns > 0 ? 'text-warn' : 'text-ink'}`}>
            {report.openConcerns}
          </p>
        </div>
      </div>

      {/* Student breakdown — expanded */}
      {expanded && (
        <div className="border-t border-line px-5 py-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Student-wise attendance
          </p>
          {!report.studentBreakdown || report.studentBreakdown.length === 0 ? (
            <p className="text-sm text-muted">No attendance records for this week.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="pb-2 font-medium text-muted">Student</th>
                  <th className="pb-2 font-medium text-muted">Roll No.</th>
                  <th className="pb-2 font-medium text-muted">Present</th>
                  <th className="pb-2 font-medium text-muted">Absent</th>
                  <th className="pb-2 font-medium text-muted">Excused</th>
                  <th className="pb-2 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {report.studentBreakdown.map((s) => {
                  const dominantStatus = s.absent > 0 ? 'absent' : s.excused > 0 ? 'excused' : 'present';
                  return (
                    <tr key={s.studentId}>
                      <td className="py-2 text-ink">{s.name}</td>
                      <td className="py-2 text-muted">{s.rollNumber}</td>
                      <td className="py-2 text-accent-dark font-medium">{s.present}</td>
                      <td className="py-2 text-warn font-medium">{s.absent}</td>
                      <td className="py-2 text-muted font-medium">{s.excused}</td>
                      <td className="py-2"><StatusBadge status={dominantStatus} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {report.highlights && (
            <div className="mt-4 rounded-md bg-mentor-soft p-3">
              <p className="text-xs font-medium text-mentor">Highlights / Notes</p>
              <p className="text-sm text-ink mt-1">{report.highlights}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WeeklyReports() {
  const { showToast } = useToast();
  const { data: reports, isLoading, error, refetch } = useFetch(
    mentorApi.listMyReports,
    (res) => res.data.data.reports,
    []
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ ...defaultWeekRange(), highlights: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleGenerate = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await mentorApi.generateWeeklyReport(form);
      showToast('Weekly report generated.');
      setIsFormOpen(false);
      setForm({ ...defaultWeekRange(), highlights: '' });
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not generate the report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell pageTitle="Reports">
      <PageHeader
        title="Weekly reports"
        description="Generate a report for any date range. Re-generating for the same week overwrites the previous report."
        action={<Button onClick={() => setIsFormOpen(true)}>Generate report</Button>}
      />

      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {reports && reports.length === 0 && (
        <EmptyState
          title="No reports generated yet"
          description="Generate your first weekly report using the button above."
        />
      )}

      {reports?.map((report) => (
        <ReportCard key={report._id} report={report} />
      ))}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Generate weekly report">
        <form onSubmit={handleGenerate} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Week start"
              type="date"
              value={form.weekStartDate}
              onChange={handleChange('weekStartDate')}
              required
            />
            <Input
              label="Week end"
              type="date"
              value={form.weekEndDate}
              onChange={handleChange('weekEndDate')}
              required
            />
          </div>
          <div>
            <label className="field-label">Highlights (optional)</label>
            <textarea
              className="field-input min-h-[80px]"
              value={form.highlights}
              onChange={handleChange('highlights')}
              placeholder="Anything worth flagging to the administrator this week?"
            />
          </div>

          {formError && <ErrorBanner message={formError} />}

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Generate report
          </Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
