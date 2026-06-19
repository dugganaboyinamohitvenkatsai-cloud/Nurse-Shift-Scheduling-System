const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to the PostgreSQL database.');
  
  // Create Tables
  client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      "nurseId" TEXT
    );

    CREATE TABLE IF NOT EXISTS nurses (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      "availableHours" INTEGER,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS wards (
      id TEXT PRIMARY KEY,
      name TEXT,
      capacity INTEGER,
      color TEXT,
      "requiredSkill" TEXT
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      "wardId" TEXT,
      "nurseId" TEXT,
      date TEXT,
      type TEXT,
      "startTime" TEXT,
      "endTime" TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS leaves (
      id TEXT PRIMARY KEY,
      "nurseId" TEXT,
      "startDate" TEXT,
      "endDate" TEXT,
      reason TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      "userId" INTEGER,
      message TEXT,
      type TEXT,
      read INTEGER DEFAULT 0,
      "createdAt" TEXT
    );

    CREATE TABLE IF NOT EXISTS shift_swaps (
      id TEXT PRIMARY KEY,
      "shiftId" TEXT,
      "requestingNurseId" TEXT,
      "targetNurseId" TEXT,
      status TEXT,
      "createdAt" TEXT
    );

    CREATE TABLE IF NOT EXISTS availability (
      id TEXT PRIMARY KEY,
      "nurseId" TEXT,
      date TEXT,
      "isAvailable" INTEGER
    );
  `, async (err) => {
    if (err) {
      console.error('Error creating tables:', err);
      release();
      return;
    }

    // Seed data if empty
    try {
      const res = await client.query("SELECT COUNT(*) AS count FROM users");
      if (parseInt(res.rows[0].count) === 0) {
        console.log("Seeding initial data...");
        const adminPassword = await bcrypt.hash('admin', 10);
        const nursePassword = await bcrypt.hash('nurse', 10);
        
        await client.query(`INSERT INTO users (username, password, role, "nurseId") VALUES ($1, $2, $3, $4)`, ['admin', adminPassword, 'ADMIN', null]);
        await client.query(`INSERT INTO users (username, password, role, "nurseId") VALUES ($1, $2, $3, $4)`, ['alice', nursePassword, 'NURSE', 'n1']);
        
        const nurses = [
          { id: 'n1', name: 'Alice Smith', type: 'RN', availableHours: 40, avatar: 'https://i.pravatar.cc/150?u=alice' },
          { id: 'n2', name: 'Bob Jones', type: 'LPN', availableHours: 36, avatar: 'https://i.pravatar.cc/150?u=bob' },
          { id: 'n3', name: 'Carol White', type: 'CNA', availableHours: 40, avatar: 'https://i.pravatar.cc/150?u=carol' },
          { id: 'n4', name: 'David Brown', type: 'RN', availableHours: 20, avatar: 'https://i.pravatar.cc/150?u=david' },
          { id: 'n5', name: 'Eve Davis', type: 'RN', availableHours: 40, avatar: 'https://i.pravatar.cc/150?u=eve' },
          { id: 'n6', name: 'Frank Miller', type: 'LPN', availableHours: 40, avatar: 'https://i.pravatar.cc/150?u=frank' },
        ];
        
        for (const n of nurses) {
          await client.query(`INSERT INTO nurses (id, name, type, "availableHours", avatar) VALUES ($1, $2, $3, $4, $5)`, 
            [n.id, n.name, n.type, n.availableHours, n.avatar]);
        }

        const wards = [
          { id: 'w1', name: 'Emergency', capacity: 20, color: 'bg-red-500/20 text-red-400 border-red-500/50', requiredSkill: 'RN' },
          { id: 'w2', name: 'ICU', capacity: 10, color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', requiredSkill: 'RN' },
          { id: 'w3', name: 'Pediatrics', capacity: 15, color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', requiredSkill: 'RN' },
          { id: 'w4', name: 'General', capacity: 30, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50', requiredSkill: 'LPN' },
        ];
        
        for (const w of wards) {
          await client.query(`INSERT INTO wards (id, name, capacity, color, "requiredSkill") VALUES ($1, $2, $3, $4, $5)`,
            [w.id, w.name, w.capacity, w.color, w.requiredSkill]);
        }

        const getRelativeDate = (daysOffset) => {
          const d = new Date();
          d.setDate(d.getDate() + daysOffset);
          return d.toISOString().split('T')[0];
        };

        const shifts = [
          { id: 's1', wardId: 'w1', nurseId: 'n1', date: getRelativeDate(0), type: 'Morning', startTime: '07:00', endTime: '15:00', status: 'assigned' },
          { id: 's2', wardId: 'w2', nurseId: null, date: getRelativeDate(0), type: 'Night', startTime: '23:00', endTime: '07:00', status: 'unassigned' },
          { id: 's3', wardId: 'w3', nurseId: 'n3', date: getRelativeDate(1), type: 'Afternoon', startTime: '15:00', endTime: '23:00', status: 'assigned' },
          { id: 's4', wardId: 'w1', nurseId: 'n2', date: getRelativeDate(1), type: 'Morning', startTime: '07:00', endTime: '15:00', status: 'assigned' },
          { id: 's5', wardId: 'w4', nurseId: null, date: getRelativeDate(0), type: 'Afternoon', startTime: '15:00', endTime: '23:00', status: 'unassigned' },
          { id: 's6', wardId: 'w2', nurseId: 'n4', date: getRelativeDate(2), type: 'Morning', startTime: '07:00', endTime: '15:00', status: 'assigned' },
          { id: 's7', wardId: 'w1', nurseId: null, date: getRelativeDate(2), type: 'Night', startTime: '23:00', endTime: '07:00', status: 'unassigned' },
          { id: 's8', wardId: 'w3', nurseId: 'n5', date: getRelativeDate(-1), type: 'Morning', startTime: '07:00', endTime: '15:00', status: 'assigned' },
        ];

        for (const s of shifts) {
          await client.query(`INSERT INTO shifts (id, "wardId", "nurseId", date, type, "startTime", "endTime", status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [s.id, s.wardId, s.nurseId, s.date, s.type, s.startTime, s.endTime, s.status]);
        }

        const leaves = [
          { id: 'lr1', nurseId: 'n1', startDate: getRelativeDate(5), endDate: getRelativeDate(7), reason: 'Personal time off', status: 'pending' },
          { id: 'lr2', nurseId: 'n3', startDate: getRelativeDate(10), endDate: getRelativeDate(10), reason: 'Medical appointment', status: 'approved' },
          { id: 'lr3', nurseId: 'n5', startDate: getRelativeDate(2), endDate: getRelativeDate(4), reason: 'Family emergency', status: 'rejected' },
        ];

        for (const l of leaves) {
          await client.query(`INSERT INTO leaves (id, "nurseId", "startDate", "endDate", reason, status) VALUES ($1, $2, $3, $4, $5, $6)`,
            [l.id, l.nurseId, l.startDate, l.endDate, l.reason, l.status]);
        }

        console.log("Seeding complete.");
      }
    } catch (err) {
      console.error('Error during seeding:', err);
    } finally {
      release();
    }
  });
});

module.exports = pool;
