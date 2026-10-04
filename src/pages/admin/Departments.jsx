import { useState } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/Toast";
import * as adminApi from "../../api/admin.api";

export default function Departments() {
  const { showToast } = useToast();
  const { data: depts, isLoading, error, refetch } = useFetch(
    adminApi.listDepartments,
    r => r.data.data.departments,
    []
  );

  const [isOpen, setIsOpen] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [sections, setSections] = useState(["A"]);
  const [newSection, setNewSection] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const openCreate = () => {
    setEditDept(null);
    setForm({ name: "", code: "" });
    setSections(["A"]);
    setNewSection("");
    setIsActive(true);
    setFormError("");
    setIsOpen(true);
  };

  const openEdit = (dept) => {
    setEditDept(dept);
    setForm({ name: dept.name, code: dept.code || "" });
    setSections(dept.sections || ["A"]);
    setNewSection("");
    setIsActive(dept.isActive !== false);
    setFormError("");
    setIsOpen(true);
  };

  const addSection = () => {
    const s = newSection.trim().toUpperCase();
    if (!s) return;
    if (sections.includes(s)) { setFormError("Section " + s + " already exists."); return; }
    setSections(p => [...p, s]);
    setNewSection("");
    setFormError("");
  };

  const removeSection = (s) => {
    if (sections.length === 1) { setFormError("At least one section is required."); return; }
    setSections(p => p.filter(sec => sec !== s));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Department name is required."); return; }
    if (sections.length === 0) { setFormError("Add at least one section."); return; }
    setIsSubmitting(true); setFormError("");
    try {
      const payload = { ...form, sections: sections.join(","), isActive };
      if (editDept) {
        await adminApi.updateDepartment(editDept._id, payload);
        showToast("Department updated.");
      } else {
        await adminApi.createDepartment(payload);
        showToast("Department created.");
      }
      setIsOpen(false); refetch();
    } catch (err) { setFormError(err.response?.data?.message || "Failed."); }
    finally { setIsSubmitting(false); }
  };

  const cols = [
    { key: "name", header: "Department Name" },
    { key: "code", header: "Code", render: r => r.code || "—" },
    {
      key: "sections",
      header: "Sections",
      render: r => (
        <div className="flex flex-wrap gap-1">
          {(r.sections || ["A"]).map(s => (
            <span key={s} className="badge bg-accent-soft text-accent-dark">{s}</span>
          ))}
        </div>
      )
    },
    { key: "status", header: "Status", render: r => <StatusBadge status={r.isActive !== false ? "active" : "inactive"} /> },
    { key: "actions", header: "", render: r => (
      <button onClick={() => openEdit(r)} className="text-xs text-accent hover:underline">Edit</button>
    )},
  ];

  return (
    <DashboardShell pageTitle="Departments">
      <PageHeader
        title="Departments"
        description="Manage college departments and their sections. All 10 default departments are auto-created."
        action={<Button onClick={openCreate}>Add Department</Button>}
      />
      <div className="card">
        <Table columns={cols} rows={depts} isLoading={isLoading} error={error} emptyTitle="No departments yet — visit this page once to seed all defaults." />
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editDept ? "Edit department" : "Add new department"} maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department name *"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required
            placeholder="e.g. Computer Science & Engineering"
          />
          <Input
            label="Short code"
            value={form.code}
            onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
            placeholder="e.g. CSE"
          />

          {/* Sections UI */}
          <div>
            <label className="field-label">Sections</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[36px] rounded-md border border-line bg-paper p-2">
              {sections.map(s => (
                <span key={s} className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-dark">
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSection(s)}
                    className="ml-1 text-accent-dark/60 hover:text-warn font-bold"
                  >×</button>
                </span>
              ))}
              {sections.length === 0 && <p className="text-xs text-muted">No sections added yet.</p>}
            </div>
            <div className="flex gap-2">
              <input
                className="field-input flex-1"
                placeholder="e.g. A or B or C"
                value={newSection}
                onChange={e => setNewSection(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSection(); } }}
              />
              <Button type="button" variant="secondary" onClick={addSection}>Add section</Button>
            </div>
            <p className="mt-1 text-xs text-muted">Press Enter or click "Add section" to add each section one by one.</p>
          </div>

          {editDept && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm text-ink">Department is active</span>
            </label>
          )}

          {formError && <ErrorBanner message={formError} />}
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {editDept ? "Update department" : "Create department"}
          </Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}