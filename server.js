require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const nodemailer = require('nodemailer');
const db = require('./db');

const app = express();
app.use(express.json());
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: 'lax'
  }
}));

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  return res.status(401).json({ error: 'Not authenticated' });
}

// Only set up email sending if credentials are present.
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// ---------- Auth ----------
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    req.session.authenticated = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Incorrect password' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

// ---------- Pickups ----------
app.post('/api/pickups', (req, res) => {
  const { name, phone, email, address, city, current, monthly, date, notes } = req.body || {};
  if (!name || !phone || !address || !current) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const pickup = db.insert({ name, phone, email, address, city, current, monthly, date, notes });

  if (transporter && process.env.NOTIFY_EMAIL) {
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: `New pickup request: ${name} (${current} tires)`,
      text:
        `Name: ${name}\n` +
        `Phone: ${phone}\n` +
        `Email: ${email || '-'}\n` +
        `Address: ${address}, ${city || ''}\n` +
        `Tires on hand: ${current}\n` +
        `Est. tires/month: ${monthly || '-'}\n` +
        `Preferred date: ${date || 'flexible'}\n` +
        `Notes: ${notes || '-'}\n\n` +
        `View and manage it on your dashboard.`
    }).catch((err) => console.error('Email send failed:', err.message));
  }

  res.json({ ok: true, pickup });
});

app.get('/api/pickups', requireAuth, (req, res) => {
  res.json(db.all());
});

app.patch('/api/pickups/:id', requireAuth, (req, res) => {
  const updated = db.update(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/pickups/:id', requireAuth, (req, res) => {
  db.remove(req.params.id);
  res.json({ ok: true });
});

// ---------- Static site (after API routes) ----------
// ---------- Static site ----------
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Tire Disposal & Distribution server running on port ${PORT}`));
