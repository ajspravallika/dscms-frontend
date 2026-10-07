import { NavLink } from "react-router-dom";
import { NAV_CONFIG, ROLE_THEME } from "../../utils/navConfig";
export default function Sidebar({ role, isOpen, onClose }) {
  const items = NAV_CONFIG[role] || [];
  const theme = ROLE_THEME[role] || { bar: "bg-accent", soft: "bg-accent-soft", text: "text-accent-dark", label: "User" };
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={onClose} />}
      <aside className={"fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 border-r border-line bg-surface transition-transform lg:static lg:translate-x-0 " + (isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <span className={"h-6 w-1.5 rounded-full flex-shrink-0 " + theme.bar} />
            <div>
              <p className="font-serif text-lg font-semibold tracking-tight text-ink leading-tight">DSCMS</p>
              <p className="text-[9px] text-muted leading-snug">Digital Student Counseling<br />Management System</p>
            </div>
          </div>
          <div className={"mx-4 mt-4 rounded-md px-3 py-2 text-xs font-medium " + theme.soft + " " + theme.text}>{theme.label} workspace</div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {items.map(item => (
                <li key={item.path}>
                  <NavLink to={item.path} onClick={onClose} className={({ isActive }) => "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors " + (isActive ? theme.soft + " " + theme.text : "text-muted hover:bg-paper hover:text-ink")}>
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} /></svg>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-line px-5 py-3"><p className="text-xs text-muted">SVECW · Counseling Cell</p></div>
        </div>
      </aside>
    </>
  );
}