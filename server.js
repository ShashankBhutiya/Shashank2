require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

app.use(express.json());
app.use(express.static('public'));

// Mock user data
const users = [];

// Signup endpoint (registers a new user and logs them in)
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = { id: users.length + 1, username, password: hashedPassword };
  users.push(user);

  // Automatically log in by generating a token
  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ message: 'Signup successful!', token });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful!', token });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Protected Dashboard route
app.get('/dashboard', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    res.send('Welcome to your dashboard, authenticated user!');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
