const prisma = require("../utils/prisma");

/**
 * GET /api/employers
 * List all employers
 */
async function getEmployers(req, res) {
  try {
    const employers = await prisma.employer.findMany({
      orderBy: { employer_name: "asc" },
    });
    res.json(employers);
  } catch (err) {
    console.error("Get employers error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * POST /api/employers
 * Add a new employer (Admin only)
 */
async function createEmployer(req, res) {
  try {
    const { employer_id, employer_name } = req.body;

    if (!employer_id || !employer_name) {
      return res.status(400).json({ error: "Employer ID and name are required." });
    }

    const existing = await prisma.employer.findUnique({
      where: { employer_id },
    });

    if (existing) {
      return res.status(409).json({ error: "Employer ID already exists." });
    }

    const employer = await prisma.employer.create({
      data: { employer_id, employer_name },
    });

    res.status(201).json({ message: "Employer created.", employer });
  } catch (err) {
    console.error("Create employer error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * PUT /api/employers/:id/authorize
 * Toggle employer authorization (Admin only)
 */
async function authorizeEmployer(req, res) {
  try {
    const { id } = req.params;

    const employer = await prisma.employer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!employer) {
      return res.status(404).json({ error: "Employer not found." });
    }

    const updated = await prisma.employer.update({
      where: { id: parseInt(id) },
      data: { authorized: !employer.authorized },
    });

    res.json({
      message: `Employer ${updated.authorized ? "authorized" : "deauthorized"}.`,
      employer: updated,
    });
  } catch (err) {
    console.error("Authorize employer error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { getEmployers, createEmployer, authorizeEmployer };
