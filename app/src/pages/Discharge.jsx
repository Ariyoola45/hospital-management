import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import { listAdmissionsByStatus, dischargePatient } from "../firebase/admissions";
import { recordPayment } from "../firebase/payments";

function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function Discharge() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billModal, setBillModal] = useState(null); // admission being billed
  const [method, setMethod] = useState("cash");

  const refresh = async () => {
    setLoading(true);
    try {
      setAdmissions(await listAdmissionsByStatus("admitted"));
    } catch {
      toast.error("Could not load admitted patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openBill = (r) => {
    setMethod("cash");
    setBillModal(r);
  };

  const total = billModal ? daysBetween(billModal.admissionDate, billModal.expectedDischargeDate) * Number(billModal.rate || 0) : 0;

  const handleConfirmDischarge = async () => {
    try {
      await recordPayment({
        admissionId: billModal.id,
        patientName: billModal.patientName,
        amount: total,
        method,
        status: "paid",
        notes: `Discharge bill for Bed ${billModal.roomNumber}`,
      });
      await dischargePatient(billModal.id, billModal.wardId);
      toast.success(`${billModal.patientName} discharged. Ward sent for sanitation.`);
      setBillModal(null);
      refresh();
    } catch {
      toast.error("Discharge failed");
    }
  };

  return (
    <div>
      <PageHeader title="Discharge Patient" subtitle="Currently admitted patients ready for discharge" />

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
              <tr><td colSpan={5} className="table-empty">No admitted patients right now.</td></tr>
            )}
            {admissions.map((r) => (
              <tr key={r.id}>
                <td>{r.patientName}</td>
                <td>Bed {r.roomNumber}</td>
                <td>{r.admissionDate}</td>
                <td>{r.expectedDischargeDate}</td>
                <td className="table-actions">
                  <button className="btn btn--primary btn--sm" onClick={() => openBill(r)}>Discharge & Bill</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {billModal && (
        <Modal title={`Bill — ${billModal.patientName}`} onClose={() => setBillModal(null)}>
          <div className="bill-summary">
            <div className="bill-row"><span>Ward/Bed</span><span>{billModal.roomNumber}</span></div>
            <div className="bill-row"><span>Admission Date</span><span>{billModal.admissionDate}</span></div>
            <div className="bill-row"><span>Discharge Date</span><span>{billModal.expectedDischargeDate}</span></div>
            <div className="bill-row"><span>Days Admitted</span><span>{daysBetween(billModal.admissionDate, billModal.expectedDischargeDate)}</span></div>
            <div className="bill-row"><span>Rate / day</span><span>₦{Number(billModal.rate).toLocaleString()}</span></div>
            <div className="bill-row bill-row--total"><span>Total Due</span><span>₦{total.toLocaleString()}</span></div>

            <label>
              Payment Method
              <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="insurance">Health Insurance (HMO)</option>
              </select>
            </label>

            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setBillModal(null)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleConfirmDischarge}>Confirm Payment & Discharge</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
