import { useState } from "react";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ErrorBanner from "../../components/common/ErrorBanner";
import Loader from "../../components/common/Loader";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/Toast";
import * as adminApi from "../../api/admin.api";

export default function AdminSettings() {
  const { showToast } = useToast();
  const { data: settings, isLoading, error, refetch } = useFetch(
    adminApi.getSettings, r => r.data.data.settings, []
  );
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState({});
  const [formError, setFormError] = useState({});

  const handleSave = async (key) => {
    if (!editing[key]?.trim()) { setFormError(p => ({ ...p, [key]: "Cannot be empty." })); return; }
    setSaving(p => ({ ...p, [key]: true })); setFormError(p => ({ ...p, [key]: "" }));
    try {
      await adminApi.updateSetting(key, editing[key]);
      showToast("Password updated.");
      setEditing(p => ({ ...p, [key]: undefined }));
      refetch();
    } catch (err) { setFormError(p => ({ ...p, [key]: err.response?.data?.message || "Failed." })); }
    finally { setSaving(p => ({ ...p, [key]: false })); }
  };

  return (
    <DashboardShell pageTitle="Settings">
      <PageHeader title="System Settings" description="Manage default passwords and system configuration." />
      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      <div className="space-y-4 max-w-lg">
        {settings?.map(s => (
          <div key={s.key} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-ink">{s.label}</p>
                <p className="text-xs text-muted mt-0.5">Key: {s.key}</p>
              </div>
              {editing[s.key] === undefined && (
                <button onClick={() => setEditing(p => ({ ...p, [s.key]: s.value }))} className="text-xs text-accent hover:underline">Edit</button>
              )}
            </div>
            {editing[s.key] !== undefined ? (
              <div className="space-y-3">
                <Input label="New value" value={editing[s.key]} onChange={e => setEditing(p => ({ ...p, [s.key]: e.target.value }))} />
                {formError[s.key] && <ErrorBanner message={formError[s.key]} />}
                <div className="flex gap-2">
                  <Button isLoading={saving[s.key]} onClick={() => handleSave(s.key)}>Save</Button>
                  <Button variant="secondary" onClick={() => setEditing(p => ({ ...p, [s.key]: undefined }))}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-paper border border-line px-3 py-2 font-mono text-sm text-ink">{s.value}</div>
            )}
            {s.updatedAt && <p className="mt-2 text-xs text-muted">Last updated: {new Date(s.updatedAt).toLocaleString()}</p>}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}