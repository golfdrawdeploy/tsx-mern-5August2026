require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const { ensureSeedUser } = require('./models/User');
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const app = express();

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
console.log(process.env.MONGO_URI);
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://starwars:vTp5YrsKsR4YbZfU@cluster0.9eusmlt.mongodb.net/?appName=Cluster0';

app.use(
  cors({
    origin: CLIENT_ORIGIN, // must be an exact origin (not '*') for credentials to work
    credentials: true, // allows the httpOnly refresh cookie to be sent/received
  }),
);
app.use(express.json());
app.use(cookieParser());

// Health check - handy for confirming the backend is up before wiring the frontend.
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);

// Centralized error handler - catches anything thrown/rejected in route handlers
// that wasn't already handled, so the client always gets JSON, never an HTML stack trace.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log('[mongo DB] connected');

  await ensureSeedUser({
    username: process.env.SEED_USERNAME || 'admin',
    password: process.env.SEED_PASSWORD || 'password123',
  });

  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
