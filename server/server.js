require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH API ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, nurseId: user.nurseId }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, nurseId: user.nurseId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password, name, type, availableHours, avatar } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.length > 0) return res.status(400).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newNurseId = 'n' + Date.now();
    const defaultAvatar = avatar || `https://i.pravatar.cc/150?u=${username}`;

    await pool.query('INSERT INTO nurses (id, name, type, "availableHours", avatar) VALUES ($1, $2, $3, $4, $5)',
      [newNurseId, name, type || 'RN', availableHours || 40, defaultAvatar]);

    const { rows: insertedUsers } = await pool.query('INSERT INTO users (username, password, role, "nurseId") VALUES ($1, $2, $3, $4) RETURNING id',
      [username, hashedPassword, 'NURSE', newNurseId]);

    const newUserId = insertedUsers[0].id;
    const token = jwt.sign({ id: newUserId, username, role: 'NURSE', nurseId: newNurseId }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: newUserId, username, role: 'NURSE', nurseId: newNurseId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/profile', authenticate, async (req, res) => {
  if (req.user.role !== 'NURSE') return res.status(403).json({ error: 'Only nurses have profiles' });
  try {
    const { rows } = await pool.query('SELECT * FROM nurses WHERE id = $1', [req.user.nurseId]);
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile', authenticate, async (req, res) => {
  if (req.user.role !== 'NURSE') return res.status(403).json({ error: 'Only nurses have profiles' });
  const { name, type, availableHours, avatar, password } = req.body;
  
  try {
    await pool.query('UPDATE nurses SET name = $1, type = $2, "availableHours" = $3, avatar = $4 WHERE id = $5',
      [name, type, availableHours, avatar, req.user.nurseId]);
      
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password = $1 WHERE "nurseId" = $2', [hashedPassword, req.user.nurseId]);
    }
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RESOURCE APIs ---

app.get('/api/nurses', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM nurses');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/wards', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM wards');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/shifts', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM shifts');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/shifts', authenticate, async (req, res) => {
  const { id, wardId, nurseId, date, type, startTime, endTime, status } = req.body;
  const newId = id || 's' + Date.now();
  try {
    await pool.query('INSERT INTO shifts (id, "wardId", "nurseId", date, type, "startTime", "endTime", status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [newId, wardId, nurseId || null, date, type, startTime, endTime, status]);
    res.status(201).json({ id: newId, wardId, nurseId, date, type, startTime, endTime, status });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/shifts/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { nurseId, status } = req.body;
  try {
    await pool.query('UPDATE shifts SET "nurseId" = $1, status = $2 WHERE id = $3', [nurseId, status, id]);
    
    if (nurseId && status === 'assigned') {
      const { rows } = await pool.query('SELECT id FROM users WHERE "nurseId" = $1', [nurseId]);
      if (rows.length > 0) {
        const notifId = 'n' + Date.now() + Math.random().toString().slice(2, 6);
        await pool.query('INSERT INTO notifications (id, "userId", message, type, "createdAt") VALUES ($1, $2, $3, $4, $5)',
          [notifId, rows[0].id, 'You have been assigned a new shift', 'shift', new Date().toISOString()]);
      }
    }
    res.json({ message: 'Shift updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/leaves', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM leaves');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/leaves', authenticate, async (req, res) => {
  const { id, nurseId, startDate, endDate, reason, status } = req.body;
  const newId = id || 'lr' + Date.now();
  try {
    await pool.query('INSERT INTO leaves (id, "nurseId", "startDate", "endDate", reason, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [newId, nurseId, startDate, endDate, reason, status || 'pending']);
    res.status(201).json({ id: newId, nurseId, startDate, endDate, reason, status: status || 'pending' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/leaves/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE leaves SET status = $1 WHERE id = $2', [status, id]);
    
    const { rows: leaves } = await pool.query('SELECT "nurseId" FROM leaves WHERE id = $1', [id]);
    if (leaves.length > 0) {
      const { rows: users } = await pool.query('SELECT id FROM users WHERE "nurseId" = $1', [leaves[0].nurseId]);
      if (users.length > 0) {
        const notifId = 'n' + Date.now() + Math.random().toString().slice(2, 6);
        await pool.query('INSERT INTO notifications (id, "userId", message, type, "createdAt") VALUES ($1, $2, $3, $4, $5)',
          [notifId, users[0].id, `Your leave request was ${status}`, 'leave', new Date().toISOString()]);
      }
    }
    res.json({ message: 'Leave request updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- NOTIFICATIONS API ---
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM notifications WHERE "userId" = $1 ORDER BY "createdAt" DESC', [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/notifications/:id/read', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notifications SET read = 1 WHERE id = $1 AND "userId" = $2', [id, req.user.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- SHIFT SWAPS API ---
app.get('/api/swaps', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM shift_swaps');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/swaps', authenticate, async (req, res) => {
  const { shiftId, targetNurseId } = req.body;
  const newId = 'sw' + Date.now();
  try {
    await pool.query('INSERT INTO shift_swaps (id, "shiftId", "requestingNurseId", "targetNurseId", status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
      [newId, shiftId, req.user.nurseId, targetNurseId || null, 'pending', new Date().toISOString()]);
    res.status(201).json({ id: newId, shiftId, requestingNurseId: req.user.nurseId, targetNurseId, status: 'pending' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/swaps/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 
  try {
    await pool.query('UPDATE shift_swaps SET status = $1 WHERE id = $2', [status, id]);
    
    if (status === 'approved') {
      const { rows: swaps } = await pool.query('SELECT * FROM shift_swaps WHERE id = $1', [id]);
      if (swaps.length > 0) {
        const swap = swaps[0];
        const finalNurseId = swap.targetNurseId || req.user.nurseId;
        await pool.query('UPDATE shifts SET "nurseId" = $1 WHERE id = $2', [finalNurseId, swap.shiftId]);
        
        const { rows: originalUsers } = await pool.query('SELECT id FROM users WHERE "nurseId" = $1', [swap.requestingNurseId]);
        if (originalUsers.length > 0) {
          const notifId = 'n' + Date.now() + Math.random().toString().slice(2, 6);
          await pool.query('INSERT INTO notifications (id, "userId", message, type, "createdAt") VALUES ($1, $2, $3, $4, $5)',
            [notifId, originalUsers[0].id, `Your shift swap request was ${status}`, 'swap', new Date().toISOString()]);
        }
      }
    }
    res.json({ message: `Swap ${status}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- AVAILABILITY API ---
app.get('/api/availability', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM availability');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/availability', authenticate, async (req, res) => {
  const { date, isAvailable, nurseId } = req.body;
  const targetNurseId = nurseId || req.user.nurseId;
  if (!targetNurseId) return res.status(400).json({ error: 'nurseId is required' });

  const newId = 'a' + Date.now() + Math.random().toString().slice(2, 6);
  
  try {
    await pool.query('DELETE FROM availability WHERE "nurseId" = $1 AND date = $2', [targetNurseId, date]);
    await pool.query('INSERT INTO availability (id, "nurseId", date, "isAvailable") VALUES ($1, $2, $3, $4)',
      [newId, targetNurseId, date, isAvailable ? 1 : 0]);
    res.status(201).json({ id: newId, nurseId: targetNurseId, date, isAvailable });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
