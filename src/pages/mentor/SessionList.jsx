import { useState } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/Toast";
import * as mentorApi from "../../api/mentor.api";

const YEAR_OPTS = [{ value:"",label:"All years" },{ value:"1",label:"Year 1" },{ value:"2",label:"Year 2" },{ value:"3",label:"Year 3" },{ value:"4",label:"Year 4" }];
const TOPIC_OPTS = ["academic","personal","behavioral","career","other"];

export default function SessionList() {
  const { showToast } = useToast();
  const [yearFilter, setYearFilter] = useState("");
  const [selected, setSelected] = useState(null);   // view modal
  const [editing, setEditing] = useState(null);      // edit modal
  const [editRecords, setEditRecords] = useState([]);
  const [editTopic, setEditTopic] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: sessions, isLoading, error, refetch } = useFetch(
    () => mentorApi.listSessions(yearFilter ? { year: yearFilter } : {}),
    r => r.data.data.sessions, [yearFilter]
  );

  const openEdit = (s) => {
    setEditing(s);
    setEditTopic(s.topic);
    setEditNotes(s.generalNotes || "");
    setEditRecords(s.studentRecords.map(r => ({ ...r })));
  };

  const toggleAttendance = (studentId) => {
    setEditRecords(prev => prev.map(r =>
      (r.studentId === studentId || r.studentId?._id === studentId || r.studentId?.toString() === studentId?.toString())
        ? { ...r, attendance: r.attendance === "present" ? "absent" : "present" }
        : r
    ));
  };

  const updateField = (studentId, field, value) => {
    setEditRecords(prev => prev.map(r =>
      (r.studentId === studentId || r.studentId?._id === studentId || r.studentId?.toString() === studentId?.toString())
        ? { ...r, [field]: value }
        : r
    ));
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await mentorApi.updateSession(editing._id, { topic: editTopic, generalNotes: editNotes, studentRecords: editRecords });
      showToast("Session updated.");
      setEditing(null); refetch();
    } catch (err) { showToast(err.response?.data?.message || "Failed to save.", "error"); }
    finally { setIsSaving(false); }
  };

  const handleSubmit = async (id) => {
    setIsSubmitting(true);
    try { await mentorApi.submitSession(id); showToast("Submitted to admin."); refetch(); setSelected(null); }
    catch (err) { showToast(err.response?.data?.message || "Failed.", "error"); }
    finally { setIsSubmitting(false); }
  };

  const presentCount = editRecords.filter(r => r.attendance === "present").length;

  return (
    <DashboardShell pageTitle="Sessions">
      <PageHeader title="Counseling Sessions" action={
        <div className="flex gap-2">
          <select className="field-input w-36" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            {YEAR_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button onClick={() => window.location.href = "/mentor/sessions/new"}>Record Session</Button>
        </div>
      } />
      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {sessions?.length === 0 && <EmptyState title="No sessions yet" description="Click Record Session to get started." />}
      <div className="space-y-3">
        {sessions?.map(s => (
          <div key={s._id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{new Date(s.scheduledDate).toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
                  <span className="badge bg-mentor-soft text-mentor">Year {s.year}</span>
                  <span className="badge bg-paper border border-line text-muted capitalize">{s.topic}</span>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-xs text-muted mt-1">{s.presentCount} present · {s.absentCount} absent · {s.totalStudents} total</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setSelected(s)} className="text-xs text-mentor hover:underline">View</button>
                {s.status === "draft" && <>
                  <button onClick={() => openEdit(s)} className="text-xs text-accent hover:underline">Edit</button>
                  <button onClick={() => handleSubmit(s._id)} className="text-xs text-ink hover:underline">Submit</button>
                </>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={"Session — " + (selected ? new Date(selected.scheduledDate).toLocaleDateString() : "")} maxWidth="max-w-2xl">
        {selected && (<div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-muted">Year</p><p className="font-medium">Year {selected.year}</p></div>
            <div><p className="text-muted">Topic</p><p className="font-medium capitalize">{selected.topic}</p></div>
            <div><p className="text-muted">Status</p><StatusBadge status={selected.status} /></div>
          </div>
          {selected.generalNotes && <div className="rounded-md bg-paper border border-line p-3"><p className="text-xs text-muted mb-1">General notes</p><p className="text-sm">{selected.generalNotes}</p></div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line text-left"><th className="pb-2 text-muted font-medium">Student</th><th className="pb-2 text-muted font-medium">Attendance</th><th className="pb-2 text-muted font-medium">Remarks</th><th className="pb-2 text-muted font-medium">Action Items</th></tr></thead>
              <tbody className="divide-y divide-line">
                {selected.studentRecords?.map(r => (
                  <tr key={r._id}><td className="py-2">{r.studentName}<br /><span className="text-xs text-muted">{r.studentRollNumber}</span></td><td className="py-2"><StatusBadge status={r.attendance} /></td><td className="py-2 text-muted text-xs max-w-[160px]">{r.remarks || "—"}</td><td className="py-2 text-muted text-xs max-w-[160px]">{r.actionItems || "—"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected.status === "draft" && (
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setSelected(null); openEdit(selected); }}>Edit session</Button>
              <Button className="flex-1" isLoading={isSubmitting} onClick={() => handleSubmit(selected._id)}>Submit to admin</Button>
            </div>
          )}
        </div>)}
      </Modal>

      {/* EDIT modal — full attendance editor */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={"Edit Session — " + (editing ? new Date(editing.scheduledDate).toLocaleDateString() : "")} maxWidth="max-w-2xl">
        {editing && (
          <div className="space-y-4">
            <div className="rounded-md bg-accent-soft px-3 py-2 text-xs text-accent-dark">
              ✏️ Draft session — edit attendance and remarks freely before submitting to admin.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Topic</label>
                <select className="field-input" value={editTopic} onChange={e => setEditTopic(e.target.value)}>
                  {TOPIC_OPTS.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">General notes</label>
                <input className="field-input" value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Overall session notes..." />
              </div>
            </div>

            {/* Student records */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-ink">Students ({presentCount} present, {editRecords.length - presentCount} absent)</p>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {editRecords.map((r, i) => {
                  const isPresent = r.attendance === "present";
                  const sid = r.studentId?._id || r.studentId;
                  return (
                    <div key={i} className={"rounded-md border p-3 " + (isPresent ? "border-accent/30 bg-accent-soft/20" : "border-line bg-paper")}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-ink">{r.studentName}</p>
                          <p className="text-xs text-muted">{r.studentRollNumber}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleAttendance(sid)}
                          className={"px-3 py-1 rounded-full text-xs font-medium transition-colors " + (isPresent ? "bg-accent text-white hover:bg-accent-dark" : "bg-paper border border-line text-muted hover:border-accent hover:text-accent")}
                        >
                          {isPresent ? "✓ Present" : "Absent"}
                        </button>
                      </div>
                      {isPresent && (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-2">
                          <div><label className="field-label">Purpose</label><input className="field-input" value={r.purpose || ""} onChange={e => updateField(sid, "purpose", e.target.value)} placeholder="Purpose of counseling..." /></div>
                          <div><label className="field-label">Remarks</label><textarea className="field-input min-h-[60px]" value={r.remarks || ""} onChange={e => updateField(sid, "remarks", e.target.value)} placeholder="What was discussed..." /></div>
                          <div><label className="field-label">Outcome</label><textarea className="field-input min-h-[60px]" value={r.outcome || ""} onChange={e => updateField(sid, "outcome", e.target.value)} placeholder="Outcome..." /></div>
                          <div><label className="field-label">Action Items</label><textarea className="field-input min-h-[60px]" value={r.actionItems || ""} onChange={e => updateField(sid, "actionItems", e.target.value)} placeholder="Follow-up actions..." /></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="flex-1" isLoading={isSaving} onClick={handleSaveEdit}>Save changes</Button>
              <Button className="flex-1" isLoading={isSubmitting} onClick={async () => { await handleSaveEdit(); await handleSubmit(editing._id); }}>Save & Submit</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}