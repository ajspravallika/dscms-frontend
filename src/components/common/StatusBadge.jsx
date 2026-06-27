const STYLES = {
  // Account status
  active: 'bg-accent-soft text-accent-dark',
  inactive: 'bg-warn-soft text-warn',
  // Attendance
  present: 'bg-accent-soft text-accent-dark',
  absent: 'bg-warn-soft text-warn',
  excused: 'bg-paper text-muted border border-line',
  // Concern status
  open: 'bg-warn-soft text-warn',
  'in-progress': 'bg-mentor-soft text-mentor',
  resolved: 'bg-accent-soft text-accent-dark',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-paper text-muted border border-line';
  return <span className={`badge ${style}`}>{status}</span>;
}
