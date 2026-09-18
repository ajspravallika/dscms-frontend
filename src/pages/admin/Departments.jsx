import { useState } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ErrorBanner from "../../components/common/ErrorBanner";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/Toast";
import * as adminApi from "../../api/admin.api";
export default function Departments() {
  const { showToast } = useToast();
  const { data: depts, isLoading, error, refetch } = useFetch(adminApi.listDepartments, r => r.data.data.departments, []);
  const [isOpen, setIsOpen] = useState(false); const [form, setForm] = useState({ name: "", code: "" }); const [isSubmitting, setIsSubmitting] = useState(false); const [formError, setFormError] = useState("");
  const handleCreate = async e => { e.preventDefault(); setIsSubmitting(true); setFormError(""); try { await adminApi.createDepartment(form); showToast("Department created."); setIsOpen(false); setForm({ name: "", code: "" }); refetch(); } catch (err) { setFormError(err.response?.data?.message || "Failed."); } finally { setIsSubmitting(false); } };
  const cols = [{ key:"name",header:"Department Name" },{ key:"code",header:"Code",render:r=>r.code||"—" },{ key:"status",header:"Status",render:r=><StatusBadge status={r.isActive?"active":"inactive"} /> },{ key:"created",header:"Created",render:r=>new Date(r.createdAt).toLocaleDateString() }];
  return (
    <DashboardShell pageTitle="Departments">
      <PageHeader title="Departments" action={<Button onClick={() => setIsOpen(true)}>Add Department</Button>} />
      <div className="card"><Table columns={cols} rows={depts} isLoading={isLoading} error={error} emptyTitle="No departments yet" /></div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add department" maxWidth="max-w-md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Department name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Code (optional)" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. CSE" />
          {formError && <ErrorBanner message={formError} />}
          <Button type="submit" isLoading={isSubmitting} className="w-full">Create</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}