import { useState } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ErrorBanner from "../../components/common/ErrorBanner";
import TempCredentialsCard from "../../components/common/TempCredentialsCard";
import DoubleConfirmModal from "../../components/common/DoubleConfirmModal";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/Toast";
import * as adminApi from "../../api/admin.api";

export default function ManageMentors() {
  const { showToast } = useToast();
  const { data: mentors, isLoading, error, refetch } = useFetch(adminApi.listMentors, r => r.data.data.mentors, []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ name:"",email:"",department:"",designation:"",employeeId:"",phone:"",initialPassword:"" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [createdAccount, setCreatedAccount] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Bulk upload state
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const fc = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault(); setIsSubmitting(true); setFormError("");
    try {
      const r = await adminApi.createMentor(form);
      setCreatedAccount({ email: r.data.data.mentor.email, tempPassword: r.data.data.tempPassword });
      refetch();
    } catch (err) { setFormError(err.response?.data?.message || "Failed."); }
    finally { setIsSubmitting(false); }
  };

  const handleDeactivate = async () => {
    try { await adminApi.deactivateMentor(confirmDeactivate._id); showToast("Mentor deactivated."); setConfirmDeactivate(null); refetch(); }
    catch (err) { showToast(err.response?.data?.message || "Failed.", "error"); }
  };

  const handleDelete = async () => {
    await adminApi.deleteMentor(confirmDelete._id);
    showToast("Mentor deleted permanently."); refetch();
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setIsBulkUploading(true);
    const fd = new FormData(); fd.append("file", bulkFile);
    try { const r = await adminApi.bulkUploadMentors(fd); setBulkResult(r.data.data); refetch(); }
    catch (err) { showToast(err.response?.data?.message || "Upload failed.", "error"); }
    finally { setIsBulkUploading(false); }
  };

  const cols = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "department", header: "Dept", render: r => r.department || "—" },
    { key: "designation", header: "Designation", render: r => r.designation || "—" },
    { key: "workload", header: "Students", render: r => r.workload?.total || 0 },
    { key: "status", header: "Status", render: r => <StatusBadge status={r.isActive ? "active" : "inactive"} /> },
    { key: "actions", header: "", render: r => (
      <div className="flex gap-3">
        {r.isActive && <button onClick={() => setConfirmDeactivate(r)} className="text-xs text-muted hover:text-warn">Deactivate</button>}
        <button onClick={() => setConfirmDelete(r)} className="text-xs text-warn hover:underline">Delete</button>
      </div>
    )},
  ];

  return (
    <DashboardShell pageTitle="Mentors">
      <PageHeader
        title="Mentor Accounts"
        description="Create and manage mentor accounts. Default password: Mentor@dscms"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setIsBulkOpen(true); setBulkFile(null); setBulkResult(null); }}>
              Bulk Upload
            </Button>
            <Button onClick={() => { setIsCreateOpen(true); setCreatedAccount(null); setFormError(""); setForm({ name:"",email:"",department:"",designation:"",employeeId:"",phone:"",initialPassword:"" }); }}>
              Add Mentor
            </Button>
          </div>
        }
      />

      <div className="card">
        <Table columns={cols} rows={mentors} isLoading={isLoading} error={error} emptyTitle="No mentors yet" />
      </div>

      {/* Create mentor modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add a new mentor">
        {createdAccount ? (
          <div className="space-y-4">
            <TempCredentialsCard email={createdAccount.email} tempPassword={createdAccount.tempPassword} />
            <Button variant="secondary" className="w-full" onClick={() => setIsCreateOpen(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Full name" value={form.name} onChange={fc("name")} required />
            <Input label="College email" type="email" placeholder="mentor@svecw.edu.in" value={form.email} onChange={fc("email")} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Department" value={form.department} onChange={fc("department")} />
              <Input label="Designation" value={form.designation} onChange={fc("designation")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Employee ID" value={form.employeeId} onChange={fc("employeeId")} />
              <Input label="Phone" value={form.phone} onChange={fc("phone")} />
            </div>
            <div>
              <Input label="Initial password (optional)" type="text" placeholder="Leave blank — default is Mentor@dscms" value={form.initialPassword} onChange={fc("initialPassword")} />
              <p className="mt-1 text-xs text-muted">Leave blank to use the system default password (Mentor@dscms). You can change the default in Settings.</p>
            </div>
            {formError && <ErrorBanner message={formError} />}
            <Button type="submit" isLoading={isSubmitting} className="w-full">Create mentor account</Button>
          </form>
        )}
      </Modal>

      {/* Deactivate confirm */}
      <Modal isOpen={!!confirmDeactivate} onClose={() => setConfirmDeactivate(null)} title="Deactivate mentor" maxWidth="max-w-md">
        <p className="text-sm text-ink"><strong>{confirmDeactivate?.name}</strong> will lose access. All records are kept.</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDeactivate(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeactivate}>Deactivate</Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <DoubleConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete mentor permanently"
        itemName={confirmDelete?.name || ""}
        warningText={"Permanently deletes " + (confirmDelete?.name || "") + ". Session records are preserved but all other data is removed."}
        onConfirm={handleDelete}
      />

      {/* Bulk upload modal */}
      <Modal isOpen={isBulkOpen} onClose={() => { setIsBulkOpen(false); setBulkFile(null); setBulkResult(null); }} title="Bulk upload mentors" maxWidth="max-w-md">
        {bulkResult ? (
          <div className="space-y-3">
            <div className="rounded-md bg-accent-soft p-3 text-sm text-accent-dark">✅ {bulkResult.created.length} mentor(s) created with password <strong>Mentor@dscms</strong></div>
            {bulkResult.duplicates?.length > 0 && <div className="rounded-md bg-paper border border-line p-3 text-sm text-muted">⚠️ {bulkResult.duplicates.length} duplicate(s) skipped</div>}
            {bulkResult.failed?.length > 0 && (
              <div className="rounded-md bg-warn-soft p-3 text-sm text-warn">
                ❌ {bulkResult.failed.length} failed:
                {bulkResult.failed.map((f, i) => <p key={i} className="mt-1 text-xs">{f.email} — {f.reason}</p>)}
              </div>
            )}
            <Button variant="secondary" className="w-full" onClick={() => { setIsBulkOpen(false); setBulkFile(null); setBulkResult(null); }}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-paper border border-line p-3 text-xs text-muted space-y-1">
              <p className="font-medium text-ink">Excel column headers (exact):</p>
              <p className="font-mono">Name | Email | Department | Designation | EmployeeId | Phone</p>
              <p className="mt-2">All mentors will get password <strong>Mentor@dscms</strong> by default. Add an <strong>InitialPassword</strong> column to override per row.</p>
            </div>
            <div>
              <label className="field-label">Select Excel file (.xlsx)</label>
              <input type="file" accept=".xlsx,.xls" onChange={e => setBulkFile(e.target.files[0])} className="field-input" />
            </div>
            <Button className="w-full" isLoading={isBulkUploading} onClick={handleBulkUpload} disabled={!bulkFile}>
              Upload and create accounts
            </Button>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}