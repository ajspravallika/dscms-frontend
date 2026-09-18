import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import StudentFilter from "../../components/common/StudentFilter";
import Loader from "../../components/common/Loader";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import { useFetch } from "../../hooks/useFetch";
import * as mentorApi from "../../api/mentor.api";
export default function MyStudents() {
  const { data:students,isLoading,error }=useFetch(mentorApi.listMyStudents,r=>r.data.data.students,[]);
  const [filtered,setFiltered]=useState([]);
  const grouped=useMemo(()=>{const g={1:[],2:[],3:[],4:[],other:[]};filtered.forEach(s=>{const k=s.year&&g[s.year]!==undefined?s.year:"other";g[k].push(s);});return g;},[filtered]);
  return(<DashboardShell pageTitle="My Students"><PageHeader title="Assigned Students" />{isLoading&&<Loader />}{error&&<ErrorBanner message={error} />}{students&&(<><div className="mb-4"><StudentFilter students={students} onChange={setFiltered} /></div>{filtered.length===0&&<EmptyState title="No students match filters" />}{[1,2,3,4].map(y=>grouped[y]?.length>0&&(<div key={y} className="card mb-4"><div className="border-b border-line px-5 py-3 flex justify-between"><h3 className="text-sm font-semibold text-ink">Year {y}</h3><span className="text-xs text-muted">{grouped[y].length} students</span></div><table className="w-full text-sm"><thead><tr className="border-b border-line"><th className="px-5 py-3 text-left font-medium text-muted">Name</th><th className="px-5 py-3 text-left font-medium text-muted">Roll No.</th><th className="px-5 py-3 text-left font-medium text-muted">Section</th><th className="px-5 py-3 text-left font-medium text-muted">Phone</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-line">{grouped[y].map(s=>(<tr key={s._id} className="hover:bg-paper/60"><td className="px-5 py-3 font-medium">{s.name}</td><td className="px-5 py-3 text-muted">{s.rollNumber}</td><td className="px-5 py-3 text-muted">{s.section||"—"}</td><td className="px-5 py-3 text-muted">{s.phone||"—"}</td><td className="px-5 py-3"><Link to={"/mentor/messages/"+s._id} className="text-xs text-mentor hover:underline">Message</Link></td></tr>))}</tbody></table></div>))}</>)}</DashboardShell>);
}