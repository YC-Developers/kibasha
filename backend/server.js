const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'employee-management-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database connection
const createDatabaseAndTables = async () => {
  try {
    // First create a connection without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS employee_management');

    // Close the initial connection
    await connection.end();

    // Now create the pool with the database specified
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'employee_management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Check if tables exist and create them if they don't
    const [tables] = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'employee_management' AND table_name = 'users'
    `);

    if (tables.length === 0) {
      // Create tables from database.sql file
      const fs = require('fs');
      const path = require('path');
      const sqlScript = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

      // Split the script by semicolons to execute each statement separately
      const statements = sqlScript.split(';').filter(statement => statement.trim() !== '');

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await pool.query(statement);
          } catch (err) {
            console.error('Error executing SQL statement:', err);
            console.error('Statement:', statement);
          }
        }
      }

      console.log('Database and tables created successfully');
    }

    return pool;
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

// Initialize the pool
let pool;
(async () => {
  pool = await createDatabaseAndTables();
})();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Routes

// Helper function to ensure pool is initialized
const ensurePool = async (_req, res, next) => {
  if (!pool) {
    return res.status(503).json({ message: 'Database is initializing, please try again in a moment' });
  }
  next();
};

// Apply the middleware to all routes
app.use(ensurePool);

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName, email } = req.body;

    // Validate input
    if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username or email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (username, password, first_name, last_name, email) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, firstName, lastName, email]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/user', isAuthenticated, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, first_name, last_name, email FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    res.json({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee routes

// Get all employees
app.get('/api/employees', isAuthenticated, async (_req, res) => {
  try {
    const [employees] = await pool.query('SELECT * FROM employees ORDER BY last_name, first_name');
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee by ID
app.get('/api/employees/:id', isAuthenticated, async (req, res) => {
  try {
    const [employees] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create employee
app.post('/api/employees', isAuthenticated, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, position, department, hireDate } = req.body;

    // Validate input
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    // Check if email already exists
    const [existingEmployees] = await pool.query('SELECT * FROM employees WHERE email = ?', [email]);

    if (existingEmployees.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Insert employee
    const [result] = await pool.query(
      'INSERT INTO employees (first_name, last_name, email, phone, address, position, department, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone, address, position, department, hireDate]
    );

    res.status(201).json({ message: 'Employee created successfully', employeeId: result.insertId });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employee
app.put('/api/employees/:id', isAuthenticated, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, position, department, hireDate } = req.body;

    // Validate input
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    // Check if email already exists for another employee
    const [existingEmployees] = await pool.query(
      'SELECT * FROM employees WHERE email = ? AND id != ?',
      [email, req.params.id]
    );

    if (existingEmployees.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Update employee
    await pool.query(
      'UPDATE employees SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, position = ?, department = ?, hire_date = ? WHERE id = ?',
      [firstName, lastName, email, phone, address, position, department, hireDate, req.params.id]
    );

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete employee
app.delete('/api/employees/:id', isAuthenticated, async (req, res) => {
  try {
    // Delete employee (cascade will delete related salaries)
    await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Salary routes

// Get all salaries
app.get('/api/salaries', isAuthenticated, async (_req, res) => {
  try {
    const [salaries] = await pool.query(`
      SELECT s.*, e.first_name, e.last_name
      FROM salaries s
      JOIN employees e ON s.employee_id = e.id
      ORDER BY s.effective_date DESC
    `);

    res.json(salaries);
  } catch (error) {
    console.error('Get salaries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get salaries by employee ID
app.get('/api/employees/:id/salaries', isAuthenticated, async (req, res) => {
  try {
    const [salaries] = await pool.query(
      'SELECT * FROM salaries WHERE employee_id = ? ORDER BY effective_date DESC',
      [req.params.id]
    );

    res.json(salaries);
  } catch (error) {
    console.error('Get employee salaries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create salary
app.post('/api/salaries', isAuthenticated, async (req, res) => {
  try {
    const { employeeId, amount, effectiveDate, endDate } = req.body;

    // Validate input
    if (!employeeId || !amount || !effectiveDate) {
      return res.status(400).json({ message: 'Employee ID, amount, and effective date are required' });
    }

    // Check if employee exists
    const [employees] = await pool.query('SELECT * FROM employees WHERE id = ?', [employeeId]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Insert salary
    const [result] = await pool.query(
      'INSERT INTO salaries (employee_id, amount, effective_date, end_date) VALUES (?, ?, ?, ?)',
      [employeeId, amount, effectiveDate, endDate]
    );

    res.status(201).json({ message: 'Salary created successfully', salaryId: result.insertId });
  } catch (error) {
    console.error('Create salary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update salary
app.put('/api/salaries/:id', isAuthenticated, async (req, res) => {
  try {
    const { amount, effectiveDate, endDate } = req.body;

    // Validate input
    if (!amount || !effectiveDate) {
      return res.status(400).json({ message: 'Amount and effective date are required' });
    }

    // Update salary
    await pool.query(
      'UPDATE salaries SET amount = ?, effective_date = ?, end_date = ? WHERE id = ?',
      [amount, effectiveDate, endDate, req.params.id]
    );

    res.json({ message: 'Salary updated successfully' });
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete salary
app.delete('/api/salaries/:id', isAuthenticated, async (req, res) => {
  try {
    await pool.query('DELETE FROM salaries WHERE id = ?', [req.params.id]);

    res.json({ message: 'Salary deleted successfully' });
  } catch (error) {
    console.error('Delete salary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reports

// Get department summary
app.get('/api/reports/departments', isAuthenticated, async (_req, res) => {
  try {
    const [departments] = await pool.query(`
      SELECT
        department,
        COUNT(*) as employee_count,
        AVG(s.amount) as average_salary,
        MIN(s.amount) as min_salary,
        MAX(s.amount) as max_salary
      FROM employees e
      LEFT JOIN (
        SELECT employee_id, amount
        FROM salaries s1
        WHERE (employee_id, effective_date) IN (
          SELECT employee_id, MAX(effective_date)
          FROM salaries
          WHERE end_date IS NULL OR end_date > CURDATE()
          GROUP BY employee_id
        )
      ) s ON e.id = s.employee_id
      GROUP BY department
      ORDER BY department
    `);

    res.json(departments);
  } catch (error) {
    console.error('Department report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});