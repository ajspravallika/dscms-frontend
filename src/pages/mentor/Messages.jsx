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
import * as mentorApi from '../../api/mentor.api';

export default function MentorMessages() {
  const { user } = useAuth();
  // Optional :studentId param lets other pages (e.g. a student profile)
  // deep-link straight into a conversation. Falls back to the picker
  // list when navigated to directly via the sidebar.
  const { studentId: studentIdFromUrl } = useParams();
  const studentsFetch = useFetch(mentorApi.listMyStudents, (res) => res.data.data.students, []);

  const [selectedStudentId, setSelectedStudentId] = useState(studentIdFromUrl || '');
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const bottomRef = useRef(null);

  const conversationFetch = useFetch(
    () =>
      selectedStudentId
        ? mentorApi.getConversationWithStudent(selectedStudentId)
        : Promise.resolve({ data: { data: { messages: [] } } }),
    (res) => res.data.data.messages,
    [selectedStudentId]
  );

  const students = studentsFetch.data || [];
  const selectedStudent = useMemo(
    () => students.find((s) => s._id === selectedStudentId),
    [students, selectedStudentId]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationFetch.data]);

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

  return (
    <DashboardShell pageTitle="Messages">
      <PageHeader title="Messages" description="Message students currently assigned to you." />

      <div className="card flex h-[calc(100vh-220px)] overflow-hidden">
        {/* Student list */}
        <div className="w-64 flex-shrink-0 border-r border-line overflow-y-auto">
          {studentsFetch.isLoading && <Loader />}
          {studentsFetch.error && <ErrorBanner message={studentsFetch.error} />}
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
                      <div
                        className={`max-w-sm rounded-lg px-3 py-2 text-sm ${
                          isMine ? 'bg-mentor text-white' : 'bg-paper text-ink border border-line'
                        }`}
                      >
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
                  <Button type="submit" isLoading={isSending}>
                    Send
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
