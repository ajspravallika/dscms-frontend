import { useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../components/common/Toast';
import * as studentApi from '../../api/student.api';

// Mirrors src/routes/student.routes.js POST /concerns validator:
// title (optional), description (required), category (optional, enum).
const CATEGORY_OPTIONS = [
  { value: 'academic', label: 'Academic' },
  { value: 'personal', label: 'Personal' },
  { value: 'health', label: 'Health' },
  { value: 'financial', label: 'Financial' },
  { value: 'other', label: 'Other' },
];

export default function StudentConcerns() {
  const { showToast } = useToast();
  const { data: concerns, isLoading, error, refetch } = useFetch(
    studentApi.getMyConcerns,
    (res) => res.data.data.concerns,
    []
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'other' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.description.trim()) {
      setFormError('Please describe your concern.');
      return;
    }

    setIsSubmitting(true);
    try {
      await studentApi.submitConcern(form);
      showToast('Your concern has been submitted to your mentor.');
      setForm({ title: '', description: '', category: 'other' });
      setIsFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not submit your concern.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell pageTitle="My Concerns">
      <PageHeader
        title="Your submitted concerns"
        description="Share anything you'd like your mentor to know. They'll respond here."
        action={<Button onClick={() => setIsFormOpen(true)}>Submit a concern</Button>}
      />

      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {concerns && concerns.length === 0 && (
        <EmptyState title="No concerns submitted yet" description="Use the button above if there's something you'd like to raise with your mentor." />
      )}

      <div className="space-y-4">
        {concerns?.map((concern) => (
          <div key={concern._id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{concern.title || 'Untitled concern'}</p>
                <p className="text-xs text-muted">
                  <span className="capitalize">{concern.category}</span> ·{' '}
                  {new Date(concern.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={concern.status} />
            </div>
            <p className="mt-3 text-sm text-ink">{concern.description}</p>
            {concern.mentorResponse && (
              <div className="mt-3 rounded-md bg-student-soft p-3">
                <p className="text-xs font-medium text-student">Mentor's response</p>
                <p className="mt-1 text-sm text-ink">{concern.mentorResponse}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Submit a concern">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Title (optional)"
            value={form.title}
            onChange={handleChange('title')}
            placeholder="A short summary"
          />
          <Select label="Category" options={CATEGORY_OPTIONS} value={form.category} onChange={handleChange('category')} />
          <div>
            <label className="field-label">Description</label>
            <textarea
              className="field-input min-h-[100px]"
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Tell your mentor what's on your mind..."
              required
            />
          </div>

          {formError && <ErrorBanner message={formError} />}

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Submit
          </Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
