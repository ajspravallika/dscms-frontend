import { useState, useMemo } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import ErrorBanner from "../../components/common/ErrorBanner";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/Toast";
import * as adminApi from "../../api/admin.api";

const YEAR_OPTS = [{ value: "", label: "All years" }, { value: "1", label: "Year 1" }, { value: "2", label: "Year 2" }, { value: "3", label: "Year 3" }, { value: "4", label: "Year 4" }];

export default function Assignments() {
  const { showToast } = useToast();
  const { data: students, refetch: refetchStudents } = useFetch(() => adminApi.listStudents({ isPassout: false, isActive: true }), r => r.data.data.students, []);
  const { data: mentors } = useFetch(adminApi.listMentors, r => r.data.data.mentors, []);
  const { data: departments } = useFetch(adminApi.listDepartments, r => r.data.data.departments, []);
  const { data: assignments, isLoading, error, refetch } = useFetch(adminApi.listAssignments, r => r.data.data.assignments, []);

  const deptOptions = useMemo(() => (departments || []).filter(d => d.isActive !== false).map(d => d.code || d.name), [departments]);

  const [mentorDeptFilter, setMentorDeptFilter] = useState("");
  const [mentorSearch, setMentorSearch] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [studentDeptFilter, setStudentDeptFilter] = useState("");
  const [studentYearFilter, setStudentYearFilter] = useState("");
  const [studentSectionFilter, setStudentSectionFilter] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [viewMentor, setViewMentor] = useState(null);
  const [mentorStudents, setMentorStudents] = useState(null);
  const [isLoadingMentorStudents, setIsLoadingMentorStudents] = useState(false);
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const [autoMentorIds, setAutoMentorIds] = useState([]);
  const [splitSize, setSplitSize] = useState(5);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  const filteredMentors = useMemo(() => {
    let list = (mentors || []).filter(m => m.isActive);
    if (mentorDeptFilter) list = list.filter(m => m.department === mentorDeptFilter);
    if (mentorSearch.trim()) { const q = mentorSearch.toLowerCase(); list = list.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)); }
    return list;
  }, [mentors, mentorDeptFilter, mentorSearch]);

  const studentSections = useMemo(() => {
    let list = students || [];
    if (studentDeptFilter) list = list.filter(s => s.department === studentDeptFilter);
    if (studentYearFilter) list = list.filter(s => String(s.year) === studentYearFilter);
    return [...new Set(list.map(s => s.section).filter(Boolean))];
  }, [students, studentDeptFilter, studentYearFilter]);

  const filteredStudents = useMemo(() => {
    let list = (students || []).filter(s => s.isActive);
    if (studentDeptFilter) list = list.filter(s => s.department === studentDeptFilter);
    if (studentYearFilter) list = list.filter(s => String(s.year) === studentYearFilter);
    if (studentSectionFilter) list = list.filter(s => s.section === studentSectionFilter);
    if (studentSearch.trim()) { const q = studentSearch.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q)); }
    return list;
  }, [students, studentDeptFilter, studentYearFilter, studentSectionFilter, studentSearch]);

  const toggle = id => setSelectedStudentIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  const handleAssign = async e => {
    e.preventDefault(); setFormError("");
    if (!selectedMentorId) { setFormError("Select a mentor."); return; }
    if (!selectedStudentIds.length) { setFormError("Select at least one student."); return; }
    setIsSubmitting(true);
    try { await adminApi.assignStudents(selectedMentorId, selectedStudentIds); showToast(selectedStudentIds.length + " student(s) assigned."); setSelectedStudentIds([]); refetch(); refetchStudents(); }
    catch (err) { setFormError(err.response?.data?.message || "Failed."); }
    finally { setIsSubmitting(false); }
  };

  const handleViewMentor = async (mentor) => {
    setViewMentor(mentor); setIsLoadingMentorStudents(true); setMentorStudents(null);
    try { const r = await adminApi.getMentorStudents(mentor._id); setMentorStudents(r.data.data); }
    catch { setMentorStudents({ students: [], grouped: {}, total: 0 }); }
    finally { setIsLoadingMentorStudents(false); }
  };

  const handleAutoAssign = async () => {
    if (!autoMentorIds.length || !selectedStudentIds.length) { showToast("Select mentors and students first.", "error"); return; }
    setIsAutoAssigning(true);
    try { const r = await adminApi.autoAssignStudents(autoMentorIds, selectedStudentIds, splitSize); showToast(r.data.data.assigned.length + " students auto-assigned."); setIsAutoOpen(false); setSelectedStudentIds([]); setAutoMentorIds([]); refetch(); refetchStudents(); }
    catch (err) { showToast(err.response?.data?.message || "Auto-assign failed.", "error"); }
    finally { setIsAutoAssigning(false); }
  };

  const selectedMentor = (mentors || []).find(m => m._id === selectedMentorId);

  const cols = [
    { key: "student", header: "Student", render: r => r.studentId?.name || "—" },
    { key: "roll", header: "Roll No.", render: r => r.studentId?.rollNumber || "—" },
    { key: "year", header: "Year", render: r => r.studentId?.year ? "Year " + r.studentId.year : "—" },
    { key: "dept", header: "Dept", render: r => r.studentId?.department || "—" },
    { key: "mentor", header: "Mentor", render: r => r.mentorId?.name || "—" },
    { key: "mentorDept", header: "Mentor Dept", render: r => r.mentorId?.department || "—" },
    { key: "date", header: "Assigned On", render: r => new Date(r.assignedAt).toLocaleDateString() },
  ];

  return (
    <DashboardShell pageTitle="Assignments">
      <PageHeader title="Student–Mentor Assignments" description="Filter mentors and students, then assign manually or auto-assign." />

      <form onSubmit={handleAssign} className="space-y-6 mb-6">
        {/* MENTOR SELECTION */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">Step 1 — Select a Mentor</h3>
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="flex-1 min-w-[160px]"><label className="field-label">Search mentor</label><input className="field-input" placeholder="Name or email..." value={mentorSearch} onChange={e => setMentorSearch(e.target.value)} /></div>
            <div className="w-48">
              <label className="field-label">Filter by department</label>
              <select className="field-input" value={mentorDeptFilter} onChange={e => setMentorDeptFilter(e.target.value)}>
                <option value="">All departments</option>
                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto rounded-md border border-line divide-y divide-line">
            {filteredMentors.length === 0 && <p className="px-4 py-3 text-sm text-muted">No mentors match filters.</p>}
            {filteredMentors.map(m => (
              <label key={m._id} className={"flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-paper " + (selectedMentorId === m._id ? "bg-mentor-soft" : "")}>
                <input type="radio" name="mentor" checked={selectedMentorId === m._id} onChange={() => setSelectedMentorId(m._id)} className="h-4 w-4 accent-mentor" />
                <div className="flex-1"><p className="text-sm font-medium text-ink">{m.name}</p><p className="text-xs text-muted">{m.department || "—"} · {m.workload?.total || 0} students currently</p></div>
                <button type="button" onClick={() => handleViewMentor(m)} className="text-xs text-accent hover:underline">View mentees</button>
              </label>
            ))}
          </div>
          {selectedMentor && <div className="mt-2 rounded-md bg-mentor-soft px-3 py-2 text-xs text-mentor">Selected: <strong>{selectedMentor.name}</strong> ({selectedMentor.department || "No dept"}) — {selectedMentor.workload?.total || 0} current students</div>}
        </div>

        {/* STUDENT SELECTION */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">Step 2 — Select Students</h3>
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="flex-1 min-w-[160px]"><label className="field-label">Search student</label><input className="field-input" placeholder="Name or roll number..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} /></div>
            <div className="w-48">
              <label className="field-label">Department</label>
              <select className="field-input" value={studentDeptFilter} onChange={e => { setStudentDeptFilter(e.target.value); setStudentSectionFilter(""); }}>
                <option value="">All departments</option>
                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="w-32"><label className="field-label">Year</label><select className="field-input" value={studentYearFilter} onChange={e => setStudentYearFilter(e.target.value)}>{YEAR_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div className="w-32"><label className="field-label">Section</label><select className="field-input" value={studentSectionFilter} onChange={e => setStudentSectionFilter(e.target.value)}><option value="">All sections</option>{studentSections.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted">{filteredStudents.length} students shown · {selectedStudentIds.length} selected</p>
            <div className="flex gap-3 text-xs"><button type="button" onClick={() => setSelectedStudentIds(filteredStudents.map(s => s._id))} className="text-accent hover:underline">Select all visible</button><button type="button" onClick={() => setSelectedStudentIds([])} className="text-muted hover:underline">Clear</button></div>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-md border border-line divide-y divide-line">
            {filteredStudents.length === 0 && <p className="px-4 py-3 text-sm text-muted">No students match filters.</p>}
            {filteredStudents.map(s => (
              <label key={s._id} className={"flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-paper " + (selectedStudentIds.includes(s._id) ? "bg-accent-soft" : "")}>
                <input type="checkbox" checked={selectedStudentIds.includes(s._id)} onChange={() => toggle(s._id)} className="h-4 w-4 accent-accent" />
                <div className="flex-1"><p className="text-sm text-ink">{s.name} <span className="text-muted">({s.rollNumber})</span></p><p className="text-xs text-muted">{s.department || "—"} · {s.year ? "Year " + s.year : "—"} · {s.section ? "Sec " + s.section : "—"}</p></div>
                {s.mentorId && <span className="text-xs text-warn">Has mentor</span>}
              </label>
            ))}
          </div>
        </div>

        {formError && <ErrorBanner message={formError} />}
        <div className="flex gap-3">
          <Button type="submit" isLoading={isSubmitting} disabled={!selectedMentorId || !selectedStudentIds.length} className="flex-1">
            Assign {selectedStudentIds.length > 0 ? selectedStudentIds.length : ""} student(s) to {selectedMentor?.name || "selected mentor"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setIsAutoOpen(true)} disabled={!selectedStudentIds.length}>
            Auto-assign selected students
          </Button>
        </div>
      </form>

      <div className="card">
        <div className="border-b border-line px-4 py-3"><h3 className="text-sm font-semibold text-ink">Active Assignments</h3></div>
        <Table columns={cols} rows={assignments} isLoading={isLoading} error={error} emptyTitle="No assignments yet" />
      </div>

      {/* View mentor mentees modal */}
      <Modal isOpen={!!viewMentor} onClose={() => { setViewMentor(null); setMentorStudents(null); }} title={"Students assigned to " + (viewMentor?.name || "")} maxWidth="max-w-2xl">
        {isLoadingMentorStudents && <Loader />}
        {mentorStudents && (<div className="space-y-4">
          <p className="text-sm text-muted">Total: {mentorStudents.total} student(s)</p>
          {mentorStudents.total === 0 && <EmptyState title="No students assigned yet." />}
          {[1, 2, 3, 4].map(y => mentorStudents.grouped[y]?.length > 0 && (
            <div key={y} className="card">
              <div className="border-b border-line px-4 py-2 flex justify-between"><h4 className="text-sm font-semibold text-ink">Year {y}</h4><span className="text-xs text-muted">{mentorStudents.grouped[y].length} students</span></div>
              <table className="w-full text-sm"><thead><tr className="border-b border-line"><th className="px-4 py-2 text-left font-medium text-muted">Name</th><th className="px-4 py-2 text-left font-medium text-muted">Roll No.</th><th className="px-4 py-2 text-left font-medium text-muted">Dept</th><th className="px-4 py-2 text-left font-medium text-muted">Section</th></tr></thead>
              <tbody className="divide-y divide-line">{mentorStudents.grouped[y].map(s => (<tr key={s._id}><td className="px-4 py-2">{s.name}</td><td className="px-4 py-2 text-muted">{s.rollNumber}</td><td className="px-4 py-2 text-muted">{s.department || "—"}</td><td className="px-4 py-2 text-muted">{s.section || "—"}</td></tr>))}</tbody></table>
            </div>
          ))}
        </div>)}
      </Modal>

      {/* Auto assign modal */}
      <Modal isOpen={isAutoOpen} onClose={() => setIsAutoOpen(false)} title="Auto-assign students to mentors" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="rounded-md bg-accent-soft p-3 text-sm text-accent-dark">
            <p className="font-medium">How it works:</p>
            <p className="mt-1">Students are sorted by roll number, then split sequentially. If 23 students and split size = 5: first 5 go to mentor 1, next 5 to mentor 2, etc. Last mentor gets the remainder (e.g. 3 students).</p>
          </div>
          <div>
            <label className="field-label">Students to assign ({selectedStudentIds.length} selected)</label>
            <p className="text-xs text-muted">Go back and select students using the filters above first.</p>
          </div>
          <div>
            <label className="field-label">Split size (students per mentor)</label>
            <input type="number" min="1" max="50" className="field-input w-32" value={splitSize} onChange={e => setSplitSize(Number(e.target.value))} />
          </div>
          <div>
            <label className="field-label">Select mentors to distribute to (in order)</label>
            <div className="max-h-48 overflow-y-auto rounded-md border border-line divide-y divide-line">
              {(mentors || []).filter(m => m.isActive).map(m => (
                <label key={m._id} className={"flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-paper " + (autoMentorIds.includes(m._id) ? "bg-mentor-soft" : "")}>
                  <input type="checkbox" checked={autoMentorIds.includes(m._id)} onChange={() => setAutoMentorIds(p => p.includes(m._id) ? p.filter(i => i !== m._id) : [...p, m._id])} className="h-4 w-4 accent-mentor" />
                  <div><p className="text-sm font-medium text-ink">{m.name}</p><p className="text-xs text-muted">{m.department || "—"} · {m.workload?.total || 0} current students</p></div>
                </label>
              ))}
            </div>
          </div>
          {autoMentorIds.length > 0 && selectedStudentIds.length > 0 && (
            <div className="rounded-md bg-paper border border-line p-3 text-xs text-muted">
              {selectedStudentIds.length} students ÷ {autoMentorIds.length} mentors (split {splitSize}) = first {autoMentorIds.length - 1} mentor(s) get {splitSize} students, last mentor gets {selectedStudentIds.length - (splitSize * (autoMentorIds.length - 1))} students.
            </div>
          )}
          <Button className="w-full" isLoading={isAutoAssigning} onClick={handleAutoAssign} disabled={!autoMentorIds.length || !selectedStudentIds.length}>
            Auto-assign {selectedStudentIds.length} students to {autoMentorIds.length} mentor(s)
          </Button>
        </div>
      </Modal>
    </DashboardShell>
  );
}