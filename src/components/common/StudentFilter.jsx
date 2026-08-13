import { useState, useEffect } from 'react';

const YEAR_OPTIONS = [
  { value: '', label: 'All years' },
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
  { value: '4', label: 'Year 4' },
];

/**
 * Reusable filter bar for student lists.
 * Extracts unique departments and sections from the provided students array
 * so no extra API call is needed.
 *
 * Props:
 *   students  — full unfiltered list
 *   onChange  — called with filtered list whenever filters change
 *   showYear  — show year filter (default true)
 *   showDept  — show department filter (default true)
 *   showSection — show section filter (default true)
 */
export default function StudentFilter({
  students = [],
  onChange,
  showYear = true,
  showDept = true,
  showSection = true,
}) {
  const [year, setYear] = useState('');
  const [dept, setDept] = useState('');
  const [section, setSection] = useState('');
  const [search, setSearch] = useState('');

  // Derive unique department and section values from the student list
  const departments = ['', ...new Set(students.map((s) => s.department).filter(Boolean))];
  const sections = ['', ...new Set(students.map((s) => s.section).filter(Boolean))];

  useEffect(() => {
    let filtered = [...students];

    if (year) filtered = filtered.filter((s) => String(s.year) === year);
    if (dept) filtered = filtered.filter((s) => s.department === dept);
    if (section) filtered = filtered.filter((s) => s.section === section);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.rollNumber?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      );
    }

    onChange(filtered);
  }, [year, dept, section, search, students]);

  const hasFilters = year || dept || section || search;

  const clearFilters = () => {
    setYear('');
    setDept('');
    setSection('');
    setSearch('');
  };

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      {/* Search */}
      <div className="flex-1 min-w-[180px]">
        <label className="field-label">Search</label>
        <input
          className="field-input"
          placeholder="Name, roll number, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Year */}
      {showYear && (
        <div className="w-36">
          <label className="field-label">Year</label>
          <select
            className="field-input"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {YEAR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Department */}
      {showDept && departments.length > 1 && (
        <div className="w-44">
          <label className="field-label">Department</label>
          <select
            className="field-input"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="">All departments</option>
            {departments.filter(Boolean).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Section */}
      {showSection && sections.length > 1 && (
        <div className="w-36">
          <label className="field-label">Section</label>
          <select
            className="field-input"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="">All sections</option>
            {sections.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear */}
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-medium text-muted hover:text-warn underline self-end pb-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
