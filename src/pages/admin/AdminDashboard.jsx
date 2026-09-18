import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardShell from "../../components/layout/DashboardShell";
import PageHeader from "../../components/layout/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorBanner from "../../components/common/ErrorBanner";

import * as adminApi from "../../api/admin.api";


function StatCard({
  label,
  value,
  to,
  accent = "text-accent",
}) {
  const card = (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>

      <p
        className={
          "mt-2 font-serif text-3xl font-semibold " + accent
        }
      >
        {value}
      </p>
    </div>
  );

  return to ? (
    <Link
      to={to}
      className="block transition-opacity hover:opacity-80"
    >
      {card}
    </Link>
  ) : (
    card
  );
}


export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [mr, sr, ar, sesr] = await Promise.all([
          adminApi.listMentors(),
          adminApi.listStudents(),
          adminApi.listAssignments(),
          adminApi.getAllSessions(),
        ]);

        if (!mounted) return;

        const mentors = mr.data.data.mentors;
        const students = sr.data.data.students;
        const assignments = ar.data.data.assignments;
        const allSessions = sesr.data.data.sessions;


        const yearCounts = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
        };


        students
          .filter(
            (student) =>
              !student.isPassout && student.isActive
          )
          .forEach((student) => {
            if (student.year) {
              yearCounts[student.year] =
                (yearCounts[student.year] || 0) + 1;
            }
          });


        setStats({
          activeMentors: mentors.filter(
            (mentor) => mentor.isActive
          ).length,

          activeStudents: students.filter(
            (student) =>
              !student.isPassout && student.isActive
          ).length,

          unassigned: students.filter(
            (student) =>
              !student.isPassout &&
              student.isActive &&
              !student.mentorId
          ).length,

          assignments: assignments.length,

          sessions: allSessions.length,

          yearCounts,
        });


        setSessions(allSessions.slice(0, 8));

      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Failed to load dashboard."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }


    load();


    return () => {
      mounted = false;
    };
  }, []);


  return (
    <DashboardShell pageTitle="Dashboard">

      <PageHeader title="Overview" />


      {isLoading && <Loader />}


      {error && <ErrorBanner message={error} />}


      {stats && (
        <>

          {/* Statistics */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

            <StatCard
              label="Active Mentors"
              value={stats.activeMentors}
              to="/admin/mentors"
            />

            <StatCard
              label="Active Students"
              value={stats.activeStudents}
              to="/admin/students"
            />

            <StatCard
              label="Unassigned"
              value={stats.unassigned}
              to="/admin/students"
              accent="text-warn"
            />

            <StatCard
              label="Assignments"
              value={stats.assignments}
              to="/admin/assignments"
            />

            <StatCard
              label="Sessions"
              value={stats.sessions}
            />

          </div>


          {/* Students by year */}
          <div className="mb-6 card p-5">

            <h2 className="mb-4 font-serif text-xl font-semibold text-ink">
              Students by Year
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

              <div className="rounded-md bg-paper p-4">
                <p className="text-xs uppercase text-muted">
                  1st Year
                </p>

                <p className="mt-2 text-2xl font-semibold text-accent">
                  {stats.yearCounts[1]}
                </p>
              </div>


              <div className="rounded-md bg-paper p-4">
                <p className="text-xs uppercase text-muted">
                  2nd Year
                </p>

                <p className="mt-2 text-2xl font-semibold text-accent">
                  {stats.yearCounts[2]}
                </p>
              </div>


              <div className="rounded-md bg-paper p-4">
                <p className="text-xs uppercase text-muted">
                  3rd Year
                </p>

                <p className="mt-2 text-2xl font-semibold text-accent">
                  {stats.yearCounts[3]}
                </p>
              </div>


              <div className="rounded-md bg-paper p-4">
                <p className="text-xs uppercase text-muted">
                  4th Year
                </p>

                <p className="mt-2 text-2xl font-semibold text-accent">
                  {stats.yearCounts[4]}
                </p>
              </div>

            </div>

          </div>


          {/* Recent sessions */}
          <div className="card p-5">

            <h2 className="mb-4 font-serif text-xl font-semibold text-ink">
              Recent Sessions
            </h2>


            {sessions.length === 0 ? (

              <p className="text-sm text-muted">
                No sessions found.
              </p>

            ) : (

              <div className="space-y-3">

                {sessions.map((session) => (

                  <div
                    key={session._id}
                    className="rounded-md border border-line bg-paper p-4"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="font-medium text-ink">
                          {session.student?.name ||
                            session.studentName ||
                            "Student"}
                        </p>

                        <p className="text-sm text-muted">
                          {session.mentor?.name ||
                            session.mentorName ||
                            "Mentor"}
                        </p>

                      </div>


                      <StatusText
                        status={
                          session.status ||
                          "unknown"
                        }
                      />

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </>
      )}

    </DashboardShell>
  );
}


function StatusText({ status }) {
  const formatted =
    String(status)
      .charAt(0)
      .toUpperCase() +
    String(status).slice(1);

  return (
    <span className="text-xs font-medium text-muted">
      {formatted}
    </span>
  );
}