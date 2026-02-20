const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

/**
 * POST /api/auth/employee/register
 * Register a new employee
 */
async function registerEmployee(req, res) {
  try {
    const {
      employee_id,
      password,
      full_name,
      gender,
      date_of_birth,
      year_of_employment,
      employer_id,
    } = req.body;

    // Validate required fields
    if (!employee_id || !password || !full_name || !gender || !date_of_birth || !year_of_employment || !employer_id) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if employer exists and is authorized
    const employer = await prisma.employer.findUnique({
      where: { id: parseInt(employer_id) },
    });

    if (!employer) {
      return res.status(404).json({ error: "Employer not found." });
    }

    if (!employer.authorized) {
      return res.status(403).json({
        error: "Your employer is not authorized for housing at this time.",
      });
    }

    // Check if employee already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employee_id: String(employee_id) },
    });

    if (existingEmployee) {
      return res.status(409).json({ error: "Employee ID already registered." });
    }

    // Hash password and create employee
    const password_hash = await bcrypt.hash(password, 10);

    const employee = await prisma.employee.create({
      data: {
        employee_id: String(employee_id),
        password_hash,
        full_name,
        gender,
        date_of_birth: new Date(date_of_birth),
        year_of_employment: parseInt(year_of_employment),
        employer_id: parseInt(employer_id),
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: employee.id, employee_id: employee.employee_id, role: "staff" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: employee.id,
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        role: "staff",
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * POST /api/auth/employee/login
 * Login as employee
 */
async function loginEmployee(req, res) {
  try {
    const { employee_id, password } = req.body;

    if (!employee_id || !password) {
      return res.status(400).json({ error: "Employee ID and password are required." });
    }

    const employee = await prisma.employee.findUnique({
      where: { employee_id: String(employee_id) },
    });

    if (!employee) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(password, employee.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: employee.id, employee_id: employee.employee_id, role: "staff" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: employee.id,
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        role: "staff",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * POST /api/auth/admin/login
 * Login as admin
 */
async function loginAdmin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { registerEmployee, loginEmployee, loginAdmin };
