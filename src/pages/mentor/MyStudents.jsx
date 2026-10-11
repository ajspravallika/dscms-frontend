import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import { useFetch } from "../../hooks/useFetch";
import * as mentorApi from "../../api/mentor.api";
import * as adminApi from "../../api/admin.api";

export default function MyStudents() {
  const { data: students, isLoading, error } = useFetch(
    mentorApi.listMyStudents, r => r.data.data.students, []
  );
  // Load departments from master list — not from student data
  const { data: departments } = useFetch(
    adminApi.listDepartments, r => r.data.data.departments, []
  );

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  const deptOptions = useMemo(() =>
    (departments || []).filter(d => d.isActive !== false).map(d => d.code || d.name),
    [departments]
  );

  const sections = useMemo(() => {
    let list = students || [];
    if (deptFilter) list = list.filter(s => s.department === deptFilter);
    if (yearFilter) list = list.filter(s => String(s.year) === yearFilter);
    return [...new Set(list.map(s => s.section).filter(Boolean))];
  }, [students, deptFilter, yearFilter]);

  const filtered = useMemo(() => {
    let list = students || [];
    if (yearFilter) list = list.filter(s => String(s.year) === yearFilter);
    if (deptFilter) list = list.filter(s => s.department === deptFilter);
    if (sectionFilter) list = list.filter(s => s.section === sectionFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name?.toLowerCase().includes(q) || s.rollNumber?.toLowerCase().includes(q));
    }
    return list;
  }, [students, yearFilter, deptFilter, sectionFilter, search]);

  const grouped = useMemo(() => {
    const g = { 1: [], 2: [], 3: [], 4: [] };
    filtered.forEach(s => { if (s.year && g[s.year]) g[s.year].push(s); });
    return g;
  }, [filtered]);

  return (
    <DashboardShell pageTitle="My Students">
      <PageHeader title="Assigned Students" />
      {isLoading && <Loader />}
      {error && <ErrorBanner message={error} />}
      {students && (
        <>
          {/* Filters */}
          <div className="card p-4 mb-4 space-y-3">
            <input
              className="field-input w-full"
              placeholder="Search name or roll number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
                  {sections.map(s => <option key={s} value={s}>{s}</option>)}
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

          {filtered.length === 0 && <EmptyState title="No students match filters" />}

          {/* Grouped by year — mobile card layout */}
          {[1,2,3,4].map(y => grouped[y]?.length > 0 && (
            <div key={y} className="card mb-4">
              <div className="border-b border-line px-4 py-3 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-ink">Year {y}</h3>
                <span className="text-xs text-muted">{grouped[y].length} students</span>
              </div>

              {/* Desktop table — hidden on small screens */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-4 py-3 text-left font-medium text-muted">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-muted">Roll No.</th>
                      <th className="px-4 py-3 text-left font-medium text-muted">Section</th>
                      <th className="px-4 py-3 text-left font-medium text-muted">Phone</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {grouped[y].map(s => (
                      <tr key={s._id} className="hover:bg-paper/60">
                        <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                        <td className="px-4 py-3 text-muted">{s.rollNumber}</td>
                        <td className="px-4 py-3 text-muted">{s.section || "—"}</td>
                        <td className="px-4 py-3 text-muted">{s.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <Link to={"/mentor/messages/" + s._id} className="text-xs text-mentor hover:underline">Message</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card layout — shown only on small screens */}
              <div className="sm:hidden divide-y divide-line">
                {grouped[y].map(s => (
                  <div key={s._id} className="px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">{s.name}</p>
                        <p className="text-xs text-muted mt-0.5">{s.rollNumber}</p>
                      </div>
                      <Link to={"/mentor/messages/" + s._id} className="text-xs text-mentor hover:underline flex-shrink-0 ml-2">Message</Link>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {s.section && <span className="text-xs bg-paper border border-line rounded px-2 py-0.5">{s.section}</span>}
                      {s.phone && <span className="text-xs text-muted">{s.phone}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </DashboardShell>
  );
}