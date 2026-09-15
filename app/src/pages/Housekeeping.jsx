import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { listTasks, createTask, updateTaskStatus } from "../firebase/housekeeping";
import { listWards } from "../firebase/wards";

const EMPTY_FORM = { wardId: "", assignedTo: "", notes: "" };

export default function Housekeeping() {
  const [tasks, setTasks] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const refresh = async () => {
    setLoading(true);
    try {
      const [t, r] = await Promise.all([listTasks(), listWards()]);
      setTasks(t);
      setWards(r);
    } catch {
      toast.error("Could not load housekeeping tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.wardId || !form.assignedTo) {
      toast.error("Please select a ward/bed and assign a staff member");
      return;
    }
    const ward = wards.find((r) => r.id === form.wardId);
    try {
      await createTask({ ...form, roomNumber: ward?.roomNumber });
      toast.success("Task created");
      setShowModal(false);
      setForm(EMPTY_FORM);
      refresh();
    } catch {
      toast.error("Could not create task");
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      await updateTaskStatus(task.id, status, task.wardId);
      toast.success(status === "completed" ? "Task completed — ward marked available" : "Status updated");
      refresh();
    } catch {
      toast.error("Could not update task");
    }
  };

  return (
    <div>
      <PageHeader
        title="Housekeeping"
        subtitle="Assign and track ward/bed cleaning tasks"
        action={<button className="btn btn--primary" onClick={() => setShowModal(true)}>+ New Task</button>}
      />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ward/Bed</th>
              <th>Assigned To</th>
              <th>Notes</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="table-empty">Loading…</td></tr>}
            {!loading && tasks.length === 0 && (
              <tr><td colSpan={5} className="table-empty">No housekeeping tasks yet.</td></tr>
            )}
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>Bed {t.roomNumber}</td>
                <td>{t.assignedTo}</td>
                <td>{t.notes}</td>
                <td><StatusBadge status={t.status} /></td>
                <td className="table-actions">
                  {t.status !== "completed" && (
                    <>
                      {t.status === "pending" && (
                        <button className="btn btn--ghost btn--sm" onClick={() => handleStatusChange(t, "in-progress")}>Start</button>
                      )}
                      <button className="btn btn--primary btn--sm" onClick={() => handleStatusChange(t, "completed")}>Mark Done</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="New Housekeeping Task" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <label className="form-grid__full">
              Ward/Bed *
              <select className="input" name="wardId" value={form.wardId} onChange={handleChange}>
                <option value="">Select ward/bed…</option>
                {wards.map((r) => <option key={r.id} value={r.id}>Bed {r.roomNumber} ({r.status})</option>)}
              </select>
            </label>
            <label className="form-grid__full">
              Assign To *
              <input className="input" name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Staff name" />
            </label>
            <label className="form-grid__full">
              Notes
              <textarea className="input" name="notes" rows={2} value={form.notes} onChange={handleChange} />
            </label>
            <div className="form-grid__full modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Create Task</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
