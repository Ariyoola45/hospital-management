import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import { listAdmissionsByStatus, admitPatient } from "../firebase/admissions";

export default function Admit() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setAdmissions(await listAdmissionsByStatus("booked"));
    } catch {
      toast.error("Could not load pending admissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleAdmit = async (r) => {
    try {
      await admitPatient(r.id, r.wardId);
      toast.success(`${r.patientName} admitted to Bed ${r.roomNumber}`);
      refresh();
    } catch {
      toast.error("Admission failed");
    }
  };

  return (
    <div>
      <PageHeader title="Admit Patient" subtitle="Patients with a booked admission awaiting arrival" />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Ward/Bed</th>
              <th>Admission Date</th>
              <th>Expected Discharge</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="table-empty">Loading…</td></tr>}
            {!loading && admissions.length === 0 && (
              <tr><td colSpan={5} className="table-empty">No patients awaiting admission.</td></tr>
            )}
            {admissions.map((r) => (
              <tr key={r.id}>
                <td>{r.patientName}</td>
                <td>Bed {r.roomNumber}</td>
                <td>{r.admissionDate}</td>
                <td>{r.expectedDischargeDate}</td>
                <td className="table-actions">
                  <button className="btn btn--primary btn--sm" onClick={() => handleAdmit(r)}>Admit Patient</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
