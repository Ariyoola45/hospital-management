import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ADMIN_LINKS = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/patients", label: "Patients" },
  { to: "/admin/wards", label: "Wards & Beds" },
  { to: "/admin/admissions", label: "Admissions" },
  { to: "/admin/payments", label: "Billing" },
  { to: "/admin/housekeeping", label: "Housekeeping" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/staff", label: "Staff" },
];

const RECEPTIONIST_LINKS = [
  { to: "/receptionist", label: "Overview", end: true },
  { to: "/receptionist/patients", label: "Patients" },
  { to: "/receptionist/wards", label: "Wards & Beds" },
  { to: "/receptionist/admissions", label: "Admissions" },
  { to: "/receptionist/admit", label: "Admit Patient" },
  { to: "/receptionist/discharge", label: "Discharge Patient" },
  { to: "/receptionist/payments", label: "Billing" },
  { to: "/receptionist/housekeeping", label: "Housekeeping" },
];

export default function DashboardLayout() {
  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === "admin" ? ADMIN_LINKS : RECEPTIONIST_LINKS;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar__brand">
          <span className="dash-sidebar__logo">CC</span>
          <div>
            <p className="dash-sidebar__title">CareCross Hospital</p>
            <p className="dash-sidebar__subtitle">{role === "admin" ? "Administrator" : "Receptionist"}</p>
          </div>
        </div>

        <nav className="dash-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => "dash-nav__link" + (isActive ? " is-active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-sidebar__footer">
          <p className="dash-sidebar__user">{profile?.fullName || "User"}</p>
          <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  );
}
