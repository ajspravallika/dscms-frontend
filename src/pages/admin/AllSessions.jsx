import { useState } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Select from "../../components/common/Select";
import { useFetch } from "../../hooks/useFetch";
import * as adminApi from "../../api/admin.api";
const YEAR_OPTS=[{value:"",label:"All years"},{value:"1",label:"Year 1"},{value:"2",label:"Year 2"},{value:"3",label:"Year 3"},{value:"4",label:"Year 4"}];
export default function AllSessions() {
  const [yearFilter, setYearFilter] = useState(""); const [selected, setSelected] = useState(null);
  const { data: sessions, isLoading, error } = useFetch(() => adminApi.getAllSessions(yearFilter ? { year: yearFilter } : {}), r => r.data.data.sessions, [yearFilter]);
  const cols = [
    { key:"date",header:"Date",render:r=>new Date(r.scheduledDate).toLocaleDateString() },
    { key:"mentor",header:"Mentor",render:r=>r.mentorName||r.mentorId?.name||"—" },
    { key:"year",header:"Year",render:r=>"Year "+r.year },
    { key:"topic",header:"Topic",render:r=><span className="capitalize">{r.topic}</span> },
    { key:"present",header:"Present",render:r=>r.presentCount }, { key:"absent",header:"Absent",render:r=>r.absentCount },
    { key:"status",header:"Status",render:r=><StatusBadge status={r.status} /> },
    { key:"actions",header:"",render:r=><button onClick={()=>setSelected(r)} className="text-xs text-accent hover:underline">View</button> },
  ];
  return (
    <DashboardShell pageTitle="Counseling Records">
      <PageHeader title="All Counseling Sessions" action={<Select placeholder="All years" options={YEAR_OPTS} value={yearFilter} onChange={e=>setYearFilter(e.target.value)} className="w-36" />} />
      <div className="card"><Table columns={cols} rows={sessions} isLoading={isLoading} error={error} emptyTitle="No sessions found" /></div>
      <Modal isOpen={!!selected} onClose={()=>setSelected(null)} title={"Session — "+(selected?new Date(selected.scheduledDate).toLocaleDateString():"")} maxWidth="max-w-2xl">
        {selected&&(<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm"><div><p className="text-muted">Mentor</p><p className="font-medium">{selected.mentorName}</p></div><div><p className="text-muted">Year</p><p className="font-medium">Year {selected.year}</p></div><div><p className="text-muted">Topic</p><p className="font-medium capitalize">{selected.topic}</p></div></div>
          {selected.generalNotes&&<div className="rounded-md bg-paper border border-line p-3"><p className="text-xs text-muted mb-1">General notes</p><p className="text-sm">{selected.generalNotes}</p></div>}
          <table className="w-full text-sm"><thead><tr className="border-b border-line text-left"><th className="pb-2 text-muted font-medium">Student</th><th className="pb-2 text-muted font-medium">Roll No.</th><th className="pb-2 text-muted font-medium">Attendance</th><th className="pb-2 text-muted font-medium">Remarks</th></tr></thead><tbody className="divide-y divide-line">{(selected.studentRecords||[]).map(r=>(<tr key={r._id}><td className="py-2">{r.studentName}</td><td className="py-2 text-muted">{r.studentRollNumber}</td><td className="py-2"><StatusBadge status={r.attendance} /></td><td className="py-2 text-muted max-w-xs truncate">{r.remarks||"—"}</td></tr>))}</tbody></table>
        </div>)}
      </Modal>
    </DashboardShell>
  );
}