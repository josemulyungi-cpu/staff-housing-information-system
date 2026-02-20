/* ========================================
   HIMS - Housing Information Management System
   Single-file vanilla JS application
   ======================================== */
(function () {
  "use strict";

  // =============================================
  // API Module
  // =============================================
  var API_BASE = "http://localhost:5000/api";

  function getToken() {
    return localStorage.getItem("hims_token");
  }

  function getUser() {
    var user = localStorage.getItem("hims_user");
    return user ? JSON.parse(user) : null;
  }

  function saveAuth(token, user) {
    localStorage.setItem("hims_token", token);
    localStorage.setItem("hims_user", JSON.stringify(user));
  }

  function clearAuth() {
    localStorage.removeItem("hims_token");
    localStorage.removeItem("hims_user");
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function apiRequest(endpoint, options) {
    options = options || {};
    var token = getToken();
    var headers = Object.assign(
      { "Content-Type": "application/json" },
      token ? { Authorization: "Bearer " + token } : {},
      options.headers || {}
    );

    return fetch(API_BASE + endpoint, Object.assign({}, options, { headers: headers }))
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data.error || "Request failed");
          }
          return data;
        });
      });
  }

  // =============================================
  // Router Module
  // =============================================
  var routes = {};
  var currentCleanup = null;

  function addRoute(path, handler) {
    routes[path] = handler;
  }

  function navigateTo(path) {
    window.location.hash = path;
  }

  function getRoute() {
    return window.location.hash.slice(1) || "/";
  }

  function handleRoute() {
    var path = getRoute();
    var mainContent = document.getElementById("main-content");

    if (currentCleanup && typeof currentCleanup === "function") {
      currentCleanup();
      currentCleanup = null;
    }

    var handler = routes[path];

    if (handler) {
      var result = handler(mainContent);
      if (result && typeof result.then === "function") {
        result.then(function (cleanup) {
          if (typeof cleanup === "function") {
            currentCleanup = cleanup;
          }
        });
      } else if (typeof result === "function") {
        currentCleanup = result;
      }
    } else {
      mainContent.innerHTML =
        '<div class="container">' +
        '<div class="card text-center" style="margin-top: 4rem;">' +
        "<h2>404 - Page Not Found</h2>" +
        "<p>The page you're looking for doesn't exist.</p>" +
        '<a href="#/" class="btn btn-primary">Go Home</a>' +
        "</div></div>";
    }
  }

  function initRouter() {
    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  }

  // =============================================
  // Navbar Component
  // =============================================
  function renderNavbar() {
    var navbar = document.getElementById("navbar");
    var user = getUser();
    var loggedIn = isLoggedIn();

    if (!loggedIn) {
      navbar.innerHTML =
        '<div class="nav-container">' +
        '<a href="#/" class="nav-brand">HIMS</a>' +
        '<div class="nav-links">' +
        '<a href="#/login" class="nav-link">Login</a>' +
        '<a href="#/register" class="nav-link">Register</a>' +
        "</div></div>";
      return;
    }

    if (user.role === "admin") {
      navbar.innerHTML =
        '<div class="nav-container">' +
        '<a href="#/admin/dashboard" class="nav-brand">HIMS Admin</a>' +
        '<div class="nav-links">' +
        '<a href="#/admin/dashboard" class="nav-link">Dashboard</a>' +
        '<a href="#/admin/housing" class="nav-link">Housing</a>' +
        '<a href="#/admin/applications" class="nav-link">Applications</a>' +
        '<a href="#/admin/employers" class="nav-link">Employers</a>' +
        '<button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>' +
        "</div></div>";
    } else {
      navbar.innerHTML =
        '<div class="nav-container">' +
        '<a href="#/staff/dashboard" class="nav-brand">HIMS</a>' +
        '<div class="nav-links">' +
        '<a href="#/staff/dashboard" class="nav-link">My Dashboard</a>' +
        '<a href="#/staff/housing" class="nav-link">Browse Housing</a>' +
        '<span class="nav-user">Hi, ' + (user.full_name || user.employee_id) + "</span>" +
        '<button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>' +
        "</div></div>";
    }

    var logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        clearAuth();
        renderNavbar();
        navigateTo("/login");
      });
    }
  }

  // =============================================
  // Route Guards
  // =============================================
  function requireAuth(handler, requiredRole) {
    return function (container) {
      if (!isLoggedIn()) {
        navigateTo("/login");
        return;
      }
      var user = getUser();
      if (requiredRole && user.role !== requiredRole) {
        navigateTo(user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard");
        return;
      }
      return handler(container);
    };
  }

  function guestOnly(handler) {
    return function (container) {
      if (isLoggedIn()) {
        var user = getUser();
        navigateTo(user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard");
        return;
      }
      return handler(container);
    };
  }

  // =============================================
  // Page: Home
  // =============================================
  function renderHome(container) {
    if (isLoggedIn()) {
      var user = getUser();
      navigateTo(user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard");
      return;
    }

    container.innerHTML =
      '<div class="container"><div class="hero">' +
      "<h1>Housing Information Management System</h1>" +
      '<p class="hero-subtitle">Kenya Prisons Service - Nairobi Region</p>' +
      '<p class="hero-desc">' +
      "Digital platform for application, tracking, and allocation of rental housing units " +
      "for prison staff within the Nairobi Region." +
      "</p>" +
      '<div class="hero-actions">' +
      '<a href="#/login" class="btn btn-primary btn-lg">Login</a>' +
      '<a href="#/register" class="btn btn-outline btn-lg">Register</a>' +
      "</div></div></div>";
  }

  // =============================================
  // Page: Login
  // =============================================
  function renderLogin(container) {
    container.innerHTML =
      '<div class="container"><div class="auth-card">' +
      "<h2>Login</h2>" +
      '<div class="tab-group">' +
      '<button class="tab-btn active" data-tab="staff">Staff Login</button>' +
      '<button class="tab-btn" data-tab="admin">Admin Login</button>' +
      "</div>" +
      '<div id="staff-login-form" class="tab-content active">' +
      '<form id="staff-login">' +
      '<div class="form-group"><label for="staff-emp-id">Employee ID</label>' +
      '<input type="text" id="staff-emp-id" placeholder="Enter your Employee ID" required /></div>' +
      '<div class="form-group"><label for="staff-password">Password</label>' +
      '<input type="password" id="staff-password" placeholder="Enter your password" required /></div>' +
      '<button type="submit" class="btn btn-primary btn-full">Login as Staff</button>' +
      '<div id="staff-login-error" class="error-message"></div>' +
      "</form>" +
      '<p class="auth-link">Don\'t have an account? <a href="#/register">Register here</a></p>' +
      "</div>" +
      '<div id="admin-login-form" class="tab-content">' +
      '<form id="admin-login">' +
      '<div class="form-group"><label for="admin-username">Username</label>' +
      '<input type="text" id="admin-username" placeholder="Enter admin username" required /></div>' +
      '<div class="form-group"><label for="admin-password">Password</label>' +
      '<input type="password" id="admin-password" placeholder="Enter admin password" required /></div>' +
      '<button type="submit" class="btn btn-primary btn-full">Login as Admin</button>' +
      '<div id="admin-login-error" class="error-message"></div>' +
      "</form></div></div></div>";

    // Tab switching
    var tabBtns = container.querySelectorAll(".tab-btn");
    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        container.querySelectorAll(".tab-content").forEach(function (c) { c.classList.remove("active"); });
        var tab = btn.getAttribute("data-tab");
        container.querySelector("#" + tab + "-login-form").classList.add("active");
      });
    });

    // Staff login
    container.querySelector("#staff-login").addEventListener("submit", function (e) {
      e.preventDefault();
      var errorEl = container.querySelector("#staff-login-error");
      errorEl.textContent = "";

      apiRequest("/auth/employee/login", {
        method: "POST",
        body: JSON.stringify({
          employee_id: container.querySelector("#staff-emp-id").value,
          password: container.querySelector("#staff-password").value,
        }),
      })
        .then(function (data) {
          saveAuth(data.token, data.user);
          renderNavbar();
          navigateTo("/staff/dashboard");
        })
        .catch(function (err) {
          errorEl.textContent = err.message;
        });
    });

    // Admin login
    container.querySelector("#admin-login").addEventListener("submit", function (e) {
      e.preventDefault();
      var errorEl = container.querySelector("#admin-login-error");
      errorEl.textContent = "";

      apiRequest("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({
          username: container.querySelector("#admin-username").value,
          password: container.querySelector("#admin-password").value,
        }),
      })
        .then(function (data) {
          saveAuth(data.token, data.user);
          renderNavbar();
          navigateTo("/admin/dashboard");
        })
        .catch(function (err) {
          errorEl.textContent = err.message;
        });
    });
  }

  // =============================================
  // Page: Register
  // =============================================
  function renderRegister(container) {
    // Fetch employers for dropdown, then render
    apiRequest("/employers")
      .then(function (employers) { buildRegisterForm(container, employers); })
      .catch(function () { buildRegisterForm(container, []); });
  }

  function buildRegisterForm(container, employers) {
    var employerOptions = employers
      .map(function (e) { return '<option value="' + e.id + '">' + e.employer_name + "</option>"; })
      .join("");

    container.innerHTML =
      '<div class="container"><div class="auth-card">' +
      "<h2>Staff Registration</h2>" +
      '<form id="register-form">' +
      '<div class="form-group"><label for="reg-employer">Employer</label>' +
      '<select id="reg-employer" required><option value="">-- Select Employer --</option>' +
      employerOptions + "</select></div>" +
      '<div class="form-group"><label for="reg-emp-id">Employee ID</label>' +
      '<input type="text" id="reg-emp-id" placeholder="e.g. 1001" required /></div>' +
      '<div class="form-group"><label for="reg-fullname">Full Name</label>' +
      '<input type="text" id="reg-fullname" placeholder="Enter your full name" required /></div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label for="reg-gender">Gender</label>' +
      '<select id="reg-gender" required><option value="">-- Select --</option>' +
      '<option value="Male">Male</option><option value="Female">Female</option></select></div>' +
      '<div class="form-group"><label for="reg-dob">Date of Birth</label>' +
      '<input type="date" id="reg-dob" required /></div></div>' +
      '<div class="form-group"><label for="reg-year">Year of Employment</label>' +
      '<input type="number" id="reg-year" placeholder="e.g. 2015" min="1960" max="2026" required /></div>' +
      '<div class="form-group"><label for="reg-password">Password</label>' +
      '<input type="password" id="reg-password" placeholder="Create a password" minlength="6" required /></div>' +
      '<div class="form-group"><label for="reg-confirm">Confirm Password</label>' +
      '<input type="password" id="reg-confirm" placeholder="Confirm your password" minlength="6" required /></div>' +
      '<button type="submit" class="btn btn-primary btn-full">Register</button>' +
      '<div id="register-error" class="error-message"></div>' +
      '<div id="register-success" class="success-message"></div>' +
      "</form>" +
      '<p class="auth-link">Already have an account? <a href="#/login">Login here</a></p>' +
      "</div></div>";

    container.querySelector("#register-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var errorEl = container.querySelector("#register-error");
      var successEl = container.querySelector("#register-success");
      errorEl.textContent = "";
      successEl.textContent = "";

      var password = container.querySelector("#reg-password").value;
      var confirm = container.querySelector("#reg-confirm").value;

      if (password !== confirm) {
        errorEl.textContent = "Passwords do not match.";
        return;
      }

      apiRequest("/auth/employee/register", {
        method: "POST",
        body: JSON.stringify({
          employee_id: container.querySelector("#reg-emp-id").value,
          password: password,
          full_name: container.querySelector("#reg-fullname").value,
          gender: container.querySelector("#reg-gender").value,
          date_of_birth: container.querySelector("#reg-dob").value,
          year_of_employment: container.querySelector("#reg-year").value,
          employer_id: container.querySelector("#reg-employer").value,
        }),
      })
        .then(function (data) {
          saveAuth(data.token, data.user);
          renderNavbar();
          navigateTo("/staff/dashboard");
        })
        .catch(function (err) {
          errorEl.textContent = err.message;
        });
    });
  }

  // =============================================
  // Page: Staff Dashboard
  // =============================================
  function renderStaffDashboard(container) {
    var user = getUser();

    container.innerHTML =
      '<div class="container">' +
      "<h2>Welcome, " + (user.full_name || user.employee_id) + "</h2>" +
      '<p class="subtitle">Employee ID: ' + user.employee_id + "</p>" +
      '<div class="card"><h3>My Application Status</h3>' +
      '<div id="application-status"><p class="loading">Loading your application...</p></div>' +
      "</div></div>";

    apiRequest("/applications")
      .then(function (applications) {
        var statusContainer = container.querySelector("#application-status");

        if (applications.length === 0) {
          statusContainer.innerHTML =
            '<div class="empty-state">' +
            "<p>You have not applied for any housing yet.</p>" +
            '<a href="#/staff/housing" class="btn btn-primary">Browse Available Housing</a>' +
            "</div>";
        } else {
          var app = applications[0];
          var house = app.housing;
          var statusClass = getAppStatusClass(app.application_status);

          statusContainer.innerHTML =
            '<div class="application-detail">' +
            '<div class="status-badge ' + statusClass + '">' +
            formatAppStatus(app.application_status) +
            "</div>" +
            '<div class="detail-grid">' +
            '<div class="detail-item"><span class="detail-label">Location</span>' +
            '<span class="detail-value">' + house.town_location + "</span></div>" +
            '<div class="detail-item"><span class="detail-label">Block</span>' +
            '<span class="detail-value">' + house.block_name + "</span></div>" +
            '<div class="detail-item"><span class="detail-label">Floor</span>' +
            '<span class="detail-value">' + house.floor_number + "</span></div>" +
            '<div class="detail-item"><span class="detail-label">House Type</span>' +
            '<span class="detail-value">' + house.house_type.house_type_name + "</span></div>" +
            '<div class="detail-item"><span class="detail-label">Monthly Rent</span>' +
            '<span class="detail-value">KES ' + Number(house.monthly_rent).toLocaleString() + "</span></div>" +
            '<div class="detail-item"><span class="detail-label">Duration</span>' +
            '<span class="detail-value">' + house.payment_duration_months + " months</span></div>" +
            '<div class="detail-item"><span class="detail-label">Applied On</span>' +
            '<span class="detail-value">' + new Date(app.created_at).toLocaleDateString() + "</span></div>" +
            "</div></div>";
        }
      })
      .catch(function (err) {
        container.querySelector("#application-status").innerHTML =
          '<p class="error-message">' + err.message + "</p>";
      });
  }

  function getAppStatusClass(status) {
    switch (status) {
      case "pending": return "status-pending";
      case "approved": return "status-approved";
      case "rejected": return "status-rejected";
      default: return "";
    }
  }

  function formatAppStatus(status) {
    switch (status) {
      case "pending": return "Booked - Pending Approval";
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      default: return status;
    }
  }

  // =============================================
  // Page: Housing List (Staff)
  // =============================================
  function renderHousingList(container) {
    container.innerHTML =
      '<div class="container">' +
      "<h2>Available Housing Units</h2>" +
      '<div class="filter-bar card"><h4>Filter Housing</h4>' +
      '<div class="filter-row">' +
      '<div class="form-group"><label>Town Location</label>' +
      '<select id="filter-town"><option value="">All</option></select></div>' +
      '<div class="form-group"><label>Block</label>' +
      '<select id="filter-block"><option value="">All</option></select></div>' +
      '<div class="form-group"><label>Floor</label>' +
      '<select id="filter-floor"><option value="">All</option></select></div>' +
      '<div class="form-group"><label>House Type</label>' +
      '<select id="filter-type"><option value="">All</option></select></div>' +
      '<div class="form-group"><label>Min Rent (KES)</label>' +
      '<input type="number" id="filter-min-rent" placeholder="0" /></div>' +
      '<div class="form-group"><label>Max Rent (KES)</label>' +
      '<input type="number" id="filter-max-rent" placeholder="99999" /></div>' +
      "</div>" +
      '<button id="apply-filters" class="btn btn-primary">Apply Filters</button> ' +
      '<button id="clear-filters" class="btn btn-outline">Clear</button></div>' +
      '<div id="housing-grid" class="housing-grid">' +
      '<p class="loading">Loading housing units...</p></div></div>';

    // Load filter options
    apiRequest("/housing/filters/options")
      .then(function (options) {
        populateSelect("#filter-town", options.towns);
        populateSelect("#filter-block", options.blocks);
        populateSelect("#filter-floor", options.floors);
        populateSelectObj("#filter-type", options.houseTypes, "id", "house_type_name");
      })
      .catch(function (err) {
        console.error("Failed to load filters:", err);
      });

    loadHousing();

    container.querySelector("#apply-filters").addEventListener("click", loadHousing);
    container.querySelector("#clear-filters").addEventListener("click", function () {
      container.querySelectorAll(".filter-bar select").forEach(function (s) { s.value = ""; });
      container.querySelectorAll(".filter-bar input").forEach(function (i) { i.value = ""; });
      loadHousing();
    });

    function loadHousing() {
      var grid = document.getElementById("housing-grid");
      grid.innerHTML = '<p class="loading">Loading...</p>';

      var params = new URLSearchParams();
      var town = document.getElementById("filter-town").value;
      var block = document.getElementById("filter-block").value;
      var floor = document.getElementById("filter-floor").value;
      var type = document.getElementById("filter-type").value;
      var minRent = document.getElementById("filter-min-rent").value;
      var maxRent = document.getElementById("filter-max-rent").value;

      if (town) params.set("town_location", town);
      if (block) params.set("block_name", block);
      if (floor) params.set("floor_number", floor);
      if (type) params.set("house_type_id", type);
      if (minRent) params.set("min_rent", minRent);
      if (maxRent) params.set("max_rent", maxRent);

      apiRequest("/housing?" + params.toString())
        .then(function (housing) {
          if (housing.length === 0) {
            grid.innerHTML = '<p class="empty-state">No housing units found matching your filters.</p>';
            return;
          }

          grid.innerHTML = housing.map(function (h) {
            var actionBtn;
            if (h.occupancy_status === "vacant") {
              actionBtn = '<button class="btn btn-primary btn-full apply-btn" data-id="' + h.id + '">Apply for this House</button>';
            } else {
              actionBtn = '<button class="btn btn-disabled btn-full" disabled>' + formatOccupancy(h.occupancy_status) + "</button>";
            }

            return (
              '<div class="housing-card card">' +
              '<div class="housing-header">' +
              '<span class="house-type-tag">' + h.house_type.house_type_name + "</span>" +
              '<span class="status-badge ' + getOccupancyClass(h.occupancy_status) + '">' +
              formatOccupancy(h.occupancy_status) + "</span></div>" +
              '<div class="housing-body">' +
              "<p><strong>Location:</strong> " + h.town_location + "</p>" +
              "<p><strong>Block:</strong> " + h.block_name + "</p>" +
              "<p><strong>Floor:</strong> " + h.floor_number + "</p>" +
              '<p class="rent">KES ' + Number(h.monthly_rent).toLocaleString() + "/month</p>" +
              '<p class="duration">' + h.payment_duration_months + " months duration</p></div>" +
              '<div class="housing-actions">' + actionBtn + "</div></div>"
            );
          }).join("");

          // Apply button handlers
          grid.querySelectorAll(".apply-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              if (!confirm("Are you sure you want to apply for this housing unit? You can only apply once.")) return;

              btn.disabled = true;
              btn.textContent = "Applying...";

              apiRequest("/applications", {
                method: "POST",
                body: JSON.stringify({ housing_id: btn.getAttribute("data-id") }),
              })
                .then(function () {
                  alert("Application submitted successfully!");
                  navigateTo("/staff/dashboard");
                })
                .catch(function (err) {
                  alert(err.message);
                  btn.disabled = false;
                  btn.textContent = "Apply for this House";
                });
            });
          });
        })
        .catch(function (err) {
          grid.innerHTML = '<p class="error-message">' + err.message + "</p>";
        });
    }
  }

  function populateSelect(selector, values) {
    var select = document.querySelector(selector);
    values.forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
  }

  function populateSelectObj(selector, items, valueKey, labelKey) {
    var select = document.querySelector(selector);
    items.forEach(function (item) {
      var opt = document.createElement("option");
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

  // =============================================
  // Page: Admin Dashboard
  // =============================================
  function renderAdminDashboard(container) {
    container.innerHTML =
      '<div class="container">' +
      "<h2>Admin Dashboard</h2>" +
      '<p class="subtitle">Real-Time Occupancy Tracking</p>' +
      '<div id="stats-grid" class="stats-grid">' +
      '<p class="loading">Loading dashboard stats...</p></div></div>';

    apiRequest("/dashboard/stats")
      .then(function (stats) {
        container.querySelector("#stats-grid").innerHTML =
          '<div class="stat-card stat-total"><div class="stat-number">' + stats.total + '</div><div class="stat-label">Total Houses</div></div>' +
          '<div class="stat-card stat-vacant"><div class="stat-number">' + stats.vacant + '</div><div class="stat-label">Vacant</div></div>' +
          '<div class="stat-card stat-pending"><div class="stat-number">' + stats.booked_pending + '</div><div class="stat-label">Booked (Pending)</div></div>' +
          '<div class="stat-card stat-occupied"><div class="stat-number">' + stats.occupied + '</div><div class="stat-label">Occupied</div></div>' +
          '<div class="stat-card stat-applications"><div class="stat-number">' + stats.pendingApplications + '</div><div class="stat-label">Pending Applications</div></div>' +
          '<div class="stat-card stat-employees"><div class="stat-number">' + stats.totalEmployees + '</div><div class="stat-label">Registered Employees</div></div>';
      })
      .catch(function (err) {
        container.querySelector("#stats-grid").innerHTML =
          '<p class="error-message">' + err.message + "</p>";
      });
  }

  // =============================================
  // Page: Admin Housing Management
  // =============================================
  function renderAdminHousing(container) {
    container.innerHTML =
      '<div class="container">' +
      '<div class="page-header"><h2>Housing Management</h2>' +
      '<button id="add-housing-btn" class="btn btn-primary">+ Add Housing Unit</button></div>' +
      '<div id="housing-table-wrapper"><p class="loading">Loading housing units...</p></div>' +
      // Modal
      '<div id="housing-modal" class="modal hidden"><div class="modal-content">' +
      '<div class="modal-header"><h3 id="modal-title">Add Housing Unit</h3>' +
      '<button class="modal-close">&times;</button></div>' +
      '<form id="housing-form"><input type="hidden" id="housing-id" />' +
      '<div class="form-row">' +
      '<div class="form-group"><label for="h-county">County</label>' +
      '<input type="text" id="h-county" value="Nairobi" required /></div>' +
      '<div class="form-group"><label for="h-town">Town Location</label>' +
      '<input type="text" id="h-town" placeholder="e.g. Langata" required /></div></div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label for="h-block">Block Name</label>' +
      '<input type="text" id="h-block" placeholder="e.g. Block A" required /></div>' +
      '<div class="form-group"><label for="h-floor">Floor Number</label>' +
      '<input type="number" id="h-floor" min="0" required /></div></div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label for="h-type">House Type</label>' +
      '<select id="h-type" required><option value="">-- Select --</option></select></div>' +
      '<div class="form-group"><label for="h-rent">Monthly Rent (KES)</label>' +
      '<input type="number" id="h-rent" min="0" required /></div></div>' +
      '<div class="form-group"><label for="h-duration">Payment Duration (months)</label>' +
      '<input type="number" id="h-duration" min="1" value="12" required /></div>' +
      '<div class="modal-actions">' +
      '<button type="button" class="btn btn-outline modal-cancel">Cancel</button>' +
      '<button type="submit" class="btn btn-primary">Save</button></div>' +
      '<div id="housing-form-error" class="error-message"></div>' +
      "</form></div></div></div>";

    // Load house types for dropdown
    var houseTypes = [];
    apiRequest("/housing/filters/options")
      .then(function (options) {
        houseTypes = options.houseTypes;
        var typeSelect = container.querySelector("#h-type");
        houseTypes.forEach(function (ht) {
          var opt = document.createElement("option");
          opt.value = ht.id;
          opt.textContent = ht.house_type_name;
          typeSelect.appendChild(opt);
        });
      })
      .catch(function (err) {
        console.error("Failed to load house types:", err);
      });

    var modal = container.querySelector("#housing-modal");

    function openModal(title, data) {
      title = title || "Add Housing Unit";
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

    container.querySelector("#add-housing-btn").addEventListener("click", function () { openModal(); });
    container.querySelector(".modal-close").addEventListener("click", closeModal);
    container.querySelector(".modal-cancel").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });

    // Form submit
    container.querySelector("#housing-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var errorEl = container.querySelector("#housing-form-error");
      errorEl.textContent = "";

      var id = container.querySelector("#housing-id").value;
      var body = {
        county: container.querySelector("#h-county").value,
        town_location: container.querySelector("#h-town").value,
        block_name: container.querySelector("#h-block").value,
        floor_number: container.querySelector("#h-floor").value,
        house_type_id: container.querySelector("#h-type").value,
        monthly_rent: container.querySelector("#h-rent").value,
        payment_duration_months: container.querySelector("#h-duration").value,
      };

      var endpoint = id ? "/housing/" + id : "/housing";
      var method = id ? "PUT" : "POST";

      apiRequest(endpoint, { method: method, body: JSON.stringify(body) })
        .then(function () {
          closeModal();
          loadHousingTable();
        })
        .catch(function (err) {
          errorEl.textContent = err.message;
        });
    });

    loadHousingTable();

    function loadHousingTable() {
      var wrapper = container.querySelector("#housing-table-wrapper");
      wrapper.innerHTML = '<p class="loading">Loading...</p>';

      apiRequest("/housing")
        .then(function (housing) {
          if (housing.length === 0) {
            wrapper.innerHTML = '<p class="empty-state">No housing units added yet.</p>';
            return;
          }

          wrapper.innerHTML =
            '<table class="data-table"><thead><tr>' +
            "<th>ID</th><th>Location</th><th>Block</th><th>Floor</th><th>Type</th>" +
            "<th>Rent (KES)</th><th>Duration</th><th>Status</th><th>Actions</th>" +
            "</tr></thead><tbody>" +
            housing.map(function (h) {
              var deleteBtn = h.occupancy_status === "vacant"
                ? '<button class="btn btn-sm btn-danger delete-btn" data-id="' + h.id + '">Delete</button>'
                : "";
              return (
                "<tr><td>" + h.id + "</td>" +
                "<td>" + h.town_location + "</td>" +
                "<td>" + h.block_name + "</td>" +
                "<td>" + h.floor_number + "</td>" +
                "<td>" + h.house_type.house_type_name + "</td>" +
                "<td>" + Number(h.monthly_rent).toLocaleString() + "</td>" +
                "<td>" + h.payment_duration_months + "m</td>" +
                '<td><span class="status-badge ' + getOccupancyClass(h.occupancy_status) + '">' +
                formatOccupancy(h.occupancy_status) + "</span></td>" +
                '<td class="actions-cell">' +
                '<button class="btn btn-sm btn-outline edit-btn" data-id="' + h.id + '">Edit</button>' +
                deleteBtn + "</td></tr>"
              );
            }).join("") +
            "</tbody></table>";

          // Edit handlers
          wrapper.querySelectorAll(".edit-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var house = housing.find(function (h) { return h.id === parseInt(btn.getAttribute("data-id")); });
              openModal("Edit Housing Unit", house);
            });
          });

          // Delete handlers
          wrapper.querySelectorAll(".delete-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              if (!confirm("Are you sure you want to delete this housing unit?")) return;
              apiRequest("/housing/" + btn.getAttribute("data-id"), { method: "DELETE" })
                .then(function () { loadHousingTable(); })
                .catch(function (err) { alert(err.message); });
            });
          });
        })
        .catch(function (err) {
          wrapper.innerHTML = '<p class="error-message">' + err.message + "</p>";
        });
    }
  }

  // =============================================
  // Page: Admin Applications
  // =============================================
  function renderAdminApplications(container) {
    container.innerHTML =
      '<div class="container">' +
      "<h2>Application Management</h2>" +
      '<p class="subtitle">Review and process housing applications</p>' +
      '<div id="applications-table-wrapper">' +
      '<p class="loading">Loading applications...</p></div></div>';

    loadApplications();

    function loadApplications() {
      var wrapper = container.querySelector("#applications-table-wrapper");
      wrapper.innerHTML = '<p class="loading">Loading...</p>';

      apiRequest("/applications")
        .then(function (applications) {
          if (applications.length === 0) {
            wrapper.innerHTML = '<p class="empty-state">No applications yet.</p>';
            return;
          }

          wrapper.innerHTML =
            '<table class="data-table"><thead><tr>' +
            "<th>ID</th><th>Employee</th><th>Employee ID</th><th>Employer</th>" +
            "<th>Housing</th><th>Rent (KES)</th><th>Status</th><th>Applied</th><th>Actions</th>" +
            "</tr></thead><tbody>" +
            applications.map(function (app) {
              var actions;
              if (app.application_status === "pending") {
                actions =
                  '<button class="btn btn-sm btn-success approve-btn" data-id="' + app.id + '">Approve</button>' +
                  '<button class="btn btn-sm btn-danger reject-btn" data-id="' + app.id + '">Reject</button>';
              } else {
                actions = '<span class="text-muted">Processed</span>';
              }
              return (
                "<tr><td>" + app.id + "</td>" +
                "<td>" + app.employee.full_name + "</td>" +
                "<td>" + app.employee.employee_id + "</td>" +
                "<td>" + app.employee.employer.employer_name + "</td>" +
                "<td>" + app.housing.town_location + " - " + app.housing.block_name +
                " (F" + app.housing.floor_number + ") - " + app.housing.house_type.house_type_name + "</td>" +
                "<td>" + Number(app.housing.monthly_rent).toLocaleString() + "</td>" +
                '<td><span class="status-badge ' + getAdminStatusClass(app.application_status) + '">' +
                formatAdminStatus(app.application_status) + "</span></td>" +
                "<td>" + new Date(app.created_at).toLocaleDateString() + "</td>" +
                '<td class="actions-cell">' + actions + "</td></tr>"
              );
            }).join("") +
            "</tbody></table>";

          // Approve handlers
          wrapper.querySelectorAll(".approve-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              if (!confirm("Approve this application? The house will be marked as occupied.")) return;
              btn.disabled = true;
              apiRequest("/applications/" + btn.getAttribute("data-id") + "/approve", { method: "PUT" })
                .then(function () { loadApplications(); })
                .catch(function (err) { alert(err.message); btn.disabled = false; });
            });
          });

          // Reject handlers
          wrapper.querySelectorAll(".reject-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              if (!confirm("Reject this application? The house will return to vacant status.")) return;
              btn.disabled = true;
              apiRequest("/applications/" + btn.getAttribute("data-id") + "/reject", { method: "PUT" })
                .then(function () { loadApplications(); })
                .catch(function (err) { alert(err.message); btn.disabled = false; });
            });
          });
        })
        .catch(function (err) {
          wrapper.innerHTML = '<p class="error-message">' + err.message + "</p>";
        });
    }
  }

  function getAdminStatusClass(status) {
    switch (status) {
      case "pending": return "status-pending";
      case "approved": return "status-approved";
      case "rejected": return "status-rejected";
      default: return "";
    }
  }

  function formatAdminStatus(status) {
    switch (status) {
      case "pending": return "Pending";
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      default: return status;
    }
  }

  // =============================================
  // Page: Admin Employers
  // =============================================
  function renderAdminEmployers(container) {
    container.innerHTML =
      '<div class="container">' +
      '<div class="page-header"><h2>Employer Management</h2>' +
      '<button id="add-employer-btn" class="btn btn-primary">+ Add Employer</button></div>' +
      '<div id="employers-table-wrapper"><p class="loading">Loading employers...</p></div>' +
      // Modal
      '<div id="employer-modal" class="modal hidden"><div class="modal-content modal-sm">' +
      '<div class="modal-header"><h3>Add New Employer</h3>' +
      '<button class="modal-close">&times;</button></div>' +
      '<form id="employer-form">' +
      '<div class="form-group"><label for="emp-code">Employer Code</label>' +
      '<input type="text" id="emp-code" placeholder="e.g. KPS-002" required /></div>' +
      '<div class="form-group"><label for="emp-name">Employer Name</label>' +
      '<input type="text" id="emp-name" placeholder="e.g. Kenya Police Service" required /></div>' +
      '<div class="modal-actions">' +
      '<button type="button" class="btn btn-outline modal-cancel">Cancel</button>' +
      '<button type="submit" class="btn btn-primary">Add Employer</button></div>' +
      '<div id="employer-form-error" class="error-message"></div>' +
      "</form></div></div></div>";

    var modal = container.querySelector("#employer-modal");

    container.querySelector("#add-employer-btn").addEventListener("click", function () {
      container.querySelector("#employer-form").reset();
      container.querySelector("#employer-form-error").textContent = "";
      modal.classList.remove("hidden");
    });

    container.querySelector(".modal-close").addEventListener("click", function () { modal.classList.add("hidden"); });
    container.querySelector(".modal-cancel").addEventListener("click", function () { modal.classList.add("hidden"); });
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.classList.add("hidden"); });

    // Form submit
    container.querySelector("#employer-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var errorEl = container.querySelector("#employer-form-error");
      errorEl.textContent = "";

      apiRequest("/employers", {
        method: "POST",
        body: JSON.stringify({
          employer_id: container.querySelector("#emp-code").value,
          employer_name: container.querySelector("#emp-name").value,
        }),
      })
        .then(function () {
          modal.classList.add("hidden");
          loadEmployers();
        })
        .catch(function (err) {
          errorEl.textContent = err.message;
        });
    });

    loadEmployers();

    function loadEmployers() {
      var wrapper = container.querySelector("#employers-table-wrapper");
      wrapper.innerHTML = '<p class="loading">Loading...</p>';

      apiRequest("/employers")
        .then(function (employers) {
          if (employers.length === 0) {
            wrapper.innerHTML = '<p class="empty-state">No employers added yet.</p>';
            return;
          }

          wrapper.innerHTML =
            '<table class="data-table"><thead><tr>' +
            "<th>ID</th><th>Employer Code</th><th>Employer Name</th><th>Authorization</th><th>Actions</th>" +
            "</tr></thead><tbody>" +
            employers.map(function (emp) {
              return (
                "<tr><td>" + emp.id + "</td>" +
                "<td>" + emp.employer_id + "</td>" +
                "<td>" + emp.employer_name + "</td>" +
                '<td><span class="status-badge ' + (emp.authorized ? "status-approved" : "status-rejected") + '">' +
                (emp.authorized ? "Authorized" : "Not Authorized") + "</span></td>" +
                "<td>" +
                '<button class="btn btn-sm ' + (emp.authorized ? "btn-danger" : "btn-success") +
                ' auth-btn" data-id="' + emp.id + '">' +
                (emp.authorized ? "Revoke" : "Authorize") +
                "</button></td></tr>"
              );
            }).join("") +
            "</tbody></table>";

          // Auth toggle handlers
          wrapper.querySelectorAll(".auth-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              btn.disabled = true;
              apiRequest("/employers/" + btn.getAttribute("data-id") + "/authorize", { method: "PUT" })
                .then(function () { loadEmployers(); })
                .catch(function (err) { alert(err.message); btn.disabled = false; });
            });
          });
        })
        .catch(function (err) {
          wrapper.innerHTML = '<p class="error-message">' + err.message + "</p>";
        });
    }
  }

  // =============================================
  // Register Routes & Initialize
  // =============================================
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
  window.addEventListener("hashchange", function () {
    renderNavbar();
  });
})();
