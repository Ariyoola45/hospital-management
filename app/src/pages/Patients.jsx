import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import { createPatient, listPatients, updatePatient, deletePatient } from "../firebase/patients";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  idType: "National ID",
  idNumber: "",
  address: "",
  bloodGroup: "",
  nextOfKin: "",
  allergies: "",
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      setPatients(await listPatients());
    } catch (err) {
      toast.error("Could not load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (patient) => {
    setForm(patient);
    setEditingId(patient.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      toast.error("Full name and phone number are required");
      return;
    }
    try {
      if (editingId) {
        await updatePatient(editingId, form);
        toast.success("Patient record updated");
      } else {
        await createPatient(form);
        toast.success("Patient registered");
      }
      setShowModal(false);
      refresh();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this patient record?")) return;
    try {
      await deletePatient(id);
      toast.success("Patient record removed");
      refresh();
    } catch {
      toast.error("Could not remove patient");
    }
  };

  const filtered = patients.filter((g) =>
    [g.fullName, g.email, g.phone].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle="Register new patients and manage existing patient records"
        action={
          <button className="btn btn--primary" onClick={openNew}>
            + Register Patient
          </button>
        }
      />

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Blood Group</th>
              <th>Next of Kin</th>
              <th>Allergies</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="table-empty">Loading patients…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="table-empty">No patients found.</td></tr>
            )}
            {filtered.map((g) => (
              <tr key={g.id}>
                <td>{g.fullName}</td>
                <td>{g.phone}</td>
                <td>{g.email}</td>
                <td>{g.bloodGroup || "—"}</td>
                <td>{g.nextOfKin || "—"}</td>
                <td>{g.allergies || "None recorded"}</td>
                <td className="table-actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => openEdit(g)}>Edit</button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(g.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingId ? "Edit Patient" : "Register Patient"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Full Name *
              <input className="input" name="fullName" value={form.fullName} onChange={handleChange} />
            </label>
            <label>
              Phone *
              <input className="input" name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <label>
              Email
              <input className="input" type="email" name="email" value={form.email} onChange={handleChange} />
            </label>
            <label>
              Blood Group
              <select className="input" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                <option value="">Unknown</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => <option key={bg}>{bg}</option>)}
              </select>
            </label>
            <label>
              ID Type
              <select className="input" name="idType" value={form.idType} onChange={handleChange}>
                <option>National ID</option>
                <option>Passport</option>
                <option>Driver's License</option>
                <option>Voter's Card</option>
              </select>
            </label>
            <label>
              ID Number
              <input className="input" name="idNumber" value={form.idNumber} onChange={handleChange} />
            </label>
            <label>
              Next of Kin (name & phone)
              <input className="input" name="nextOfKin" value={form.nextOfKin} onChange={handleChange} />
            </label>
            <label>
              Known Allergies
              <input className="input" name="allergies" value={form.allergies} onChange={handleChange} placeholder="e.g. Penicillin" />
            </label>
            <label className="form-grid__full">
              Address
              <textarea className="input" name="address" rows={2} value={form.address} onChange={handleChange} />
            </label>
            <div className="form-grid__full modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">{editingId ? "Save Changes" : "Register Patient"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
