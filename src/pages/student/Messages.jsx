import { useState, useRef, useEffect } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import * as studentApi from '../../api/student.api';

export default function StudentMessages() {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  // Distinguish "no mentor assigned" (404 on /student/messages, same
  // pattern as getMyMentor) from a real fetch error.
  const [noMentorAssigned, setNoMentorAssigned] = useState(false);

  const conversationFetch = useFetch(
    studentApi.getConversationWithMentor,
    (res) => res.data.data.messages,
    []
  );

  // The backend returns 404 specifically when no mentor is assigned yet
  // (see student.controller.js getConversationWithMentor). useFetch's
  // generic error string doesn't preserve the HTTP status, so we probe
  // once here to distinguish that case from a genuine fetch failure.
  useEffect(() => {
    let isMounted = true;
    studentApi.getConversationWithMentor().catch((err) => {
      if (isMounted && err.response?.status === 404) setNoMentorAssigned(true);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationFetch.data]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;

    setSendError('');
    setIsSending(true);
    try {
      await studentApi.sendMessageToMentor(draft.trim());
      setDraft('');
      conversationFetch.refetch();
    } catch (err) {
      setSendError(err.response?.data?.message || 'Could not send the message.');
    } finally {
      setIsSending(false);
    }
  };

  if (noMentorAssigned) {
    return (
      <DashboardShell pageTitle="Messages">
        <PageHeader title="Messages" />
        <EmptyState
          title="No mentor assigned yet"
          description="You'll be able to message your mentor once the administrator assigns one to you."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell pageTitle="Messages">
      <PageHeader title="Messages" description="Your conversation with your assigned mentor." />

      <div className="card flex h-[calc(100vh-220px)] flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversationFetch.isLoading && <Loader />}
          {conversationFetch.error && <ErrorBanner message={conversationFetch.error} />}
          {conversationFetch.data?.length === 0 && (
            <EmptyState title="No messages yet" description="Say hello to your mentor to start the conversation." />
          )}
          {conversationFetch.data?.map((msg) => {
            const isMine = msg.senderId === user.id || msg.senderId?._id === user.id;
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-sm rounded-lg px-3 py-2 text-sm ${
                    isMine ? 'bg-student text-white' : 'bg-paper text-ink border border-line'
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
              placeholder="Type a message to your mentor..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit" isLoading={isSending}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
