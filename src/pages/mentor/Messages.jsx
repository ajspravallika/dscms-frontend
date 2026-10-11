import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Select from "../../components/common/Select";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/common/Toast";
import * as mentorApi from "../../api/mentor.api";

const YEAR_OPTS = [{value:"1",label:"Year 1"},{value:"2",label:"Year 2"},{value:"3",label:"Year 3"},{value:"4",label:"Year 4"}];

export default function MentorMessages() {
  const { user } = useAuth(); const { showToast } = useToast(); const { studentId: paramId } = useParams();
  const studentsFetch = useFetch(mentorApi.listMyStudents, r => r.data.data.students, []);
  const [selectedId, setSelectedId] = useState(paramId || "");
  const [draft, setDraft] = useState(""); const [isSending, setIsSending] = useState(false);
  const [broadcastYear, setBroadcastYear] = useState(""); const [broadcastMsg, setBroadcastMsg] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false); const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [showList, setShowList] = useState(!paramId); // on mobile: show list or chat
  const bottomRef = useRef(null);
  const convFetch = useFetch(() => selectedId ? mentorApi.getConversation(selectedId) : Promise.resolve({ data: { data: { messages: [] } } }), r => r.data.data.messages, [selectedId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [convFetch.data]);
  const handleSend = async e => {
    e.preventDefault(); if (!draft.trim() || !selectedId) return; setIsSending(true);
    try { await mentorApi.sendMessage(selectedId, draft.trim()); setDraft(""); convFetch.refetch(); }
    catch (err) { showToast(err.response?.data?.message || "Failed.", "error"); }
    finally { setIsSending(false); }
  };
  const handleBroadcast = async e => {
    e.preventDefault(); if (!broadcastYear || !broadcastMsg.trim()) return; setIsBroadcasting(true);
    try { const r = await mentorApi.sendGroupMessage(broadcastYear, broadcastMsg.trim()); showToast("Sent to " + r.data.data.sent + " students."); setIsBroadcastOpen(false); setBroadcastMsg(""); setBroadcastYear(""); }
    catch (err) { showToast(err.response?.data?.message || "Failed.", "error"); }
    finally { setIsBroadcasting(false); }
  };
  const students = studentsFetch.data || [];
  const selectedStudent = students.find(s => s._id === selectedId);
  const selectStudent = (id) => { setSelectedId(id); setShowList(false); };

  return (
    <DashboardShell pageTitle="Messages">
      <PageHeader title="Messages" action={<Button variant="secondary" onClick={() => setIsBroadcastOpen(true)}>Broadcast</Button>} />
      <div className="card overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}>
        <div className="flex h-full">
          {/* Student list — full width on mobile when showList, hidden when chat open */}
          <div className={"flex-shrink-0 border-r border-line overflow-y-auto " + (showList ? "w-full sm:w-64" : "hidden sm:block sm:w-64")}>
            <div className="border-b border-line px-4 py-3"><p className="text-xs font-medium text-muted uppercase">Students</p></div>
            {students.length === 0 && <p className="px-4 py-6 text-sm text-muted text-center">No students assigned.</p>}
            {students.map(s => (
              <button key={s._id} onClick={() => selectStudent(s._id)} className={"w-full border-b border-line px-4 py-3 text-left text-sm transition-colors " + (selectedId === s._id ? "bg-mentor-soft text-mentor font-medium" : "text-ink hover:bg-paper")}>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted">{s.rollNumber}</p>
              </button>
            ))}
          </div>

          {/* Chat area — full width on mobile when chat open */}
          <div className={"flex flex-1 flex-col min-w-0 " + (!showList ? "flex" : "hidden sm:flex")}>
            {!selectedId ? <EmptyState title="Select a student to start messaging" /> : (<>
              <div className="border-b border-line px-4 py-3 flex items-center gap-3">
                <button onClick={() => setShowList(true)} className="sm:hidden text-muted hover:text-ink">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                </button>
                <p className="text-sm font-medium text-ink">{selectedStudent?.name}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {convFetch.isLoading && <Loader />}
                {convFetch.data?.map(msg => {
                  const mine = msg.senderId === user.id || msg.senderId?._id === user.id;
                  return (
                    <div key={msg._id} className={"flex " + (mine ? "justify-end" : "justify-start")}>
                      <div className={"max-w-[75%] rounded-lg px-3 py-2 text-sm " + (mine ? "bg-mentor text-white" : "bg-paper text-ink border border-line")}>
                        <p>{msg.content}</p>
                        <p className={"mt-1 text-[10px] " + (mine ? "text-white/70" : "text-muted")}>{new Date(msg.sentAt).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={handleSend} className="border-t border-line p-3">
                <div className="flex gap-2">
                  <input className="field-input flex-1 min-w-0" placeholder="Type a message..." value={draft} onChange={e => setDraft(e.target.value)} />
                  <Button type="submit" isLoading={isSending}>Send</Button>
                </div>
              </form>
            </>)}
          </div>
        </div>
      </div>

      <Modal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} title="Broadcast to year group">
        <form onSubmit={handleBroadcast} className="space-y-4">
          <Select label="Year group" placeholder="Select year" options={YEAR_OPTS} value={broadcastYear} onChange={e => setBroadcastYear(e.target.value)} />
          <div><label className="field-label">Message</label><textarea className="field-input min-h-[100px]" value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder="Message to all students in this year..." /></div>
          <Button type="submit" isLoading={isBroadcasting} className="w-full" disabled={!broadcastYear || !broadcastMsg.trim()}>Send to Year {broadcastYear}</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}