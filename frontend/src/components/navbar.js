import { isLoggedIn, getUser, clearAuth } from "../api.js";
import { navigateTo } from "../router.js";

/**
 * Render the navbar based on auth state
 */
export function renderNavbar() {
  const navbar = document.getElementById("navbar");
  const user = getUser();
  const loggedIn = isLoggedIn();

  if (!loggedIn) {
    navbar.innerHTML = `
      <div class="nav-container">
        <a href="#/" class="nav-brand">HIMS</a>
        <div class="nav-links">
          <a href="#/login" class="nav-link">Login</a>
          <a href="#/register" class="nav-link">Register</a>
        </div>
      </div>
    `;
    return;
  }

  if (user.role === "admin") {
    navbar.innerHTML = `
      <div class="nav-container">
        <a href="#/admin/dashboard" class="nav-brand">HIMS Admin</a>
        <div class="nav-links">
          <a href="#/admin/dashboard" class="nav-link">Dashboard</a>
          <a href="#/admin/housing" class="nav-link">Housing</a>
          <a href="#/admin/applications" class="nav-link">Applications</a>
          <a href="#/admin/employers" class="nav-link">Employers</a>
          <button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>
        </div>
      </div>
    `;
  } else {
    navbar.innerHTML = `
      <div class="nav-container">
        <a href="#/staff/dashboard" class="nav-brand">HIMS</a>
        <div class="nav-links">
          <a href="#/staff/dashboard" class="nav-link">My Dashboard</a>
          <a href="#/staff/housing" class="nav-link">Browse Housing</a>
          <span class="nav-user">Hi, ${user.full_name || user.employee_id}</span>
          <button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>
        </div>
      </div>
    `;
  }

  // Logout handler
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      renderNavbar();
      navigateTo("/login");
    });
  }
}
