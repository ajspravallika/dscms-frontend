import { useState, useMemo } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import TempCredentialsCard from "../../components/common/TempCredentialsCard";
import DoubleConfirmModal from "../../components/common/DoubleConfirmModal";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/Toast";
import * as adminApi from "../../api/admin.api";

const YEAR_OPTS = [{ value: "1", label: "Year 1" }, { value: "2", label: "Year 2" }, { value: "3", label: "Year 3" }, { value: "4", label: "Year 4" }];

export default function ManageStudents() {
  const { showToast } = useToast();

  // Load students
  const { data: allStudents, isLoading, error, refetch } = useFetch(
    () => adminApi.listStudents({ isPassout: false }),
    r => r.data.data.students, []
  );

  // Load departments from MASTER LIST — not from student data
  const { data: departments } = useFetch(
    adminApi.listDepartments,
    r => r.data.data.departments, []
  );

  const { data: batches, refetch: refetchBatches } = useFetch(
    adminApi.listPassoutBatches, r => r.data.data.batches, []
  );

  const [activeTab, setActiveTab] = useState("active");

  // Filters — using master department list
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  // All departments from master list
  const deptOptions = useMemo(() =>
    (departments || []).filter(d => d.isActive !== false).map(d => d.code || d.name),
    [departments]
  );

  // Sections from actual student data (filtered by dept+year)
  const sectionOptions = useMemo(() => {
    let list = allStudents || [];
    if (deptFilter) list = list.filter(s => s.department === deptFilter);
    if (yearFilter) list = list.filter(s => String(s.year) === yearFilter);
    return [...new Set(list.map(s => s.section).filter(Boolean))];
  }, [allStudents, deptFilter, yearFilter]);

  // Filtered students
  const filtered = useMemo(() => {
    let list = (allStudents || []).filter(s => !s.isPassout);
    if (yearFilter) list = list.filter(s => String(s.year) === yearFilter);
    if (deptFilter) list = list.filter(s => s.department === deptFilter);
    if (sectionFilter) list = list.filter(s => s.section === sectionFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name?.toLowerCase().includes(q) || s.rollNumber?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
    }
    return list;
  }, [allStudents, yearFilter, deptFilter, sectionFilter, search]);

  // Create student
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", rollNumber: "", department: "", year: "", section: "", parentContact: "", phone: "", initialPassword: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [createdAccount, setCreatedAccount] = useState(null);
  const fc = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault(); setIsSubmitting(true); setFormError("");
    try {
      const payload = { ...form };
      if (payload.year) payload.year = Number(payload.year);
      if (!payload.initialPassword) delete payload.initialPassword;
      const r = await adminApi.createStudent(payload);
      setCreatedAccount({ email: r.data.data.student.email, tempPassword: r.data.data.tempPassword });
      refetch();
    } catch (err) { setFormError(err.response?.data?.message || "Failed."); }
    finally { setIsSubmitting(false); }
  };

  // Deactivate / Delete
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const handleDeactivate = async () => {
    try { await adminApi.deactivateStudent(confirmDeactivate._id); showToast("Student deactivated."); setConfirmDeactivate(null); refetch(); }
    catch (err) { showToast(err.response?.data?.message || "Failed.", "error"); }
  };
  const handleDelete = async () => { await adminApi.deleteStudent(confirmDelete._id); showToast("Student deleted."); refetch(); };

  // Bulk upload
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const handleBulk = async () => {
    if (!bulkFile) return; setIsBulkUploading(true);
    const fd = new FormData(); fd.append("file", bulkFile);
    try { const r = await adminApi.bulkUploadStudents(fd); setBulkResult(r.data.data); refetch(); }
    catch (err) { showToast(err.response?.data?.message || "Upload failed.", "error"); }
    finally { setIsBulkUploading(false); }
  };

  // Promote
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [passoutLabel, setPassoutLabel] = useState(new Date().getFullYear() + " Passed Out");
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteStep, setPromoteStep] = useState(1);
  const handlePromote = async () => {
    setIsPromoting(true);
    try { await adminApi.promoteStudents(passoutLabel); showToast("Students promoted."); setIsPromoteOpen(false); setPromoteStep(1); refetch(); refetchBatches(); }
    catch (err) { showToast(err.response?.data?.message || "Failed.", "error"); }
    finally { setIsPromoting(false); }
  };

  // Passout batch delete
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [batchDeleteStep, setBatchDeleteStep] = useState(1);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const handleDeleteBatch = async () => {
    setIsDeletingBatch(true);
    try { await adminApi.deletePassoutBatch(batchToDelete.batch); showToast(batchToDelete.batch + " deleted."); setBatchToDelete(null); setBatchDeleteStep(1); refetchBatches(); refetch(); }
    catch (err) { showToast(err.response?.data?.message || "Failed.", "error"); }
    finally { setIsDeletingBatch(false); }
  };

  const cols = [
    { key: "name", header: "Name" },
    { key: "rollNumber", header: "Roll No." },
    { key: "email", header: "Email" },
    { key: "department", header: "Dept", render: r => r.department || "—" },
    { key: "year", header: "Year", render: r => r.year ? "Year " + r.year : "—" },
    { key: "section", header: "Section", render: r => r.section || "—" },
    { key: "mentor", header: "Mentor", render: r => r.mentorId ? <StatusBadge status="active" /> : <span className="badge bg-warn-soft text-warn">Unassigned</span> },
    { key: "status", header: "Status", render: r => <StatusBadge status={r.isActive ? "active" : "inactive"} /> },
    { key: "actions", header: "", render: r => (
      <div className="flex gap-3">
        {r.isActive && <button onClick={() => setConfirmDeactivate(r)} className="text-xs text-muted hover:text-warn">Deactivate</button>}
        <button onClick={() => setConfirmDelete(r)} className="text-xs text-warn hover:underline">Delete</button>
      </div>
    )},
  ];

  return (
    <DashboardShell pageTitle="Students">
      <PageHeader
        title="Student Accounts"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setIsBulkOpen(true)}>Bulk Upload</Button>
            <Button variant="secondary" onClick={() => { setIsPromoteOpen(true); setPromoteStep(1); }}>Promote Year Groups</Button>
            <Button onClick={() => { setIsCreateOpen(true); setCreatedAccount(null); setFormError(""); setForm({ name:"",email:"",rollNumber:"",department:"",year:"",section:"",parentContact:"",phone:"",initialPassword:"" }); }}>Add Student</Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab("active")} className={"px-4 py-2 rounded-md text-sm font-medium " + (activeTab === "active" ? "bg-accent text-white" : "bg-surface border border-line text-ink")}>
          Active ({(allStudents || []).filter(s => !s.isPassout).length})
        </button>
        <button onClick={() => setActiveTab("passouts")} className={"px-4 py-2 rounded-md text-sm font-medium " + (activeTab === "passouts" ? "bg-accent text-white" : "bg-surface border border-line text-ink")}>
          Passouts ({batches?.length || 0})
        </button>
      </div>

      {activeTab === "active" && (
        <div className="card">
          {/* Filters — departments from MASTER LIST */}
          <div className="p-4 border-b border-line space-y-3">
            <input className="field-input w-full" placeholder="Search name, roll number, email..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="field-label">Year</label>
                <select className="field-input" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                  <option value="">All years</option>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Department</label>
                <select className="field-input" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setSectionFilter(""); }}>
                  <option value="">All departments</option>
                  {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Section</label>
                <select className="field-input" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
                  <option value="">All sections</option>
                  {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{filtered.length} student(s) shown</span>
              {(search || yearFilter || deptFilter || sectionFilter) && (
                <button onClick={() => { setSearch(""); setYearFilter(""); setDeptFilter(""); setSectionFilter(""); }} className="text-warn hover:underline">Clear filters</button>
              )}
            </div>
          </div>
          <Table columns={cols} rows={filtered} isLoading={isLoading} error={error} emptyTitle="No students found" />
        </div>
      )}

      {activeTab === "passouts" && (
        <div className="space-y-3">
          {!batches || batches.length === 0
            ? <EmptyState title="No passout batches yet" />
            : batches.map(b => (
              <div key={b.batch} className="card flex items-center justify-between px-5 py-4">
                <div><p className="text-sm font-semibold text-ink">{b.batch}</p><p className="text-xs text-muted">{b.count} students</p></div>
                <button onClick={() => { setBatchToDelete(b); setBatchDeleteStep(1); }} className="text-xs font-medium text-warn hover:underline">Delete batch</button>
              </div>
            ))
          }
        </div>
      )}

      {/* Create student modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add a new student">
        {createdAccount
          ? <div className="space-y-4"><TempCredentialsCard email={createdAccount.email} tempPassword={createdAccount.tempPassword} /><Button variant="secondary" className="w-full" onClick={() => setIsCreateOpen(false)}>Done</Button></div>
          : <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Full name" value={form.name} onChange={fc("name")} required />
              <Input label="College email" type="email" placeholder="student@svecw.edu.in" value={form.email} onChange={fc("email")} required />
              <Input label="Roll number" value={form.rollNumber} onChange={fc("rollNumber")} required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Department</label>
                  <select className="field-input" value={form.department} onChange={fc("department")}>
                    <option value="">Select department</option>
                    {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <Select label="Year" placeholder="Select year" options={YEAR_OPTS} value={form.year} onChange={fc("year")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Section" value={form.section} onChange={fc("section")} />
                <Input label="Phone" value={form.phone} onChange={fc("phone")} />
              </div>
              <Input label="Parent contact" value={form.parentContact} onChange={fc("parentContact")} />
              <div>
                <Input label="Initial password (optional)" type="text" placeholder="Leave blank — default is Student@dscms" value={form.initialPassword} onChange={fc("initialPassword")} />
                <p className="mt-1 text-xs text-muted">Leave blank to use default password (Student@dscms).</p>
              </div>
              {formError && <ErrorBanner message={formError} />}
              <Button type="submit" isLoading={isSubmitting} className="w-full">Create student account</Button>
            </form>
        }
      </Modal>

      {/* Deactivate */}
      <Modal isOpen={!!confirmDeactivate} onClose={() => setConfirmDeactivate(null)} title="Deactivate student" maxWidth="max-w-md">
        <p className="text-sm text-ink"><strong>{confirmDeactivate?.name}</strong> will lose access. Records are kept.</p>
        <div className="mt-5 flex justify-end gap-3"><Button variant="secondary" onClick={() => setConfirmDeactivate(null)}>Cancel</Button><Button variant="danger" onClick={handleDeactivate}>Deactivate</Button></div>
      </Modal>

      {/* Delete */}
      <DoubleConfirmModal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete student permanently" itemName={confirmDelete?.name || ""} warningText={"Permanently deletes " + (confirmDelete?.name || "") + " and all their personal data."} onConfirm={handleDelete} />

      {/* Bulk upload */}
      <Modal isOpen={isBulkOpen} onClose={() => { setIsBulkOpen(false); setBulkFile(null); setBulkResult(null); }} title="Bulk upload students">
        {bulkResult
          ? <div className="space-y-3">
              <div className="rounded-md bg-accent-soft p-3 text-sm text-accent-dark">✅ {bulkResult.created.length} student(s) created with password <strong>Student@dscms</strong></div>
              {bulkResult.duplicates?.length > 0 && <div className="rounded-md bg-paper border border-line p-3 text-sm text-muted">⚠️ {bulkResult.duplicates.length} duplicate(s) skipped</div>}
              {bulkResult.failed?.length > 0 && <div className="rounded-md bg-warn-soft p-3 text-sm text-warn">❌ {bulkResult.failed.length} failed: {bulkResult.failed.map((f, i) => <p key={i} className="text-xs mt-1">{f.email} — {f.reason}</p>)}</div>}
              <Button variant="secondary" className="w-full" onClick={() => { setIsBulkOpen(false); setBulkFile(null); setBulkResult(null); }}>Done</Button>
            </div>
          : <div className="space-y-4">
              <div className="rounded-md bg-paper border border-line p-3 text-xs text-muted">
                <p className="font-medium text-ink mb-1">Excel column headers (exact):</p>
                <p className="font-mono">Name | Email | RollNumber | Department | Year | Section | Phone | ParentContact</p>
                <p className="mt-2">All students get password <strong>Student@dscms</strong> by default.</p>
              </div>
              <div><label className="field-label">Select Excel file (.xlsx)</label><input type="file" accept=".xlsx,.xls" onChange={e => setBulkFile(e.target.files[0])} className="field-input" /></div>
              <Button className="w-full" isLoading={isBulkUploading} onClick={handleBulk} disabled={!bulkFile}>Upload and create accounts</Button>
            </div>
        }
      </Modal>

      {/* Promote */}
      <Modal isOpen={isPromoteOpen} onClose={() => { setIsPromoteOpen(false); setPromoteStep(1); }} title="Promote year groups" maxWidth="max-w-md">
        {promoteStep === 1
          ? <div className="space-y-4">
              <div className="rounded-md bg-paper border border-line p-4 text-sm space-y-1">
                <p className="font-medium text-ink mb-2">What will happen:</p>
                <p>📚 Year 1→2, Year 2→3, Year 3→4</p>
                <p>🎓 Year 4→Passout batch (accounts deactivated)</p>
              </div>
              <Input label="Passout batch label" value={passoutLabel} onChange={e => setPassoutLabel(e.target.value)} />
              <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setIsPromoteOpen(false)}>Cancel</Button><Button onClick={() => setPromoteStep(2)}>Continue</Button></div>
            </div>
          : <div className="space-y-4">
              <div className="rounded-md bg-warn-soft border border-warn/30 p-4"><p className="text-sm font-medium text-warn">⚠️ This cannot be reversed automatically.</p></div>
              <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setPromoteStep(1)}>Go back</Button><Button isLoading={isPromoting} onClick={handlePromote}>Confirm promotion</Button></div>
            </div>
        }
      </Modal>

      {/* Delete passout batch */}
      <Modal isOpen={!!batchToDelete} onClose={() => { setBatchToDelete(null); setBatchDeleteStep(1); }} title={"Delete " + batchToDelete?.batch} maxWidth="max-w-md">
        {batchDeleteStep === 1
          ? <div className="space-y-4">
              <div className="rounded-md bg-warn-soft border border-warn/30 p-4"><p className="text-sm font-medium text-warn">⚠️ Permanently deletes {batchToDelete?.count} students.</p></div>
              <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setBatchToDelete(null)}>Cancel</Button><Button variant="danger" onClick={() => setBatchDeleteStep(2)}>Continue</Button></div>
            </div>
          : <div className="space-y-4">
              <p className="text-sm text-ink">Are you absolutely sure?</p>
              <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setBatchDeleteStep(1)}>Go back</Button><Button variant="danger" isLoading={isDeletingBatch} onClick={handleDeleteBatch}>Yes, delete entire batch</Button></div>
            </div>
        }
      </Modal>
    </DashboardShell>
  );
}