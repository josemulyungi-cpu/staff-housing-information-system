const prisma = require("../utils/prisma");

/**
 * GET /api/dashboard/stats
 * Real-time occupancy tracking stats (Admin)
 */
async function getDashboardStats(req, res) {
  try {
    const total = await prisma.housing.count();
    const vacant = await prisma.housing.count({ where: { occupancy_status: "vacant" } });
    const booked_pending = await prisma.housing.count({ where: { occupancy_status: "booked_pending" } });
    const occupied = await prisma.housing.count({ where: { occupancy_status: "occupied" } });

    const pendingApplications = await prisma.registration.count({
      where: { application_status: "pending" },
    });

    const totalEmployees = await prisma.employee.count();

    res.json({
      total,
      vacant,
      booked_pending,
      occupied,
      pendingApplications,
      totalEmployees,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { getDashboardStats };
