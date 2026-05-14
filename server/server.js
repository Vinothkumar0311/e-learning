const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));

// Placeholder routes for other modules
app.get('/api', (req, res) => {
  res.json({ message: 'E-Learning Admin API is running' });
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
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  }
};

startServer();
