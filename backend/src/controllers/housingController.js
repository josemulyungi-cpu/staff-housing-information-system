const prisma = require("../utils/prisma");

/**
 * GET /api/housing
 * List housing with optional filters
 */
async function getHousing(req, res) {
  try {
    const { town_location, block_name, floor_number, house_type_id, min_rent, max_rent } = req.query;

    const where = {};

    if (town_location) where.town_location = town_location;
    if (block_name) where.block_name = block_name;
    if (floor_number) where.floor_number = parseInt(floor_number);
    if (house_type_id) where.house_type_id = parseInt(house_type_id);

    if (min_rent || max_rent) {
      where.monthly_rent = {};
      if (min_rent) where.monthly_rent.gte = parseFloat(min_rent);
      if (max_rent) where.monthly_rent.lte = parseFloat(max_rent);
    }

    const housing = await prisma.housing.findMany({
      where,
      include: { house_type: true },
      orderBy: [{ town_location: "asc" }, { block_name: "asc" }, { floor_number: "asc" }],
    });

    res.json(housing);
  } catch (err) {
    console.error("Get housing error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * GET /api/housing/:id
 * Get single housing unit
 */
async function getHousingById(req, res) {
  try {
    const housing = await prisma.housing.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { house_type: true },
    });

    if (!housing) {
      return res.status(404).json({ error: "Housing unit not found." });
    }

    res.json(housing);
  } catch (err) {
    console.error("Get housing by ID error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * POST /api/housing
 * Create a new housing unit (Admin only)
 */
async function createHousing(req, res) {
  try {
    const {
      county,
      town_location,
      block_name,
      floor_number,
      house_type_id,
      monthly_rent,
      payment_duration_months,
    } = req.body;

    if (!county || !town_location || !block_name || floor_number === undefined || !house_type_id || !monthly_rent || !payment_duration_months) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const housing = await prisma.housing.create({
      data: {
        county,
        town_location,
        block_name,
        floor_number: parseInt(floor_number),
        house_type_id: parseInt(house_type_id),
        monthly_rent: parseFloat(monthly_rent),
        payment_duration_months: parseInt(payment_duration_months),
      },
      include: { house_type: true },
    });

    res.status(201).json({ message: "Housing unit created.", housing });
  } catch (err) {
    console.error("Create housing error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * PUT /api/housing/:id
 * Update a housing unit (Admin only)
 */
async function updateHousing(req, res) {
  try {
    const { id } = req.params;
    const {
      county,
      town_location,
      block_name,
      floor_number,
      house_type_id,
      monthly_rent,
      payment_duration_months,
    } = req.body;

    const existing = await prisma.housing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Housing unit not found." });
    }

    const housing = await prisma.housing.update({
      where: { id: parseInt(id) },
      data: {
        ...(county && { county }),
        ...(town_location && { town_location }),
        ...(block_name && { block_name }),
        ...(floor_number !== undefined && { floor_number: parseInt(floor_number) }),
        ...(house_type_id && { house_type_id: parseInt(house_type_id) }),
        ...(monthly_rent && { monthly_rent: parseFloat(monthly_rent) }),
        ...(payment_duration_months && { payment_duration_months: parseInt(payment_duration_months) }),
      },
      include: { house_type: true },
    });

    res.json({ message: "Housing unit updated.", housing });
  } catch (err) {
    console.error("Update housing error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * DELETE /api/housing/:id
 * Delete a housing unit (Admin only, only if vacant)
 */
async function deleteHousing(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.housing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Housing unit not found." });
    }

    if (existing.occupancy_status !== "vacant") {
      return res.status(400).json({ error: "Cannot delete a housing unit that is not vacant." });
    }

    await prisma.housing.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Housing unit deleted." });
  } catch (err) {
    console.error("Delete housing error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * GET /api/housing/filters/options
 * Get distinct filter values for the frontend
 */
async function getFilterOptions(req, res) {
  try {
    const towns = await prisma.housing.findMany({
      select: { town_location: true },
      distinct: ["town_location"],
      orderBy: { town_location: "asc" },
    });

    const blocks = await prisma.housing.findMany({
      select: { block_name: true },
      distinct: ["block_name"],
      orderBy: { block_name: "asc" },
    });

    const floors = await prisma.housing.findMany({
      select: { floor_number: true },
      distinct: ["floor_number"],
      orderBy: { floor_number: "asc" },
    });

    const houseTypes = await prisma.houseType.findMany({
      orderBy: { house_type_name: "asc" },
    });

    res.json({
      towns: towns.map((t) => t.town_location),
      blocks: blocks.map((b) => b.block_name),
      floors: floors.map((f) => f.floor_number),
      houseTypes,
    });
  } catch (err) {
    console.error("Get filter options error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  getHousing,
  getHousingById,
  createHousing,
  updateHousing,
  deleteHousing,
  getFilterOptions,
};
