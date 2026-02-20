import { apiRequest } from "../api.js";

export async function renderAdminHousing(container) {
  container.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h2>Housing Management</h2>
        <button id="add-housing-btn" class="btn btn-primary">+ Add Housing Unit</button>
      </div>

      <div id="housing-table-wrapper">
        <p class="loading">Loading housing units...</p>
      </div>

      <!-- Modal for Add/Edit -->
      <div id="housing-modal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modal-title">Add Housing Unit</h3>
            <button class="modal-close">&times;</button>
          </div>
          <form id="housing-form">
            <input type="hidden" id="housing-id" />
            <div class="form-row">
              <div class="form-group">
                <label for="h-county">County</label>
                <input type="text" id="h-county" value="Nairobi" required />
              </div>
              <div class="form-group">
                <label for="h-town">Town Location</label>
                <input type="text" id="h-town" placeholder="e.g. Langata" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="h-block">Block Name</label>
                <input type="text" id="h-block" placeholder="e.g. Block A" required />
              </div>
              <div class="form-group">
                <label for="h-floor">Floor Number</label>
                <input type="number" id="h-floor" min="0" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="h-type">House Type</label>
                <select id="h-type" required>
                  <option value="">-- Select --</option>
                </select>
              </div>
              <div class="form-group">
                <label for="h-rent">Monthly Rent (KES)</label>
                <input type="number" id="h-rent" min="0" required />
              </div>
            </div>
            <div class="form-group">
              <label for="h-duration">Payment Duration (months)</label>
              <input type="number" id="h-duration" min="1" value="12" required />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline modal-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
            <div id="housing-form-error" class="error-message"></div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Load house types for dropdown
  let houseTypes = [];
  try {
    const options = await apiRequest("/housing/filters/options");
    houseTypes = options.houseTypes;
    const typeSelect = container.querySelector("#h-type");
    houseTypes.forEach((ht) => {
      const opt = document.createElement("option");
      opt.value = ht.id;
      opt.textContent = ht.house_type_name;
      typeSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to load house types:", err);
  }

  const modal = container.querySelector("#housing-modal");

  function openModal(title = "Add Housing Unit", data = null) {
    container.querySelector("#modal-title").textContent = title;
    container.querySelector("#housing-form-error").textContent = "";

    if (data) {
      container.querySelector("#housing-id").value = data.id;
      container.querySelector("#h-county").value = data.county;
      container.querySelector("#h-town").value = data.town_location;
      container.querySelector("#h-block").value = data.block_name;
      container.querySelector("#h-floor").value = data.floor_number;
      container.querySelector("#h-type").value = data.house_type_id;
      container.querySelector("#h-rent").value = data.monthly_rent;
      container.querySelector("#h-duration").value = data.payment_duration_months;
    } else {
      container.querySelector("#housing-form").reset();
      container.querySelector("#housing-id").value = "";
      container.querySelector("#h-county").value = "Nairobi";
      container.querySelector("#h-duration").value = "12";
    }

    modal.classList.remove("hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
  }

  // Modal events
  container.querySelector("#add-housing-btn").addEventListener("click", () => openModal());
  container.querySelector(".modal-close").addEventListener("click", closeModal);
  container.querySelector(".modal-cancel").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  // Form submit
  container.querySelector("#housing-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector("#housing-form-error");
    errorEl.textContent = "";

    const id = container.querySelector("#housing-id").value;
    const body = {
      county: container.querySelector("#h-county").value,
      town_location: container.querySelector("#h-town").value,
      block_name: container.querySelector("#h-block").value,
      floor_number: container.querySelector("#h-floor").value,
      house_type_id: container.querySelector("#h-type").value,
      monthly_rent: container.querySelector("#h-rent").value,
      payment_duration_months: container.querySelector("#h-duration").value,
    };

    try {
      if (id) {
        await apiRequest(`/housing/${id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiRequest("/housing", { method: "POST", body: JSON.stringify(body) });
      }
      closeModal();
      loadHousingTable();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

  // Load table
  await loadHousingTable();

  async function loadHousingTable() {
    const wrapper = container.querySelector("#housing-table-wrapper");
    wrapper.innerHTML = '<p class="loading">Loading...</p>';

    try {
      const housing = await apiRequest("/housing");

      if (housing.length === 0) {
        wrapper.innerHTML = '<p class="empty-state">No housing units added yet.</p>';
        return;
      }

      wrapper.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Block</th>
              <th>Floor</th>
              <th>Type</th>
              <th>Rent (KES)</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${housing.map((h) => `
              <tr>
                <td>${h.id}</td>
                <td>${h.town_location}</td>
                <td>${h.block_name}</td>
                <td>${h.floor_number}</td>
                <td>${h.house_type.house_type_name}</td>
                <td>${Number(h.monthly_rent).toLocaleString()}</td>
                <td>${h.payment_duration_months}m</td>
                <td><span class="status-badge ${getOccupancyClass(h.occupancy_status)}">${formatOccupancy(h.occupancy_status)}</span></td>
                <td class="actions-cell">
                  <button class="btn btn-sm btn-outline edit-btn" data-id="${h.id}">Edit</button>
                  ${h.occupancy_status === "vacant" ? `<button class="btn btn-sm btn-danger delete-btn" data-id="${h.id}">Delete</button>` : ""}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;

      // Edit handlers
      wrapper.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const house = housing.find((h) => h.id === parseInt(btn.dataset.id));
          openModal("Edit Housing Unit", house);
        });
      });

      // Delete handlers
      wrapper.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("Are you sure you want to delete this housing unit?")) return;
          try {
            await apiRequest(`/housing/${btn.dataset.id}`, { method: "DELETE" });
            loadHousingTable();
          } catch (err) {
            alert(err.message);
          }
        });
      });
    } catch (err) {
      wrapper.innerHTML = `<p class="error-message">${err.message}</p>`;
    }
  }
}

function getOccupancyClass(status) {
  switch (status) {
    case "vacant": return "status-vacant";
    case "booked_pending": return "status-pending";
    case "occupied": return "status-occupied";
    default: return "";
  }
}

function formatOccupancy(status) {
  switch (status) {
    case "vacant": return "Vacant";
    case "booked_pending": return "Booked (Pending)";
    case "occupied": return "Occupied";
    default: return status;
  }
}
