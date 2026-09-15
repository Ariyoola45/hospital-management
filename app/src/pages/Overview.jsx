import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { listWards } from "../firebase/wards";
import { listAdmissionsByStatus } from "../firebase/admissions";
import { useAuth } from "../context/AuthContext";

export default function Overview() {
  const { profile, role } = useAuth();
  const [wards, setWards] = useState([]);
  const [pendingAdmissions, setPendingAdmissions] = useState([]);
  const [currentlyAdmitted, setCurrentlyAdmitted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [w, booked, admitted] = await Promise.all([
          listWards(),
          listAdmissionsByStatus("booked"),
          listAdmissionsByStatus("admitted"),
        ]);
        setWards(w);
        setPendingAdmissions(booked);
        setCurrentlyAdmitted(admitted);
      } catch {
        toast.error("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const available = wards.filter((r) => r.status === "available").length;
  const occupied = wards.filter((r) => r.status === "occupied").length;
  const housekeeping = wards.filter((r) => r.status === "housekeeping").length;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${profile?.fullName || "there"}`}
        subtitle={role === "admin" ? "Here's what's happening across the hospital today" : "Here's today's front-desk snapshot"}
      />

      <div className="stat-grid">
        <StatCard label="Available Wards/Beds" value={loading ? "…" : available} icon="🟢" tone="green" />
        <StatCard label="Occupied Wards/Beds" value={loading ? "…" : occupied} icon="🔴" tone="amber" />
        <StatCard label="Beds in Sanitation" value={loading ? "…" : housekeeping} icon="🧹" tone="blue" />
        <StatCard label="Patients Admitted" value={loading ? "…" : currentlyAdmitted.length} icon="🏥" tone="default" />
      </div>

      <div className="split-panels">
        <div className="panel">
          <h3>Pending Admissions</h3>
          {loading && <p className="table-empty">Loading…</p>}
          {!loading && pendingAdmissions.length === 0 && <p className="table-empty">No admissions pending.</p>}
          {pendingAdmissions.slice(0, 6).map((a) => (
            <div key={a.id} className="panel-row">
              <span>{a.patientName}</span>
              <span>Bed {a.roomNumber}</span>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>

        <div className="panel">
          <h3>Currently Admitted</h3>
          {loading && <p className="table-empty">Loading…</p>}
          {!loading && currentlyAdmitted.length === 0 && <p className="table-empty">No patients currently admitted.</p>}
          {currentlyAdmitted.slice(0, 6).map((g) => (
            <div key={g.id} className="panel-row">
              <span>{g.patientName}</span>
              <span>Bed {g.roomNumber}</span>
              <StatusBadge status={g.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
