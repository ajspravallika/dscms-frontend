import { useState, useRef, useEffect } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorBanner from "../../components/common/ErrorBanner";
import Button from "../../components/common/Button";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import * as studentApi from "../../api/student.api";

export default function StudentMessages() {
  const { user } = useAuth();
  const [draft, setDraft] = useState(""); const [isSending, setIsSending] = useState(false); const [sendError, setSendError] = useState("");
  const bottomRef = useRef(null);
  const { data: messages, isLoading, error, refetch } = useFetch(studentApi.getConversation, r => r.data.data.messages, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const handleSend = async e => {
    e.preventDefault(); if (!draft.trim()) return; setSendError(""); setIsSending(true);
    try { await studentApi.sendMessage(draft.trim()); setDraft(""); refetch(); }
    catch (err) { setSendError(err.response?.data?.message || "Failed to send."); }
    finally { setIsSending(false); }
  };
  return (
    <DashboardShell pageTitle="Messages">
      <PageHeader title="Messages with your Mentor" />
      <div className="card flex flex-col overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading && <Loader />}
          {error && <ErrorBanner message={error} />}
          {messages?.length === 0 && <EmptyState title="No messages yet" description="Send a message to your mentor." />}
          {messages?.map(msg => {
            const mine = msg.senderId === user.id || msg.senderId?._id === user.id;
            return (
              <div key={msg._id} className={"flex " + (mine ? "justify-end" : "justify-start")}>
                <div className={"max-w-[75%] rounded-lg px-3 py-2 text-sm " + (mine ? "bg-student text-white" : "bg-paper text-ink border border-line")}>
                  <p>{msg.content}</p>
                  <p className={"mt-1 text-[10px] " + (mine ? "text-white/70" : "text-muted")}>{new Date(msg.sentAt).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="border-t border-line p-3">
          {sendError && <p className="text-xs text-warn mb-2">{sendError}</p>}
          <div className="flex gap-2">
            <input className="field-input flex-1 min-w-0" placeholder="Type a message to your mentor..." value={draft} onChange={e => setDraft(e.target.value)} />
            <Button type="submit" isLoading={isSending}>Send</Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}