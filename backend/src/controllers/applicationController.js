const prisma = require("../utils/prisma");

/**
 * POST /api/apply
 * Staff applies for a housing unit
 */
async function applyForHousing(req, res) {
  try {
    const { housing_id } = req.body;
    const employeeDbId = req.user.id;

    if (!housing_id) {
      return res.status(400).json({ error: "Housing ID is required." });
    }

    // Check if employee already has an application
    const existingApplication = await prisma.registration.findUnique({
      where: { employee_id: employeeDbId },
    });

    if (existingApplication) {
      return res.status(400).json({
        error: "You have already applied for a housing unit. You can only apply for one house.",
      });
    }

    // Check if housing exists
    const housing = await prisma.housing.findUnique({
      where: { id: parseInt(housing_id) },
    });

    if (!housing) {
      return res.status(404).json({ error: "Housing unit not found." });
    }

    // Check if house is vacant
    if (housing.occupancy_status !== "vacant") {
      return res.status(400).json({
        error: "Booked but not yet approved. This house is not available.",
      });
    }

    // Create application and update housing status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const registration = await tx.registration.create({
        data: {
          employee_id: employeeDbId,
          housing_id: parseInt(housing_id),
        },
      });

      await tx.housing.update({
        where: { id: parseInt(housing_id) },
        data: { occupancy_status: "booked_pending" },
      });

      return registration;
    });

    res.status(201).json({
      message: "Application submitted successfully.",
      application: result,
    });
  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * GET /api/applications
 * Admin: list all applications
 * Staff: own application only
 */
async function getApplications(req, res) {
  try {
    const { role, id } = req.user;

    let applications;

    if (role === "admin") {
      applications = await prisma.registration.findMany({
        include: {
          employee: {
            select: {
              id: true,
              employee_id: true,
              full_name: true,
              gender: true,
              employer: { select: { employer_name: true } },
            },
          },
          housing: {
            include: { house_type: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    } else {
      applications = await prisma.registration.findMany({
        where: { employee_id: id },
        include: {
          housing: {
            include: { house_type: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    }

    res.json(applications);
  } catch (err) {
    console.error("Get applications error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * PUT /api/applications/:id/approve
 * Approve an application (Admin only)
 */
async function approveApplication(req, res) {
  try {
    const { id } = req.params;

    const application = await prisma.registration.findUnique({
      where: { id: parseInt(id) },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    if (application.application_status !== "pending") {
      return res.status(400).json({ error: "Application has already been processed." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id: parseInt(id) },
        data: { application_status: "approved" },
      });

      await tx.housing.update({
        where: { id: application.housing_id },
        data: { occupancy_status: "occupied" },
      });
    });

    res.json({ message: "Application approved successfully." });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * PUT /api/applications/:id/reject
 * Reject an application (Admin only)
 */
async function rejectApplication(req, res) {
  try {
    const { id } = req.params;

    const application = await prisma.registration.findUnique({
      where: { id: parseInt(id) },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    if (application.application_status !== "pending") {
      return res.status(400).json({ error: "Application has already been processed." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id: parseInt(id) },
        data: { application_status: "rejected" },
      });

      await tx.housing.update({
        where: { id: application.housing_id },
        data: { occupancy_status: "vacant" },
      });

      // Delete the registration so the employee can apply again
      await tx.registration.delete({
        where: { id: parseInt(id) },
      });
    });

    res.json({ message: "Application rejected. Housing unit is now available." });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  applyForHousing,
  getApplications,
  approveApplication,
  rejectApplication,
};
