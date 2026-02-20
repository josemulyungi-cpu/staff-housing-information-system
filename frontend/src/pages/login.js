import { apiRequest, saveAuth } from "../api.js";
import { navigateTo } from "../router.js";
import { renderNavbar } from "../components/navbar.js";

export async function renderLogin(container) {
  container.innerHTML = `
    <div class="container">
      <div class="auth-card">
        <h2>Login</h2>
        <div class="tab-group">
          <button class="tab-btn active" data-tab="staff">Staff Login</button>
          <button class="tab-btn" data-tab="admin">Admin Login</button>
        </div>

        <div id="staff-login-form" class="tab-content active">
          <form id="staff-login">
            <div class="form-group">
              <label for="staff-emp-id">Employee ID</label>
              <input type="text" id="staff-emp-id" placeholder="Enter your Employee ID" required />
            </div>
            <div class="form-group">
              <label for="staff-password">Password</label>
              <input type="password" id="staff-password" placeholder="Enter your password" required />
            </div>
            <button type="submit" class="btn btn-primary btn-full">Login as Staff</button>
            <div id="staff-login-error" class="error-message"></div>
          </form>
          <p class="auth-link">Don't have an account? <a href="#/register">Register here</a></p>
        </div>

        <div id="admin-login-form" class="tab-content">
          <form id="admin-login">
            <div class="form-group">
              <label for="admin-username">Username</label>
              <input type="text" id="admin-username" placeholder="Enter admin username" required />
            </div>
            <div class="form-group">
              <label for="admin-password">Password</label>
              <input type="password" id="admin-password" placeholder="Enter admin password" required />
            </div>
            <button type="submit" class="btn btn-primary btn-full">Login as Admin</button>
            <div id="admin-login-error" class="error-message"></div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Tab switching
  const tabBtns = container.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      container.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
      const tab = btn.dataset.tab;
      container.querySelector(`#${tab}-login-form`).classList.add("active");
    });
  });

  // Staff login
  container.querySelector("#staff-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector("#staff-login-error");
    errorEl.textContent = "";

    try {
      const data = await apiRequest("/auth/employee/login", {
        method: "POST",
        body: JSON.stringify({
          employee_id: container.querySelector("#staff-emp-id").value,
          password: container.querySelector("#staff-password").value,
        }),
      });
      saveAuth(data.token, data.user);
      renderNavbar();
      navigateTo("/staff/dashboard");
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

  // Admin login
  container.querySelector("#admin-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector("#admin-login-error");
    errorEl.textContent = "";

    try {
      const data = await apiRequest("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({
          username: container.querySelector("#admin-username").value,
          password: container.querySelector("#admin-password").value,
        }),
      });
      saveAuth(data.token, data.user);
      renderNavbar();
      navigateTo("/admin/dashboard");
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}
