import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import * as mentorApi from '../../api/mentor.api';

export default function MentorMessages() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { studentId: studentIdFromUrl } = useParams();
  const studentsFetch = useFetch(mentorApi.listMyStudents, (res) => res.data.data.students, []);

  const [mode, setMode] = useState('individual'); // 'individual' or 'broadcast'
  const [selectedStudentId, setSelectedStudentId] = useState(studentIdFromUrl || '');
  const [broadcastIds, setBroadcastIds] = useState([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [broadcastDone, setBroadcastDone] = useState(false);
  const bottomRef = useRef(null);

  const conversationFetch = useFetch(
    () =>
      selectedStudentId && mode === 'individual'
        ? mentorApi.getConversationWithStudent(selectedStudentId)
        : Promise.resolve({ data: { data: { messages: [] } } }),
    (res) => res.data.data.messages,
    [selectedStudentId, mode]
  );

  const students = studentsFetch.data || [];
  const selectedStudent = useMemo(
    () => students.find((s) => s._id === selectedStudentId),
    [students, selectedStudentId]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationFetch.data]);

  // Individual send
  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSendError('');
    setIsSending(true);
    try {
      await mentorApi.sendMessageToStudent(selectedStudentId, draft.trim());
      setDraft('');
      conversationFetch.refetch();
    } catch (err) {
      setSendError(err.response?.data?.message || 'Could not send the message.');
    } finally {
      setIsSending(false);
    }
  };

  // Broadcast send — sends same message to all selected students
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    if (broadcastIds.length === 0) {
      setSendError('Select at least one student.');
      return;
    }
    setSendError('');
    setIsSending(true);
    let success = 0;
    let fail = 0;
    await Promise.all(
      broadcastIds.map((id) =>
        mentorApi
          .sendMessageToStudent(id, draft.trim())
          .then(() => success++)
          .catch(() => fail++)
      )
    );
    setIsSending(false);
    setDraft('');
    setBroadcastIds([]);
    setBroadcastDone(true);
    setTimeout(() => setBroadcastDone(false), 3000);
    if (fail > 0) setSendError(`${fail} message(s) failed to send.`);
    else showToast(`Message sent to ${success} student${success > 1 ? 's' : ''}.`);
  };

  const toggleBroadcastId = (id) => {
    setBroadcastIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <DashboardShell pageTitle="Messages">
      <PageHeader title="Messages" description="Message students currently assigned to you." />

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMode('individual'); setSendError(''); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${mode === 'individual' ? 'bg-mentor text-white' : 'bg-surface border border-line text-ink hover:bg-paper'}`}
        >
          Individual message
        </button>
        <button
          onClick={() => { setMode('broadcast'); setSendError(''); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${mode === 'broadcast' ? 'bg-mentor text-white' : 'bg-surface border border-line text-ink hover:bg-paper'}`}
        >
          Send to multiple students
        </button>
      </div>

      {mode === 'individual' ? (
        /* ── Individual chat UI ── */
        <div className="card flex h-[calc(100vh-280px)] overflow-hidden">
          {/* Student list */}
          <div className="w-64 flex-shrink-0 border-r border-line overflow-y-auto">
            {studentsFetch.isLoading && <Loader />}
            {students.length === 0 && !studentsFetch.isLoading && (
              <EmptyState title="No students assigned" />
            )}
            <ul>
              {students.map((s) => (
                <li key={s._id}>
                  <button
                    onClick={() => setSelectedStudentId(s._id)}
                    className={`w-full border-b border-line px-4 py-3 text-left text-sm transition-colors
                      ${selectedStudentId === s._id ? 'bg-mentor-soft text-mentor font-medium' : 'text-ink hover:bg-paper'}`}
                  >
                    <p>{s.name}</p>
                    <p className="text-xs text-muted">{s.rollNumber}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Conversation */}
          <div className="flex flex-1 flex-col">
            {!selectedStudentId ? (
              <EmptyState title="Select a student" description="Choose a student from the list to view your conversation." />
            ) : (
              <>
                <div className="border-b border-line px-4 py-3">
                  <p className="text-sm font-medium text-ink">{selectedStudent?.name}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {conversationFetch.isLoading && <Loader />}
                  {conversationFetch.error && <ErrorBanner message={conversationFetch.error} />}
                  {conversationFetch.data?.map((msg) => {
                    const isMine = msg.senderId === user.id || msg.senderId?._id === user.id;
                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-sm rounded-lg px-3 py-2 text-sm ${isMine ? 'bg-mentor text-white' : 'bg-paper text-ink border border-line'}`}>
                          <p>{msg.content}</p>
                          <p className={`mt-1 text-[10px] ${isMine ? 'text-white/70' : 'text-muted'}`}>
                            {new Date(msg.sentAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={handleSend} className="border-t border-line p-3">
                  {sendError && <div className="mb-2"><ErrorBanner message={sendError} /></div>}
                  <div className="flex gap-2">
                    <input
                      className="field-input flex-1"
                      placeholder="Type a message..."
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                    <Button type="submit" isLoading={isSending}>Send</Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      ) : (
        /* ── Broadcast UI ── */
        <div className="card p-5 space-y-4">
          <p className="text-sm text-muted">
            Select one or more students, type your message, and send it to all of them at once.
          </p>

          {/* Student checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="field-label mb-0">Select students ({broadcastIds.length} selected)</label>
              <div className="flex gap-3 text-xs">
                <button type="button" onClick={() => setBroadcastIds(students.map((s) => s._id))} className="text-mentor hover:underline">
                  Select all
                </button>
                <button type="button" onClick={() => setBroadcastIds([])} className="text-muted hover:underline">
                  Clear
                </button>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-md border border-line divide-y divide-line">
              {studentsFetch.isLoading && <Loader />}
              {students.map((s) => (
                <label
                  key={s._id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-paper
                    ${broadcastIds.includes(s._id) ? 'bg-mentor-soft' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={broadcastIds.includes(s._id)}
                    onChange={() => toggleBroadcastId(s._id)}
                    className="h-4 w-4 accent-mentor"
                  />
                  <span className="text-sm text-ink">{s.name}</span>
                  <span className="text-xs text-muted">({s.rollNumber})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Message input */}
          <form onSubmit={handleBroadcast} className="space-y-3">
            <div>
              <label className="field-label">Message</label>
              <textarea
                className="field-input min-h-[100px]"
                placeholder="Type the message to send to all selected students..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>
            {sendError && <ErrorBanner message={sendError} />}
            {broadcastDone && (
              <div className="rounded-md bg-accent-soft px-4 py-3 text-sm text-accent-dark">
                Message sent successfully to all selected students.
              </div>
            )}
            <Button type="submit" isLoading={isSending} className="w-full">
              Send to {broadcastIds.length > 0 ? `${broadcastIds.length} student${broadcastIds.length > 1 ? 's' : ''}` : 'selected students'}
            </Button>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}

