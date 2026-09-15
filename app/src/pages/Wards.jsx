import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { createWard, listWards, updateWard, deleteWard, setWardStatus } from "../firebase/wards";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = { roomNumber: "", type: "General", rate: "", floor: "", status: "available" };
const STATUSES = ["available", "occupied", "reserved", "housekeeping", "maintenance"];
const TYPES = ["General", "Private", "ICU", "Maternity", "Pediatric"];

export default function Wards() {
  const { role } = useAuth();
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState("all");

  const refresh = async () => {
    setLoading(true);
    try {
      setWards(await listWards());
    } catch {
      toast.error("Could not load wards");
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

  const openEdit = (ward) => {
    setForm(ward);
    setEditingId(ward.id);
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomNumber || !form.rate) {
      toast.error("Room/bed number and daily rate are required");
      return;
    }
    try {
      if (editingId) {
        await updateWard(editingId, { ...form, rate: Number(form.rate) });
        toast.success("Ward updated");
      } else {
        await createWard(form);
        toast.success("Ward/bed added");
      }
      setShowModal(false);
      refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this ward/bed?")) return;
    try {
      await deleteWard(id);
      toast.success("Ward removed");
      refresh();
    } catch {
      toast.error("Could not remove ward");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await setWardStatus(id, status);
      toast.success("Ward status updated");
      refresh();
    } catch {
      toast.error("Could not update status");
    }
  };

  const filtered = filterStatus === "all" ? wards : wards.filter((r) => r.status === filterStatus);

  return (
    <div>
      <PageHeader
        title="Wards & Beds"
        subtitle="Manage ward/bed inventory, daily rates and live occupancy status"
        action={
          role === "admin" && (
            <button className="btn btn--primary" onClick={openNew}>+ Add Ward/Bed</button>
          )
        }
      />

      <div className="toolbar">
        <select className="input input--auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="room-grid">
        {loading && <p className="table-empty">Loading wards…</p>}
        {!loading && filtered.length === 0 && <p className="table-empty">No wards/beds found.</p>}
        {filtered.map((r) => (
          <div key={r.id} className="room-card">
            <div className="room-card__top">
              <h3>Bed {r.roomNumber}</h3>
              <StatusBadge status={r.status} />
            </div>
            <p className="room-card__type">{r.type} Ward · Floor {r.floor || "—"}</p>
            <p className="room-card__rate">₦{Number(r.rate).toLocaleString()} / day</p>

            <div className="room-card__actions">
              <select
                className="input input--sm"
                value={r.status}
                onChange={(e) => handleStatusChange(r.id, e.target.value)}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {role === "admin" && (
                <>
                  <button className="btn btn--ghost btn--sm" onClick={() => openEdit(r)}>Edit</button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(r.id)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editingId ? "Edit Ward/Bed" : "Add Ward/Bed"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Room/Bed Number *
              <input className="input" name="roomNumber" value={form.roomNumber} onChange={handleChange} />
            </label>
            <label>
              Ward Type
              <select className="input" name="type" value={form.type} onChange={handleChange}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Daily Rate (₦) *
              <input className="input" type="number" name="rate" value={form.rate} onChange={handleChange} />
            </label>
            <label>
              Floor
              <input className="input" name="floor" value={form.floor} onChange={handleChange} />
            </label>
            <div className="form-grid__full modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">{editingId ? "Save Changes" : "Add Ward/Bed"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
