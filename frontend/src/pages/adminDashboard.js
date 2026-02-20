import { apiRequest } from "../api.js";

export async function renderAdminDashboard(container) {
  container.innerHTML = `
    <div class="container">
      <h2>Admin Dashboard</h2>
      <p class="subtitle">Real-Time Occupancy Tracking</p>

      <div id="stats-grid" class="stats-grid">
        <p class="loading">Loading dashboard stats...</p>
      </div>
    </div>
  `;

  try {
    const stats = await apiRequest("/dashboard/stats");

    container.querySelector("#stats-grid").innerHTML = `
      <div class="stat-card stat-total">
        <div class="stat-number">${stats.total}</div>
        <div class="stat-label">Total Houses</div>
      </div>
      <div class="stat-card stat-vacant">
        <div class="stat-number">${stats.vacant}</div>
        <div class="stat-label">Vacant</div>
      </div>
      <div class="stat-card stat-pending">
        <div class="stat-number">${stats.booked_pending}</div>
        <div class="stat-label">Booked (Pending)</div>
      </div>
      <div class="stat-card stat-occupied">
        <div class="stat-number">${stats.occupied}</div>
        <div class="stat-label">Occupied</div>
      </div>
      <div class="stat-card stat-applications">
        <div class="stat-number">${stats.pendingApplications}</div>
        <div class="stat-label">Pending Applications</div>
      </div>
      <div class="stat-card stat-employees">
        <div class="stat-number">${stats.totalEmployees}</div>
        <div class="stat-label">Registered Employees</div>
      </div>
    `;
  } catch (err) {
    container.querySelector("#stats-grid").innerHTML = `
      <p class="error-message">${err.message}</p>
    `;
  }
}
