import { apiRequest } from "../api.js";

export async function renderAdminApplications(container) {
  container.innerHTML = `
    <div class="container">
      <h2>Application Management</h2>
      <p class="subtitle">Review and process housing applications</p>

      <div id="applications-table-wrapper">
        <p class="loading">Loading applications...</p>
      </div>
    </div>
  `;

  await loadApplications();

  async function loadApplications() {
    const wrapper = container.querySelector("#applications-table-wrapper");
    wrapper.innerHTML = '<p class="loading">Loading...</p>';

    try {
      const applications = await apiRequest("/applications");

      if (applications.length === 0) {
        wrapper.innerHTML = '<p class="empty-state">No applications yet.</p>';
        return;
      }

      wrapper.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Employer</th>
              <th>Housing</th>
              <th>Rent (KES)</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${applications.map((app) => `
              <tr>
                <td>${app.id}</td>
                <td>${app.employee.full_name}</td>
                <td>${app.employee.employee_id}</td>
                <td>${app.employee.employer.employer_name}</td>
                <td>${app.housing.town_location} - ${app.housing.block_name} (F${app.housing.floor_number}) - ${app.housing.house_type.house_type_name}</td>
                <td>${Number(app.housing.monthly_rent).toLocaleString()}</td>
                <td><span class="status-badge ${getStatusClass(app.application_status)}">${formatStatus(app.application_status)}</span></td>
                <td>${new Date(app.created_at).toLocaleDateString()}</td>
                <td class="actions-cell">
                  ${app.application_status === "pending" ? `
                    <button class="btn btn-sm btn-success approve-btn" data-id="${app.id}">Approve</button>
                    <button class="btn btn-sm btn-danger reject-btn" data-id="${app.id}">Reject</button>
                  ` : `<span class="text-muted">Processed</span>`}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;

      // Approve handlers
      wrapper.querySelectorAll(".approve-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("Approve this application? The house will be marked as occupied.")) return;
          btn.disabled = true;
          try {
            await apiRequest(`/applications/${btn.dataset.id}/approve`, { method: "PUT" });
            loadApplications();
          } catch (err) {
            alert(err.message);
            btn.disabled = false;
          }
        });
      });

      // Reject handlers
      wrapper.querySelectorAll(".reject-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("Reject this application? The house will return to vacant status.")) return;
          btn.disabled = true;
          try {
            await apiRequest(`/applications/${btn.dataset.id}/reject`, { method: "PUT" });
            loadApplications();
          } catch (err) {
            alert(err.message);
            btn.disabled = false;
          }
        });
      });
    } catch (err) {
      wrapper.innerHTML = `<p class="error-message">${err.message}</p>`;
    }
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
    case "pending": return "Pending";
    case "approved": return "Approved";
    case "rejected": return "Rejected";
    default: return status;
  }
}
