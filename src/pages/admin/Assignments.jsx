import { useState, useMemo } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import ErrorBanner from "../../components/common/ErrorBanner";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/Toast";
import * as adminApi from "../../api/admin.api";
export default function Assignments() {
  const { showToast } = useToast();
  const { data: students, refetch: refetchStudents } = useFetch(() => adminApi.listStudents({ isPassout: false, isActive: true }), r => r.data.data.students, []);
  const { data: mentors } = useFetch(adminApi.listMentors, r => r.data.data.mentors, []);
  const { data: assignments, isLoading, error, refetch } = useFetch(adminApi.listAssignments, r => r.data.data.assignments, []);
  const [selectedMentorId, setSelectedMentorId] = useState(""); const [selectedStudentIds, setSelectedStudentIds] = useState([]); const [isSubmitting, setIsSubmitting] = useState(false); const [formError, setFormError] = useState("");
  const mentorOptions = useMemo(() => (mentors || []).filter(m => m.isActive).map(m => ({ value: m._id, label: m.name + (m.department ? " — " + m.department : "") })), [mentors]);
  const activeStudents = useMemo(() => (students || []).filter(s => s.isActive), [students]);
  const toggle = id => setSelectedStudentIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const handleAssign = async e => {
    e.preventDefault(); setFormError("");
    if (!selectedMentorId) { setFormError("Select a mentor."); return; }
    if (!selectedStudentIds.length) { setFormError("Select at least one student."); return; }
    setIsSubmitting(true);
    try { await adminApi.assignStudents(selectedMentorId, selectedStudentIds); showToast(selectedStudentIds.length + " student(s) assigned."); setSelectedStudentIds([]); setSelectedMentorId(""); refetch(); refetchStudents(); }
    catch (err) { setFormError(err.response?.data?.message || "Failed."); }
    finally { setIsSubmitting(false); }
  };
  const cols = [
    { key:"student",header:"Student",render:r=>r.studentId?.name||"—" }, { key:"roll",header:"Roll No.",render:r=>r.studentId?.rollNumber||"—" },
    { key:"mentor",header:"Mentor",render:r=>r.mentorId?.name||"—" }, { key:"dept",header:"Dept",render:r=>r.mentorId?.department||"—" },
    { key:"date",header:"Assigned On",render:r=>new Date(r.assignedAt).toLocaleDateString() },
  ];
  return (
    <DashboardShell pageTitle="Assignments">
      <PageHeader title="Student–Mentor Assignments" description="Assign multiple students to a mentor at once." />
      <div className="card mb-6 p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Create assignments</h3>
        <form onSubmit={handleAssign} className="space-y-4">
          <Select label="Mentor" placeholder="Select a mentor" options={mentorOptions} value={selectedMentorId} onChange={e => setSelectedMentorId(e.target.value)} />
          <div>
            <div className="flex items-center justify-between mb-2"><label className="field-label mb-0">Students ({selectedStudentIds.length} selected)</label><div className="flex gap-3 text-xs"><button type="button" onClick={() => setSelectedStudentIds(activeStudents.map(s => s._id))} className="text-accent hover:underline">Select all</button><button type="button" onClick={() => setSelectedStudentIds([])} className="text-muted hover:underline">Clear</button></div></div>
            <div className="max-h-56 overflow-y-auto rounded-md border border-line divide-y divide-line">
              {(activeStudents || []).map(s => (<label key={s._id} className={"flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-paper " + (selectedStudentIds.includes(s._id) ? "bg-accent-soft" : "")}><input type="checkbox" checked={selectedStudentIds.includes(s._id)} onChange={() => toggle(s._id)} className="h-4 w-4 accent-accent" /><span className="text-sm text-ink">{s.name}</span><span className="text-xs text-muted">({s.rollNumber})</span>{s.year && <span className="text-xs text-muted ml-auto">Year {s.year}</span>}</label>))}
            </div>
          </div>
          {formError && <ErrorBanner message={formError} />}
          <Button type="submit" isLoading={isSubmitting} className="w-full">Assign {selectedStudentIds.length > 0 ? selectedStudentIds.length : ""} student(s)</Button>
        </form>
      </div>
      <div className="card"><div className="border-b border-line px-4 py-3"><h3 className="text-sm font-semibold text-ink">Active Assignments</h3></div><Table columns={cols} rows={assignments} isLoading={isLoading} error={error} emptyTitle="No assignments yet" /></div>
    </DashboardShell>
  );
}