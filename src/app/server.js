const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3000;

// PostgreSQL Connection
const pool = new Pool({
  user: 'manual_attendance_so',
  password: 'sophic@1234',
  host: 'ls-5c09a7d1083ecac17a10b8ace8e918cc4d155d50.cnlatyjrf3ga.ap-southeast-1.rds.amazonaws.com',
  port: 5432,
  database: 'manual_attendance',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Middleware - IMPORTANT: cors() must be called before routes
app.use(cors());
app.use(express.json());

// Root route - test if server is working
app.get('/', (req, res) => {
  console.log('📞 Root endpoint hit');
  res.json({ message: 'Server is running', endpoints: ['/api/employees', '/api/health'] });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// GET all employees - FIXED: Added console log to verify it's being hit
app.get('/api/employees', async (req, res) => {
  console.log('📞 /api/employees endpoint hit');
  console.log('📞 Query parameters:', req.query);

  try {
    console.log('🔍 Executing database query...');
    const result = await pool.query(
      `SELECT id, employee_id, wwid, name, shift_id,
              created_by, created_date, modified_by, modified_date, state, project_id
       FROM manual_attendance_schema.employee
       ORDER BY id DESC`
    );

    console.log(`✅ Retrieved ${result.rows.length} employees`);

    // Return empty array if no data, not error
    res.json(result.rows);

  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('❌ Full error:', error);

    // Still return empty array on error to prevent frontend crash
    res.status(500).json({
      message: 'Database error: ' + error.message,
      rows: [] // Return empty array for frontend
    });
  }
});

// GET single employee
app.get('/api/employees/:id', async (req, res) => {
  console.log(`📞 GET /api/employees/${req.params.id}`);
  try {
    const result = await pool.query(
      'SELECT * FROM manual_attendance_schema.employee WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: error.message });
  }
});


// POST - Create new employee
app.post('/api/employees', async (req, res) => {
  console.log('📞 POST /api/employees endpoint hit');
  console.log('📦 Request body:', req.body);

  try {
    const { employee_id, wwid, name, shift_id, state, project_id, created_by, modified_by } = req.body;

    // Validate required fields
    if (!employee_id || !wwid || !name) {
      return res.status(400).json({
        message: 'Missing required fields: employee_id, wwid, name'
      });
    }

    console.log('🔍 Inserting new employee into database...');

    const result = await pool.query(
      `INSERT INTO manual_attendance_schema.employee
       (employee_id, wwid, name, shift_id, state, project_id, created_by, created_date, modified_by, modified_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, NOW())
       RETURNING *`,
      [
        employee_id,              // $1
        wwid,                     // $2
        name,                     // $3
        shift_id || null,         // $4
        state || 1,               // $5
        project_id || null,       // $6
        created_by || 1,          // $7
        modified_by || 1          // $8
      ]
    );

    console.log(`✅ Employee created with ID: ${result.rows[0].id}`);

    res.status(201).json({
      message: 'Employee added successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error inserting employee:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({
      message: 'Error adding employee: ' + error.message
    });
  }
});




// DELETE - Delete employee by ID
app.delete('/api/employees/:id', async (req, res) => {
  console.log(`📞 DELETE /api/employees/${req.params.id}`);

  try {
    const id = req.params.id;

    // First check if employee exists
    const checkResult = await pool.query(
      'SELECT id FROM manual_attendance_schema.employee WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete the employee
    const result = await pool.query(
      'DELETE FROM manual_attendance_schema.employee WHERE id = $1 RETURNING id',
      [id]
    );

    console.log(`✅ Employee ${id} deleted successfully`);

    res.json({
      message: 'Employee deleted successfully',
      deletedId: result.rows[0].id
    });

  } catch (error) {
    console.error('❌ Error deleting employee:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({
      message: 'Error deleting employee: ' + error.message
    });
  }
});








// Start server with better error handling
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Available endpoints:`);
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/employees`);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
  }
});
