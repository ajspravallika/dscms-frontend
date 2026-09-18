import { useState } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/Toast";
import * as mentorApi from "../../api/mentor.api";
const STATUS_OPTS=[{value:"",label:"All"},{value:"open",label:"Open"},{value:"in-progress",label:"In Progress"},{value:"resolved",label:"Resolved"}];
export default function MentorConcerns() {
  const { showToast }=useToast(); const [statusFilter,setStatusFilter]=useState(""); const [selected,setSelected]=useState(null); const [response,setResponse]=useState(""); const [newStatus,setNewStatus]=useState(""); const [isSubmitting,setIsSubmitting]=useState(false);
  const { data:concerns,isLoading,error,refetch }=useFetch(()=>mentorApi.listConcerns(statusFilter?{status:statusFilter}:{}),r=>r.data.data.concerns,[statusFilter]);
  const handleRespond=async()=>{setIsSubmitting(true);try{await mentorApi.respondToConcern(selected._id,{mentorResponse:response,status:newStatus||selected.status});showToast("Updated.");refetch();setSelected(null);}catch(err){showToast(err.response?.data?.message||"Failed.","error");}finally{setIsSubmitting(false);}};
  const cols=[{key:"student",header:"Student",render:r=>r.studentId?.name||"—"},{key:"title",header:"Title",render:r=>r.title||"Untitled"},{key:"category",header:"Category",render:r=><span className="capitalize">{r.category}</span>},{key:"status",header:"Status",render:r=><StatusBadge status={r.status} />},{key:"date",header:"Date",render:r=>new Date(r.createdAt).toLocaleDateString()},{key:"actions",header:"",render:r=><button onClick={()=>{setSelected(r);setResponse(r.mentorResponse||"");setNewStatus(r.status);}} className="text-xs text-mentor hover:underline">Respond</button>}];
  return(<DashboardShell pageTitle="Concerns"><PageHeader title="Student Concerns" action={<Select placeholder="All statuses" options={STATUS_OPTS} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="w-40" />} /><div className="card"><Table columns={cols} rows={concerns} isLoading={isLoading} error={error} emptyTitle="No concerns" /></div>
  <Modal isOpen={!!selected} onClose={()=>setSelected(null)} title="Respond to concern" maxWidth="max-w-md">{selected&&(<div className="space-y-4"><div className="rounded-md bg-paper border border-line p-3"><p className="text-xs text-muted mb-1">{selected.studentId?.name} · <span className="capitalize">{selected.category}</span></p><p className="text-sm font-medium">{selected.title}</p><p className="text-sm text-muted mt-1">{selected.description}</p></div><div><label className="field-label">Your response</label><textarea className="field-input min-h-[80px]" value={response} onChange={e=>setResponse(e.target.value)} /></div><Select label="Update status" options={[{value:"open",label:"Open"},{value:"in-progress",label:"In Progress"},{value:"resolved",label:"Resolved"}]} value={newStatus} onChange={e=>setNewStatus(e.target.value)} /><Button className="w-full" isLoading={isSubmitting} onClick={handleRespond}>Save response</Button></div>)}</Modal></DashboardShell>);
}