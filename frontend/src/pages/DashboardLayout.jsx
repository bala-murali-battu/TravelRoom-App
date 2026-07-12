import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="app-container">
      {/* Centralized Web Navigation Header Block */}
      <header className="main-header">
        <div className="logo-section">
          <h1>TravelRoom</h1>
        </div>
        <nav className="nav-links">
          <Link to="/timeline" className={location.pathname === "/timeline" ? "active" : ""}>
            Itinerary Timeline
          </Link>
          <Link to="/add" className={location.pathname === "/add" ? "active" : ""}>
            Log Logistics
          </Link>
        </nav>
      </header>

      {/* Dynamic Sub-page Child Inject Canvas Frame */}
      <main className="content-viewport">
        <Outlet />
      </main>
    </div>
  );
}
