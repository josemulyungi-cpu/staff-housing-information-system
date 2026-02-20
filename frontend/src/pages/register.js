import { apiRequest, saveAuth } from "../api.js";
import { navigateTo } from "../router.js";
import { renderNavbar } from "../components/navbar.js";

export async function renderRegister(container) {
  // Fetch employers for the dropdown
  let employers = [];
  try {
    employers = await apiRequest("/employers");
  } catch (err) {
    console.error("Failed to load employers:", err);
  }

  const employerOptions = employers
    .map((e) => `<option value="${e.id}">${e.employer_name}</option>`)
    .join("");

  container.innerHTML = `
    <div class="container">
      <div class="auth-card">
        <h2>Staff Registration</h2>
        <form id="register-form">
          <div class="form-group">
            <label for="reg-employer">Employer</label>
            <select id="reg-employer" required>
              <option value="">-- Select Employer --</option>
              ${employerOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="reg-emp-id">Employee ID</label>
            <input type="text" id="reg-emp-id" placeholder="e.g. 1001" required />
          </div>
          <div class="form-group">
            <label for="reg-fullname">Full Name</label>
            <input type="text" id="reg-fullname" placeholder="Enter your full name" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="reg-gender">Gender</label>
              <select id="reg-gender" required>
                <option value="">-- Select --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div class="form-group">
              <label for="reg-dob">Date of Birth</label>
              <input type="date" id="reg-dob" required />
            </div>
          </div>
          <div class="form-group">
            <label for="reg-year">Year of Employment</label>
            <input type="number" id="reg-year" placeholder="e.g. 2015" min="1960" max="2026" required />
          </div>
          <div class="form-group">
            <label for="reg-password">Password</label>
            <input type="password" id="reg-password" placeholder="Create a password" minlength="6" required />
          </div>
          <div class="form-group">
            <label for="reg-confirm">Confirm Password</label>
            <input type="password" id="reg-confirm" placeholder="Confirm your password" minlength="6" required />
          </div>
          <button type="submit" class="btn btn-primary btn-full">Register</button>
          <div id="register-error" class="error-message"></div>
          <div id="register-success" class="success-message"></div>
        </form>
        <p class="auth-link">Already have an account? <a href="#/login">Login here</a></p>
      </div>
    </div>
  `;

  container.querySelector("#register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector("#register-error");
    const successEl = container.querySelector("#register-success");
    errorEl.textContent = "";
    successEl.textContent = "";

    const password = container.querySelector("#reg-password").value;
    const confirm = container.querySelector("#reg-confirm").value;

    if (password !== confirm) {
      errorEl.textContent = "Passwords do not match.";
      return;
    }

    try {
      const data = await apiRequest("/auth/employee/register", {
        method: "POST",
        body: JSON.stringify({
          employee_id: container.querySelector("#reg-emp-id").value,
          password,
          full_name: container.querySelector("#reg-fullname").value,
          gender: container.querySelector("#reg-gender").value,
          date_of_birth: container.querySelector("#reg-dob").value,
          year_of_employment: container.querySelector("#reg-year").value,
          employer_id: container.querySelector("#reg-employer").value,
        }),
      });

      saveAuth(data.token, data.user);
      renderNavbar();
      navigateTo("/staff/dashboard");
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}
