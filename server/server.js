require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware to authenticate
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
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, nurseId: user.nurseId }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, nurseId: user.nurseId } });
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password, name, type, availableHours, avatar } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'Missing required fields' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newNurseId = 'n' + Date.now();
  const defaultAvatar = avatar || `https://i.pravatar.cc/150?u=${username}`;

  db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Username already taken' });

    db.run("INSERT INTO nurses (id, name, type, availableHours, avatar) VALUES (?, ?, ?, ?, ?)",
      [newNurseId, name, type || 'RN', availableHours || 40, defaultAvatar],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run("INSERT INTO users (username, password, role, nurseId) VALUES (?, ?, ?, ?)",
          [username, hashedPassword, 'NURSE', newNurseId],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const token = jwt.sign({ id: this.lastID, username, role: 'NURSE', nurseId: newNurseId }, JWT_SECRET, { expiresIn: '1d' });
            res.json({ token, user: { id: this.lastID, username, role: 'NURSE', nurseId: newNurseId } });
          });
      });
  });
});

app.get('/api/profile', authenticate, (req, res) => {
  if (req.user.role !== 'NURSE') return res.status(403).json({ error: 'Only nurses have profiles' });
  db.get("SELECT * FROM nurses WHERE id = ?", [req.user.nurseId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.put('/api/profile', authenticate, async (req, res) => {
  if (req.user.role !== 'NURSE') return res.status(403).json({ error: 'Only nurses have profiles' });
  const { name, type, availableHours, avatar, password } = req.body;
  
  db.run("UPDATE nurses SET name = ?, type = ?, availableHours = ?, avatar = ? WHERE id = ?",
    [name, type, availableHours, avatar, req.user.nurseId],
    async function (err) {
      if (err) return res.status(500).json({ error: err.message });
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run("UPDATE users SET password = ? WHERE nurseId = ?", [hashedPassword, req.user.nurseId], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Profile and password updated' });
        });
      } else {
        res.json({ message: 'Profile updated' });
      }
    });
});

// --- RESOURCE APIs ---

app.get('/api/nurses', authenticate, (req, res) => {
  db.all("SELECT * FROM nurses", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/wards', authenticate, (req, res) => {
  db.all("SELECT * FROM wards", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/shifts', authenticate, (req, res) => {
  db.all("SELECT * FROM shifts", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/shifts', authenticate, (req, res) => {
  const { id, wardId, nurseId, date, type, startTime, endTime, status } = req.body;
  const newId = id || 's' + Date.now();

  db.run(`INSERT INTO shifts (id, wardId, nurseId, date, type, startTime, endTime, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [newId, wardId, nurseId || null, date, type, startTime, endTime, status],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: newId, wardId, nurseId, date, type, startTime, endTime, status });
    });
});

app.put('/api/shifts/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { nurseId, status } = req.body;
  db.run(`UPDATE shifts SET nurseId = ?, status = ? WHERE id = ?`, [nurseId, status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    
    if (nurseId && status === 'assigned') {
      db.get("SELECT id FROM users WHERE nurseId = ?", [nurseId], (err, user) => {
        if (user) {
          const notifId = 'n' + Date.now() + Math.random().toString().slice(2, 6);
          db.run("INSERT INTO notifications (id, userId, message, type, createdAt) VALUES (?, ?, ?, ?, ?)",
            [notifId, user.id, `You have been assigned a new shift`, 'shift', new Date().toISOString()]);
        }
      });
    }

    res.json({ message: 'Shift updated' });
  });
});

app.get('/api/leaves', authenticate, (req, res) => {
  db.all("SELECT * FROM leaves", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/leaves', authenticate, (req, res) => {
  const { id, nurseId, startDate, endDate, reason, status } = req.body;
  const newId = id || 'lr' + Date.now();
  db.run(`INSERT INTO leaves (id, nurseId, startDate, endDate, reason, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [newId, nurseId, startDate, endDate, reason, status || 'pending'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: newId, nurseId, startDate, endDate, reason, status: status || 'pending' });
    }
  );
});

app.put('/api/leaves/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run(`UPDATE leaves SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get("SELECT nurseId FROM leaves WHERE id = ?", [id], (err, leave) => {
      if (leave) {
        db.get("SELECT id FROM users WHERE nurseId = ?", [leave.nurseId], (err, user) => {
          if (user) {
            const notifId = 'n' + Date.now() + Math.random().toString().slice(2, 6);
            db.run("INSERT INTO notifications (id, userId, message, type, createdAt) VALUES (?, ?, ?, ?, ?)",
              [notifId, user.id, `Your leave request was ${status}`, 'leave', new Date().toISOString()]);
          }
        });
      }
    });

    res.json({ message: 'Leave request updated' });
  });
});

// --- NOTIFICATIONS API ---
app.get('/api/notifications', authenticate, (req, res) => {
  db.all("SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/notifications/:id/read', authenticate, (req, res) => {
  const { id } = req.params;
  db.run("UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?", [id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Notification marked as read' });
  });
});

// --- SHIFT SWAPS API ---
app.get('/api/swaps', authenticate, (req, res) => {
  db.all("SELECT * FROM shift_swaps", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/swaps', authenticate, (req, res) => {
  const { shiftId, targetNurseId } = req.body;
  const newId = 'sw' + Date.now();
  db.run("INSERT INTO shift_swaps (id, shiftId, requestingNurseId, targetNurseId, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
    [newId, shiftId, req.user.nurseId, targetNurseId || null, 'pending', new Date().toISOString()],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: newId, shiftId, requestingNurseId: req.user.nurseId, targetNurseId, status: 'pending' });
    });
});

app.put('/api/swaps/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 
  
  db.run("UPDATE shift_swaps SET status = ? WHERE id = ?", [status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    if (status === 'approved') {
      db.get("SELECT * FROM shift_swaps WHERE id = ?", [id], (err, swap) => {
        if (!err && swap) {
          const finalNurseId = swap.targetNurseId || req.user.nurseId;
          db.run("UPDATE shifts SET nurseId = ? WHERE id = ?", [finalNurseId, swap.shiftId]);
          
          db.get("SELECT id FROM users WHERE nurseId = ?", [swap.requestingNurseId], (err, originalUser) => {
            if (originalUser) {
              const notifId = 'n' + Date.now() + Math.random().toString().slice(2, 6);
              db.run("INSERT INTO notifications (id, userId, message, type, createdAt) VALUES (?, ?, ?, ?, ?)",
                [notifId, originalUser.id, `Your shift swap request was ${status}`, 'swap', new Date().toISOString()]);
            }
          });
        }
      });
    }
    res.json({ message: `Swap ${status}` });
  });
});

// --- AVAILABILITY API ---
app.get('/api/availability', authenticate, (req, res) => {
  db.all("SELECT * FROM availability", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/availability', authenticate, (req, res) => {
  const { date, isAvailable, nurseId } = req.body;
  const targetNurseId = nurseId || req.user.nurseId;
  
  if (!targetNurseId) return res.status(400).json({ error: 'nurseId is required' });

  const newId = 'a' + Date.now() + Math.random().toString().slice(2, 6);
  
  // Remove existing record for this date to simulate UPSERT
  db.run("DELETE FROM availability WHERE nurseId = ? AND date = ?", [targetNurseId, date], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.run("INSERT INTO availability (id, nurseId, date, isAvailable) VALUES (?, ?, ?, ?)",
      [newId, targetNurseId, date, isAvailable ? 1 : 0],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: newId, nurseId: targetNurseId, date, isAvailable });
      });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
