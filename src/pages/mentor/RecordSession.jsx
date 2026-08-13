import { useState, useEffect } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import ErrorBanner from '../../components/common/ErrorBanner';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import * as mentorApi from '../../api/mentor.api';

const YEAR_OPTIONS = [
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
  { value: '4', label: 'Year 4' },
];

const TOPIC_OPTIONS = [
  { value: 'academic', label: 'Academic' },
  { value: 'personal', label: 'Personal' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'career', label: 'Career' },
  { value: 'other', label: 'Other' },
];

export default function RecordSession() {
  const { showToast } = useToast();

  // Step 1: session header
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [year, setYear] = useState('');
  const [topic, setTopic] = useState('academic');
  const [generalNotes, setGeneralNotes] = useState('');

  // Step 2: student records
  const [students, setStudents] = useState([]);
  const [studentRecords, setStudentRecords] = useState({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState('');

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Load students when year changes
  useEffect(() => {
    if (!year) {
      setStudents([]);
      setStudentRecords({});
      return;
    }

    setIsLoadingStudents(true);
    setStudentsError('');

    mentorApi
      .getStudentsForSession(year)
      .then((res) => {
        const loaded = res.data.data.students;
        setStudents(loaded);

        // Initialize all students as absent by default
        const initial = {};
        loaded.forEach((s) => {
          initial[s._id] = {
            studentId: s._id,
            attendance: 'absent',
            remarks: '',
            actionItems: '',
            nextFollowUpDate: '',
          };
        });
        setStudentRecords(initial);
      })
      .catch((err) => {
        setStudentsError(err.response?.data?.message || 'Could not load students.');
      })
      .finally(() => setIsLoadingStudents(false));
  }, [year]);

  const togglePresent = (studentId) => {
    setStudentRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        attendance: prev[studentId].attendance === 'present' ? 'absent' : 'present',
        // Clear remarks when marking absent
        remarks: prev[studentId].attendance === 'present' ? '' : prev[studentId].remarks,
        actionItems: prev[studentId].attendance === 'present' ? '' : prev[studentId].actionItems,
      },
    }));
  };

  const updateRecord = (studentId, field, value) => {
    setStudentRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const presentCount = Object.values(studentRecords).filter(
    (r) => r.attendance === 'present'
  ).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!year) { setSubmitError('Please select a year group.'); return; }
    if (!sessionDate) { setSubmitError('Please select a session date.'); return; }
    if (students.length === 0) { setSubmitError('No students found for this year.'); return; }

    setIsSubmitting(true);
    try {
      await mentorApi.createSession({
        sessionDate,
        year: Number(year),
        topic,
        generalNotes,
        studentRecords: Object.values(studentRecords).map((r) => ({
          ...r,
          nextFollowUpDate: r.nextFollowUpDate || undefined,
        })),
      });

      setSubmitted(true);
      showToast('Session recorded successfully.');

      // Reset form
      setYear('');
      setGeneralNotes('');
      setStudents([]);
      setStudentRecords({});
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Could not save the session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardShell pageTitle="Record Session">
        <div className="card p-8 text-center max-w-md mx-auto mt-8">
          <div className="h-12 w-12 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-base font-semibold text-ink">Session recorded</p>
          <p className="text-sm text-muted mt-1">
            All student attendance and remarks have been saved.
          </p>
          <div className="flex gap-3 mt-6 justify-center">
            <Button variant="secondary" onClick={() => setSubmitted(false)}>
              Record another session
            </Button>
            <Button onClick={() => window.location.href = '/mentor/sessions'}>
              View all sessions
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell pageTitle="Record Session">
      <PageHeader
        title="Record a counseling session"
        description="Select the year group, mark attendance, and add individual remarks for present students."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session header */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-4">Session details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Session date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
            />
            <Select
              label="Year group"
              placeholder="Select year"
              options={YEAR_OPTIONS}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <Select
              label="Topic"
              options={TOPIC_OPTIONS}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Input
              label="General notes (optional)"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Overall session notes..."
            />
          </div>
        </div>

        {/* Student attendance */}
        {year && (
          <div className="card">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h3 className="text-sm font-semibold text-ink">
                Student attendance — Year {year}
              </h3>
              {students.length > 0 && (
                <span className="text-xs text-muted">
                  {presentCount} present / {students.length - presentCount} absent
                </span>
              )}
            </div>

            {isLoadingStudents && <Loader label="Loading students..." />}
            {studentsError && <div className="p-4"><ErrorBanner message={studentsError} /></div>}

            {!isLoadingStudents && students.length === 0 && !studentsError && (
              <EmptyState
                title={`No Year ${year} students assigned to you`}
                description="Ask the administrator to assign Year ${year} students to your account."
              />
            )}

            {students.length > 0 && (
              <div className="divide-y divide-line">
                {students.map((student) => {
                  const record = studentRecords[student._id] || {};
                  const isPresent = record.attendance === 'present';

                  return (
                    <div
                      key={student._id}
                      className={`px-5 py-4 transition-colors ${isPresent ? 'bg-accent-soft/30' : ''}`}
                    >
                      {/* Student row header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Present toggle */}
                          <button
                            type="button"
                            onClick={() => togglePresent(student._id)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors
                              ${isPresent
                                ? 'border-accent bg-accent text-white'
                                : 'border-line bg-surface text-muted hover:border-accent/50'
                              }`}
                            title={isPresent ? 'Mark absent' : 'Mark present'}
                          >
                            {isPresent && (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          <div>
                            <p className="text-sm font-medium text-ink">{student.name}</p>
                            <p className="text-xs text-muted">
                              {student.rollNumber}
                              {student.section ? ` · Section ${student.section}` : ''}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full
                            ${isPresent ? 'bg-accent-soft text-accent-dark' : 'bg-paper text-muted border border-line'}`}
                        >
                          {isPresent ? 'Present' : 'Absent'}
                        </span>
                      </div>

                      {/* Remarks — only shown when present */}
                      {isPresent && (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 pl-11">
                          <div>
                            <label className="field-label">Remarks *</label>
                            <textarea
                              className="field-input min-h-[72px]"
                              placeholder="What was discussed with this student..."
                              value={record.remarks}
                              onChange={(e) => updateRecord(student._id, 'remarks', e.target.value)}
                              required={isPresent}
                            />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="field-label">Action items (optional)</label>
                              <textarea
                                className="field-input min-h-[72px]"
                                placeholder="Follow-up actions agreed..."
                                value={record.actionItems}
                                onChange={(e) => updateRecord(student._id, 'actionItems', e.target.value)}
                              />
                            </div>
                            <Input
                              label="Next follow-up date (optional)"
                              type="date"
                              value={record.nextFollowUpDate}
                              onChange={(e) => updateRecord(student._id, 'nextFollowUpDate', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {submitError && <ErrorBanner message={submitError} />}

        {students.length > 0 && (
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Save session ({presentCount} present, {students.length - presentCount} absent)
            </Button>
          </div>
        )}
      </form>
    </DashboardShell>
  );
}
