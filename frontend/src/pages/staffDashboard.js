import { apiRequest, getUser } from "../api.js";

export async function renderStaffDashboard(container) {
  const user = getUser();

  container.innerHTML = `
    <div class="container">
      <h2>Welcome, ${user.full_name || user.employee_id}</h2>
      <p class="subtitle">Employee ID: ${user.employee_id}</p>

      <div class="card">
        <h3>My Application Status</h3>
        <div id="application-status">
          <p class="loading">Loading your application...</p>
        </div>
      </div>
    </div>
  `;

  // Fetch application status
  try {
    const applications = await apiRequest("/applications");

    const statusContainer = container.querySelector("#application-status");

    if (applications.length === 0) {
      statusContainer.innerHTML = `
        <div class="empty-state">
          <p>You have not applied for any housing yet.</p>
          <a href="#/staff/housing" class="btn btn-primary">Browse Available Housing</a>
        </div>
      `;
    } else {
      const app = applications[0];
      const house = app.housing;
      const statusClass = getStatusClass(app.application_status);

      statusContainer.innerHTML = `
        <div class="application-detail">
          <div class="status-badge ${statusClass}">
            ${formatStatus(app.application_status)}
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Location</span>
              <span class="detail-value">${house.town_location}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Block</span>
              <span class="detail-value">${house.block_name}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Floor</span>
              <span class="detail-value">${house.floor_number}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">House Type</span>
              <span class="detail-value">${house.house_type.house_type_name}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Monthly Rent</span>
              <span class="detail-value">KES ${Number(house.monthly_rent).toLocaleString()}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Duration</span>
              <span class="detail-value">${house.payment_duration_months} months</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Applied On</span>
              <span class="detail-value">${new Date(app.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `;
    }
  } catch (err) {
    container.querySelector("#application-status").innerHTML = `
      <p class="error-message">${err.message}</p>
    `;
  }
}

function getStatusClass(status) {
  switch (status) {
    case "pending": return "status-pending";
    case "approved": return "status-approved";
    case "rejected": return "status-rejected";
    default: return "";
  }
}

function formatStatus(status) {
  switch (status) {
    case "pending": return "Booked - Pending Approval";
    case "approved": return "Approved";
    case "rejected": return "Rejected";
    default: return status;
  }
}
