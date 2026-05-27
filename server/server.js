const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));

// Admin routes
app.use('/api/courses', require('./routes/courses'));
app.use('/api/students', require('./routes/students'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'E-Learning Admin API is running', version: '1.0.0' });
});

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

// --- Database Sync & Server Start ---
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    
    // Sync models (safe - no destructive alter)
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized.');

    app.listen(PORT,'0.0.0.0', () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  }
};

startServer();
