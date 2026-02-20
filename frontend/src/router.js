/**
 * Simple hash-based SPA router
 */

const routes = {};
let currentCleanup = null;

function addRoute(path, handler) {
  routes[path] = handler;
}

function navigateTo(path) {
  window.location.hash = path;
}

function getRoute() {
  return window.location.hash.slice(1) || "/";
}

async function handleRoute() {
  const path = getRoute();
  const mainContent = document.getElementById("main-content");

  // Run cleanup from previous page
  if (currentCleanup && typeof currentCleanup === "function") {
    currentCleanup();
    currentCleanup = null;
  }

  // Find matching route
  const handler = routes[path];

  if (handler) {
    const cleanup = await handler(mainContent);
    if (typeof cleanup === "function") {
      currentCleanup = cleanup;
    }
  } else {
    mainContent.innerHTML = `
      <div class="container">
        <div class="card text-center" style="margin-top: 4rem;">
          <h2>404 - Page Not Found</h2>
          <p>The page you're looking for doesn't exist.</p>
          <a href="#/" class="btn btn-primary">Go Home</a>
        </div>
      </div>
    `;
  }
}

function initRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}

export { addRoute, navigateTo, getRoute, initRouter };
