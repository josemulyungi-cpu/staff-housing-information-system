import { addRoute, initRouter, navigateTo, getRoute } from "./router.js";
import { isLoggedIn, getUser } from "./api.js";
import { renderNavbar } from "./components/navbar.js";
import { renderLogin } from "./pages/login.js";
import { renderRegister } from "./pages/register.js";
import { renderStaffDashboard } from "./pages/staffDashboard.js";
import { renderHousingList } from "./pages/housingList.js";
import { renderAdminDashboard } from "./pages/adminDashboard.js";
import { renderAdminHousing } from "./pages/adminHousing.js";
import { renderAdminApplications } from "./pages/adminApplications.js";
import { renderAdminEmployers } from "./pages/adminEmployers.js";

// Route guards
function requireAuth(handler, requiredRole) {
  return async (container) => {
    if (!isLoggedIn()) {
      navigateTo("/login");
      return;
    }
    const user = getUser();
    if (requiredRole && user.role !== requiredRole) {
      navigateTo(user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard");
      return;
    }
    return handler(container);
  };
}

function guestOnly(handler) {
  return async (container) => {
    if (isLoggedIn()) {
      const user = getUser();
      navigateTo(user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard");
      return;
    }
    return handler(container);
  };
}

// Landing page
function renderHome(container) {
  if (isLoggedIn()) {
    const user = getUser();
    navigateTo(user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard");
    return;
  }

  container.innerHTML = `
    <div class="container">
      <div class="hero">
        <h1>Housing Information Management System</h1>
        <p class="hero-subtitle">Kenya Prisons Service - Nairobi Region</p>
        <p class="hero-desc">
          Digital platform for application, tracking, and allocation of rental housing units 
          for prison staff within the Nairobi Region.
        </p>
        <div class="hero-actions">
          <a href="#/login" class="btn btn-primary btn-lg">Login</a>
          <a href="#/register" class="btn btn-outline btn-lg">Register</a>
        </div>
      </div>
    </div>
  `;
}

// Register all routes
addRoute("/", renderHome);
addRoute("/login", guestOnly(renderLogin));
addRoute("/register", guestOnly(renderRegister));

// Staff routes
addRoute("/staff/dashboard", requireAuth(renderStaffDashboard, "staff"));
addRoute("/staff/housing", requireAuth(renderHousingList, "staff"));

// Admin routes
addRoute("/admin/dashboard", requireAuth(renderAdminDashboard, "admin"));
addRoute("/admin/housing", requireAuth(renderAdminHousing, "admin"));
addRoute("/admin/applications", requireAuth(renderAdminApplications, "admin"));
addRoute("/admin/employers", requireAuth(renderAdminEmployers, "admin"));

// Initialize
renderNavbar();
initRouter();

// Re-render navbar on route change
window.addEventListener("hashchange", () => {
  renderNavbar();
});
