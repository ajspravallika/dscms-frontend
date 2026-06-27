import { useState, useEffect } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import * as studentApi from '../../api/student.api';

export default function MyMentor() {
  const [mentor, setMentor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Distinguish "no mentor assigned yet" (backend returns 404 — see
  // student.controller.js getMyMentor) from a genuine fetch error.
  const [noMentorAssigned, setNoMentorAssigned] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    studentApi
      .getMyMentor()
      .then((res) => {
        if (isMounted) setMentor(res.data.data.mentor);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.response?.status === 404) {
          setNoMentorAssigned(true);
        } else {
          setError(err.response?.data?.message || 'Could not load your mentor.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardShell pageTitle="My Mentor">
      <PageHeader title="Your assigned mentor" />

      {isLoading && <Loader />}

      {!isLoading && error && <ErrorBanner message={error} />}

      {!isLoading && noMentorAssigned && (
        <EmptyState
          title="No mentor assigned yet"
          description="The administrator hasn't assigned you a mentor yet. Please check back soon."
        />
      )}

      {mentor && (
        <div className="card max-w-md p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-student text-lg font-semibold text-white">
              {mentor.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </span>
            <div>
              <p className="text-base font-semibold text-ink">{mentor.name}</p>
              <p className="text-sm text-muted">{mentor.designation} {mentor.department && `· ${mentor.department}`}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Email</dt>
              <dd className="text-ink">{mentor.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Phone</dt>
              <dd className="text-ink">{mentor.phone || '—'}</dd>
            </div>
          </dl>
        </div>
      )}
    </DashboardShell>
  );
}
