import { useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
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

  const columns = [
    {
      key: 'week',
      header: 'Week',
      render: (row) =>
        `${new Date(row.weekStartDate).toLocaleDateString()} – ${new Date(row.weekEndDate).toLocaleDateString()}`,
    },
    { key: 'totalStudentsCounseled', header: 'Students counseled' },
    { key: 'totalSessionsHeld', header: 'Sessions held' },
    {
      key: 'attendanceSummary',
      header: 'Attendance (P / A / E)',
      render: (row) =>
        `${row.attendanceSummary?.present ?? 0} / ${row.attendanceSummary?.absent ?? 0} / ${row.attendanceSummary?.excused ?? 0}`,
    },
    { key: 'openConcerns', header: 'Open concerns' },
  ];

  return (
    <DashboardShell pageTitle="Reports">
      <PageHeader
        title="Weekly reports"
        description="No automated scheduling in V1 — generate a report for any date range on demand. Re-generating for the same week overwrites the previous report."
        action={<Button onClick={() => setIsFormOpen(true)}>Generate report</Button>}
      />

      <div className="card">
        <Table
          columns={columns}
          rows={reports}
          isLoading={isLoading}
          error={error}
          emptyTitle="No reports generated yet"
          emptyDescription="Generate your first weekly report using the button above."
        />
      </div>

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
