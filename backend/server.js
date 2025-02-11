const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Import User model
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3000; // Use Render's PORT or fallback to 3000

// Debugging: Log the port being used
console.log('Starting server...');
console.log('PORT:', port);

// Middleware
app.use(cors({
  origin: 'https://bettercar-dev1.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };

    res.json({
      status: 'ok',
      timestamp: new Date(),
      server: 'running',
      database: dbStatus[dbState],
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Auth middleware to protect dashboard routes
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.redirect('/login');
    }
};

// Apply auth middleware to dashboard routes
app.use(['/dashboard', '/admin-dashboard'], authMiddleware);

// Dashboard routes with absolute paths
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard/dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard/admin-dashboard.html'));
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log('Attempting MongoDB connection...');
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      retryWrites: true
    };

    await mongoose.connect(mongoURI, options);
    console.log('MongoDB Connected Successfully');

    // Clear existing users for testing
    try {
      await User.collection.drop();
      console.log('Cleared users collection');
    } catch (error) {
      console.log('No users collection to clear');
    }
  } catch (error) {
    console.error('MongoDB Connection Error Details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    process.exit(1);
  }
};

// Signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { email, username, password, userType } = req.body;

    console.log('Signup attempt:', {
      email,
      username,
      userType,
      password: '****'
    });

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user with plain password for testing
    const user = new User({
      email,
      username,
      password, // Store password directly for testing
      userType: userType || 'user'
    });

    await user.save();
    console.log('User created:', user);

    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'test-secret-key', // Use JWT_SECRET from .env
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      userType: user.userType
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Direct password comparison for testing
    if (password !== user.password) {
      console.log('Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'test-secret-key', // Use JWT_SECRET from .env
      { expiresIn: '24h' }
    );

    console.log('Login successful');
    res.json({
      success: true,
      token,
      userType: user.userType
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test route to view users
app.get('/api/test/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve frontend routes
app.get('/dashboard/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', req.path));
});

// Static file serving
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use('/styles', express.static(path.join(__dirname, '../frontend/styles')));
app.use('/scripts', express.static(path.join(__dirname, '../frontend/scripts')));

// Route handlers for frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/auth/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/auth/signup.html'));
});

// Start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});