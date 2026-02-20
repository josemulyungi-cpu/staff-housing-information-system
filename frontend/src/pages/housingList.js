import { apiRequest } from "../api.js";
import { navigateTo } from "../router.js";

export async function renderHousingList(container) {
  container.innerHTML = `
    <div class="container">
      <h2>Available Housing Units</h2>
      
      <div class="filter-bar card">
        <h4>Filter Housing</h4>
        <div class="filter-row">
          <div class="form-group">
            <label>Town Location</label>
            <select id="filter-town"><option value="">All</option></select>
          </div>
          <div class="form-group">
            <label>Block</label>
            <select id="filter-block"><option value="">All</option></select>
          </div>
          <div class="form-group">
            <label>Floor</label>
            <select id="filter-floor"><option value="">All</option></select>
          </div>
          <div class="form-group">
            <label>House Type</label>
            <select id="filter-type"><option value="">All</option></select>
          </div>
          <div class="form-group">
            <label>Min Rent (KES)</label>
            <input type="number" id="filter-min-rent" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Max Rent (KES)</label>
            <input type="number" id="filter-max-rent" placeholder="99999" />
          </div>
        </div>
        <button id="apply-filters" class="btn btn-primary">Apply Filters</button>
        <button id="clear-filters" class="btn btn-outline">Clear</button>
      </div>

      <div id="housing-grid" class="housing-grid">
        <p class="loading">Loading housing units...</p>
      </div>
    </div>
  `;

  // Load filter options
  try {
    const options = await apiRequest("/housing/filters/options");
    populateSelect("#filter-town", options.towns);
    populateSelect("#filter-block", options.blocks);
    populateSelect("#filter-floor", options.floors);
    populateSelectObj("#filter-type", options.houseTypes, "id", "house_type_name");
  } catch (err) {
    console.error("Failed to load filters:", err);
  }

  // Load housing
  await loadHousing();

  // Filter handlers
  container.querySelector("#apply-filters").addEventListener("click", loadHousing);
  container.querySelector("#clear-filters").addEventListener("click", () => {
    container.querySelectorAll(".filter-bar select").forEach((s) => (s.value = ""));
    container.querySelectorAll(".filter-bar input").forEach((i) => (i.value = ""));
    loadHousing();
  });

  async function loadHousing() {
    const grid = document.getElementById("housing-grid");
    grid.innerHTML = '<p class="loading">Loading...</p>';

    const params = new URLSearchParams();
    const town = document.getElementById("filter-town").value;
    const block = document.getElementById("filter-block").value;
    const floor = document.getElementById("filter-floor").value;
    const type = document.getElementById("filter-type").value;
    const minRent = document.getElementById("filter-min-rent").value;
    const maxRent = document.getElementById("filter-max-rent").value;

    if (town) params.set("town_location", town);
    if (block) params.set("block_name", block);
    if (floor) params.set("floor_number", floor);
    if (type) params.set("house_type_id", type);
    if (minRent) params.set("min_rent", minRent);
    if (maxRent) params.set("max_rent", maxRent);

    try {
      const housing = await apiRequest(`/housing?${params.toString()}`);

      if (housing.length === 0) {
        grid.innerHTML = '<p class="empty-state">No housing units found matching your filters.</p>';
        return;
      }

      grid.innerHTML = housing.map((h) => `
        <div class="housing-card card">
          <div class="housing-header">
            <span class="house-type-tag">${h.house_type.house_type_name}</span>
            <span class="status-badge ${getOccupancyClass(h.occupancy_status)}">
              ${formatOccupancy(h.occupancy_status)}
            </span>
          </div>
          <div class="housing-body">
            <p><strong>Location:</strong> ${h.town_location}</p>
            <p><strong>Block:</strong> ${h.block_name}</p>
            <p><strong>Floor:</strong> ${h.floor_number}</p>
            <p class="rent">KES ${Number(h.monthly_rent).toLocaleString()}/month</p>
            <p class="duration">${h.payment_duration_months} months duration</p>
          </div>
          <div class="housing-actions">
            ${h.occupancy_status === "vacant"
              ? `<button class="btn btn-primary btn-full apply-btn" data-id="${h.id}">Apply for this House</button>`
              : `<button class="btn btn-disabled btn-full" disabled>${formatOccupancy(h.occupancy_status)}</button>`
            }
          </div>
        </div>
      `).join("");

      // Apply button handlers
      grid.querySelectorAll(".apply-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("Are you sure you want to apply for this housing unit? You can only apply once.")) return;

          btn.disabled = true;
          btn.textContent = "Applying...";

          try {
            await apiRequest("/applications", {
              method: "POST",
              body: JSON.stringify({ housing_id: btn.dataset.id }),
            });
            alert("Application submitted successfully!");
            navigateTo("/staff/dashboard");
          } catch (err) {
            alert(err.message);
            btn.disabled = false;
            btn.textContent = "Apply for this House";
          }
        });
      });
    } catch (err) {
      grid.innerHTML = `<p class="error-message">${err.message}</p>`;
    }
  }
}

function populateSelect(selector, values) {
  const select = document.querySelector(selector);
  values.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function populateSelectObj(selector, items, valueKey, labelKey) {
  const select = document.querySelector(selector);
  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item[valueKey];
    opt.textContent = item[labelKey];
    select.appendChild(opt);
  });
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
    case "booked_pending": return "Booked but not yet approved";
    case "occupied": return "Occupied";
    default: return status;
  }
}
