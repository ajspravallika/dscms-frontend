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
const YEAR_OPTS=[{value:"1",label:"Year 1"},{value:"2",label:"Year 2"},{value:"3",label:"Year 3"},{value:"4",label:"Year 4"}];
export default function MentorMessages() {
  const { user }=useAuth(); const { showToast }=useToast(); const { studentId:paramId }=useParams();
  const studentsFetch=useFetch(mentorApi.listMyStudents,r=>r.data.data.students,[]);
  const [selectedId,setSelectedId]=useState(paramId||""); const [draft,setDraft]=useState(""); const [isSending,setIsSending]=useState(false);
  const [broadcastYear,setBroadcastYear]=useState(""); const [broadcastMsg,setBroadcastMsg]=useState(""); const [isBroadcasting,setIsBroadcasting]=useState(false); const [isBroadcastOpen,setIsBroadcastOpen]=useState(false);
  const bottomRef=useRef(null);
  const convFetch=useFetch(()=>selectedId?mentorApi.getConversation(selectedId):Promise.resolve({data:{data:{messages:[]}}}),r=>r.data.data.messages,[selectedId]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[convFetch.data]);
  const handleSend=async e=>{e.preventDefault();if(!draft.trim()||!selectedId)return;setIsSending(true);try{await mentorApi.sendMessage(selectedId,draft.trim());setDraft("");convFetch.refetch();}catch(err){showToast(err.response?.data?.message||"Failed.","error");}finally{setIsSending(false);}};
  const handleBroadcast=async e=>{e.preventDefault();if(!broadcastYear||!broadcastMsg.trim())return;setIsBroadcasting(true);try{const r=await mentorApi.sendGroupMessage(broadcastYear,broadcastMsg.trim());showToast("Sent to "+r.data.data.sent+" students.");setIsBroadcastOpen(false);setBroadcastMsg("");setBroadcastYear("");}catch(err){showToast(err.response?.data?.message||"Failed.","error");}finally{setIsBroadcasting(false);}};
  const students=studentsFetch.data||[]; const selectedStudent=students.find(s=>s._id===selectedId);
  return(<DashboardShell pageTitle="Messages"><PageHeader title="Messages" action={<Button variant="secondary" onClick={()=>setIsBroadcastOpen(true)}>Broadcast to year</Button>} /><div className="card flex h-[calc(100vh-220px)] overflow-hidden"><div className="w-64 flex-shrink-0 border-r border-line overflow-y-auto">{students.map(s=>(<button key={s._id} onClick={()=>setSelectedId(s._id)} className={"w-full border-b border-line px-4 py-3 text-left text-sm transition-colors "+(selectedId===s._id?"bg-mentor-soft text-mentor font-medium":"text-ink hover:bg-paper")}><p>{s.name}</p><p className="text-xs text-muted">{s.rollNumber}</p></button>))}</div><div className="flex flex-1 flex-col">{!selectedId?<EmptyState title="Select a student" />:(<><div className="border-b border-line px-4 py-3"><p className="text-sm font-medium text-ink">{selectedStudent?.name}</p></div><div className="flex-1 overflow-y-auto p-4 space-y-3">{convFetch.isLoading&&<Loader />}{convFetch.data?.map(msg=>{const mine=msg.senderId===user.id||msg.senderId?._id===user.id;return(<div key={msg._id} className={"flex "+(mine?"justify-end":"justify-start")}><div className={"max-w-sm rounded-lg px-3 py-2 text-sm "+(mine?"bg-mentor text-white":"bg-paper text-ink border border-line")}><p>{msg.content}</p><p className={"mt-1 text-[10px] "+(mine?"text-white/70":"text-muted")}>{new Date(msg.sentAt).toLocaleString()}</p></div></div>);})}<div ref={bottomRef} /></div><form onSubmit={handleSend} className="border-t border-line p-3"><div className="flex gap-2"><input className="field-input flex-1" placeholder="Type a message..." value={draft} onChange={e=>setDraft(e.target.value)} /><Button type="submit" isLoading={isSending}>Send</Button></div></form></>)}</div></div>
  <Modal isOpen={isBroadcastOpen} onClose={()=>setIsBroadcastOpen(false)} title="Broadcast to year group" maxWidth="max-w-md"><form onSubmit={handleBroadcast} className="space-y-4"><Select label="Year group" placeholder="Select year" options={YEAR_OPTS} value={broadcastYear} onChange={e=>setBroadcastYear(e.target.value)} /><div><label className="field-label">Message</label><textarea className="field-input min-h-[100px]" value={broadcastMsg} onChange={e=>setBroadcastMsg(e.target.value)} placeholder="Message to all students in this year..." /></div><Button type="submit" isLoading={isBroadcasting} className="w-full" disabled={!broadcastYear||!broadcastMsg.trim()}>Send to all Year {broadcastYear} students</Button></form></Modal></DashboardShell>);
}