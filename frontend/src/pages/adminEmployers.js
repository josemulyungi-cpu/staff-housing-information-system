import { apiRequest } from "../api.js";

export async function renderAdminEmployers(container) {
  container.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h2>Employer Management</h2>
        <button id="add-employer-btn" class="btn btn-primary">+ Add Employer</button>
      </div>

      <div id="employers-table-wrapper">
        <p class="loading">Loading employers...</p>
      </div>

      <!-- Modal for Add Employer -->
      <div id="employer-modal" class="modal hidden">
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h3>Add New Employer</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="employer-form">
            <div class="form-group">
              <label for="emp-code">Employer Code</label>
              <input type="text" id="emp-code" placeholder="e.g. KPS-002" required />
            </div>
            <div class="form-group">
              <label for="emp-name">Employer Name</label>
              <input type="text" id="emp-name" placeholder="e.g. Kenya Police Service" required />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Employer</button>
            </div>
            <div id="employer-form-error" class="error-message"></div>
          </form>
        </div>
      </div>
    </div>
  `;

  const modal = container.querySelector("#employer-modal");

  container.querySelector("#add-employer-btn").addEventListener("click", () => {
    container.querySelector("#employer-form").reset();
    container.querySelector("#employer-form-error").textContent = "";
    modal.classList.remove("hidden");
  });

  container.querySelector(".modal-close").addEventListener("click", () => modal.classList.add("hidden"));
  container.querySelector(".modal-cancel").addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

  // Form submit
  container.querySelector("#employer-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector("#employer-form-error");
    errorEl.textContent = "";

    try {
      await apiRequest("/employers", {
        method: "POST",
        body: JSON.stringify({
          employer_id: container.querySelector("#emp-code").value,
          employer_name: container.querySelector("#emp-name").value,
        }),
      });
      modal.classList.add("hidden");
      loadEmployers();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

  await loadEmployers();

  async function loadEmployers() {
    const wrapper = container.querySelector("#employers-table-wrapper");
    wrapper.innerHTML = '<p class="loading">Loading...</p>';

    try {
      const employers = await apiRequest("/employers");

      if (employers.length === 0) {
        wrapper.innerHTML = '<p class="empty-state">No employers added yet.</p>';
        return;
      }

      wrapper.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employer Code</th>
              <th>Employer Name</th>
              <th>Authorization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${employers.map((emp) => `
              <tr>
                <td>${emp.id}</td>
                <td>${emp.employer_id}</td>
                <td>${emp.employer_name}</td>
                <td>
                  <span class="status-badge ${emp.authorized ? "status-approved" : "status-rejected"}">
                    ${emp.authorized ? "Authorized" : "Not Authorized"}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm ${emp.authorized ? "btn-danger" : "btn-success"} auth-btn" data-id="${emp.id}">
                    ${emp.authorized ? "Revoke" : "Authorize"}
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;

      // Auth toggle handlers
      wrapper.querySelectorAll(".auth-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          try {
            await apiRequest(`/employers/${btn.dataset.id}/authorize`, { method: "PUT" });
            loadEmployers();
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
