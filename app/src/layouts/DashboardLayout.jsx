
import { useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = role === "admin" ? ADMIN_LINKS : RECEPTIONIST_LINKS;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dash-shell">
      {/* Mobile header */}
      <header className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="mobile-header__brand">
          <span className="dash-sidebar__logo">CC</span>
          <span>CareCross Hospital</span>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "is-visible" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="dash-sidebar__brand">
          <span className="dash-sidebar__logo">CC</span>

          <div>
            <p className="dash-sidebar__title">CareCross Hospital</p>
            <p className="dash-sidebar__subtitle">
              {role === "admin" ? "Administrator" : "Receptionist"}
            </p>
          </div>

          {/* Mobile close button */}
          <button
            className="mobile-close-btn"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="dash-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                "dash-nav__link" + (isActive ? " is-active" : "")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-sidebar__footer">
          <p className="dash-sidebar__user">
            {profile?.fullName || "User"}
          </p>

          <button
            className="btn btn--ghost btn--sm"
            onClick={handleLogout}
          >
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

