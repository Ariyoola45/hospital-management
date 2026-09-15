import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { listPatients } from "../firebase/patients";
import { listAvailableWards } from "../firebase/wards";
import { createAdmission, listAdmissions, cancelAdmission } from "../firebase/admissions";

const EMPTY_FORM = { patientId: "", wardId: "", admissionDate: "", expectedDischargeDate: "", notes: "" };

export default function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const refresh = async () => {
    setLoading(true);
    try {
      const [adm, p] = await Promise.all([listAdmissions(), listPatients()]);
      setAdmissions(adm);
      setPatients(p);
    } catch {
      toast.error("Could not load admissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openNew = async () => {
    setForm(EMPTY_FORM);
    try {
      setAvailableWards(await listAvailableWards());
    } catch {
      toast.error("Could not load available wards");
    }
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.wardId || !form.admissionDate || !form.expectedDischargeDate) {
      toast.error("Please fill in patient, ward and dates");
      return;
    }
    if (new Date(form.expectedDischargeDate) <= new Date(form.admissionDate)) {
      toast.error("Expected discharge date must be after admission date");
      return;
    }
    const patient = patients.find((g) => g.id === form.patientId);
    const ward = availableWards.find((r) => r.id === form.wardId);
    try {
      await createAdmission({
        patientId: form.patientId,
        patientName: patient?.fullName,
        wardId: form.wardId,
        roomNumber: ward?.roomNumber,
        rate: ward?.rate,
        admissionDate: form.admissionDate,
        expectedDischargeDate: form.expectedDischargeDate,
        notes: form.notes,
      });
      toast.success("Admission booked — ward marked as reserved");
      setShowModal(false);
      refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleCancel = async (r) => {
    if (!confirm(`Cancel admission for ${r.patientName}?`)) return;
    try {
      await cancelAdmission(r.id, r.wardId);
      toast.success("Admission cancelled — ward released");
      refresh();
    } catch {
      toast.error("Could not cancel admission");
    }
  };

  return (
    <div>
      <PageHeader
        title="Admissions"
        subtitle="Book new patient admissions and manage upcoming stays"
        action={<button className="btn btn--primary" onClick={openNew}>+ New Admission</button>}
      />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Ward/Bed</th>
              <th>Admission Date</th>
              <th>Expected Discharge</th>
              <th>Daily Rate</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="table-empty">Loading…</td></tr>}
            {!loading && admissions.length === 0 && (
              <tr><td colSpan={7} className="table-empty">No admissions yet.</td></tr>
            )}
            {admissions.map((r) => (
              <tr key={r.id}>
                <td>{r.patientName}</td>
                <td>Bed {r.roomNumber}</td>
                <td>{r.admissionDate}</td>
                <td>{r.expectedDischargeDate}</td>
                <td>₦{Number(r.rate || 0).toLocaleString()}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="table-actions">
                  {r.status === "booked" && (
                    <button className="btn btn--danger btn--sm" onClick={() => handleCancel(r)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="New Admission" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <label className="form-grid__full">
              Patient *
              <select className="input" name="patientId" value={form.patientId} onChange={handleChange}>
                <option value="">Select patient…</option>
                {patients.map((g) => <option key={g.id} value={g.id}>{g.fullName} — {g.phone}</option>)}
              </select>
            </label>
            <label className="form-grid__full">
              Ward/Bed (available only) *
              <select className="input" name="wardId" value={form.wardId} onChange={handleChange}>
                <option value="">Select ward/bed…</option>
                {availableWards.map((r) => (
                  <option key={r.id} value={r.id}>
                    Bed {r.roomNumber} — {r.type} — ₦{Number(r.rate).toLocaleString()}/day
                  </option>
                ))}
              </select>
            </label>
            <label>
              Admission Date *
              <input className="input" type="date" name="admissionDate" value={form.admissionDate} onChange={handleChange} />
            </label>
            <label>
              Expected Discharge Date *
              <input className="input" type="date" name="expectedDischargeDate" value={form.expectedDischargeDate} onChange={handleChange} />
            </label>
            <label className="form-grid__full">
              Notes / Reason for Admission
              <textarea className="input" name="notes" rows={2} value={form.notes} onChange={handleChange} />
            </label>
            <div className="form-grid__full modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Book Admission</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
