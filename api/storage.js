import crypto from 'crypto';
import { sql } from '@vercel/postgres';

const APP_PASSWORD = process.env.APP_PASSWORD || '';

function makeToken(secret) {
  return crypto.createHash('sha256').update(secret || 'open-access').digest('hex');
}

function requireAuth(req, res) {
  if (!APP_PASSWORD) return true;
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token && token === makeToken(APP_PASSWORD)) return true;
  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

async function ensureTables() {
  // Create tables if they don't exist
  await sql`CREATE TABLE IF NOT EXISTS kids (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    photo_data_url TEXT DEFAULT ''
  );`;

  await sql`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    kid_id TEXT REFERENCES kids(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    icon_type TEXT NOT NULL,
    icon_value TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    is_done BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
  );`;

  await sql`CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );`;
  await sql`CREATE TABLE IF NOT EXISTS streaks (
    kid_id TEXT PRIMARY KEY REFERENCES kids(id) ON DELETE CASCADE,
    streak_count INTEGER NOT NULL DEFAULT 0,
    last_perfect_date TEXT,
    longest_streak INTEGER NOT NULL DEFAULT 0
  );`;

  // Ensure columns exist on existing tables (handles previous schema versions)
  await sql`ALTER TABLE kids ADD COLUMN IF NOT EXISTS photo_data_url TEXT DEFAULT '';`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS kid_id TEXT REFERENCES kids(id) ON DELETE CASCADE;`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS title TEXT;`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS icon_type TEXT;`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS icon_value TEXT;`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 1;`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_done BOOLEAN DEFAULT FALSE;`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`;
  await sql`ALTER TABLE streaks ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;`;

  // Normalize any nulls from older rows
  await sql`UPDATE kids SET photo_data_url = '' WHERE photo_data_url IS NULL;`;
  await sql`UPDATE tasks SET is_done = FALSE WHERE is_done IS NULL;`;
  await sql`UPDATE tasks SET is_active = TRUE WHERE is_active IS NULL;`;
  await sql`UPDATE tasks SET "order" = 1 WHERE "order" IS NULL;`;
  await sql`UPDATE streaks SET longest_streak = 0 WHERE longest_streak IS NULL;`;
}

async function seedIfEmpty() {
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM kids;`;
  if (rows[0].count > 0) return;

  const kids = [
    { id: 'kid1', name: 'Alice', color: '#FF6B6B', photoDataUrl: '' },
    { id: 'kid2', name: 'Bob', color: '#4ECDC4', photoDataUrl: '' },
  ];

  const tasks = [
    { id: 'task1', kidId: 'kid1', title: 'Brush teeth', iconType: 'emoji', iconValue: '🪥', order: 1, isDone: false, isActive: true },
    { id: 'task2', kidId: 'kid1', title: 'Make bed', iconType: 'emoji', iconValue: '🛏️', order: 2, isDone: false, isActive: true },
    { id: 'task3', kidId: 'kid1', title: 'Eat breakfast', iconType: 'emoji', iconValue: '🥞', order: 3, isDone: false, isActive: true },
    { id: 'task4', kidId: 'kid1', title: 'Pack backpack', iconType: 'emoji', iconValue: '🎒', order: 4, isDone: false, isActive: true },
    { id: 'task5', kidId: 'kid1', title: 'Walk dog', iconType: 'emoji', iconValue: '🐕', order: 5, isDone: false, isActive: true },
    { id: 'task6', kidId: 'kid1', title: 'Do homework', iconType: 'emoji', iconValue: '📚', order: 6, isDone: false, isActive: true },
    { id: 'task7', kidId: 'kid2', title: 'Brush teeth', iconType: 'emoji', iconValue: '🪥', order: 1, isDone: false, isActive: true },
    { id: 'task8', kidId: 'kid2', title: 'Make bed', iconType: 'emoji', iconValue: '🛏️', order: 2, isDone: false, isActive: true },
    { id: 'task9', kidId: 'kid2', title: 'Eat breakfast', iconType: 'emoji', iconValue: '🥞', order: 3, isDone: false, isActive: true },
    { id: 'task10', kidId: 'kid2', title: 'Pack backpack', iconType: 'emoji', iconValue: '🎒', order: 4, isDone: false, isActive: true },
    { id: 'task11', kidId: 'kid2', title: 'Walk dog', iconType: 'emoji', iconValue: '🐕', order: 5, isDone: false, isActive: true },
    { id: 'task12', kidId: 'kid2', title: 'Do homework', iconType: 'emoji', iconValue: '📚', order: 6, isDone: false, isActive: true },
  ];

  for (const kid of kids) {
    await sql`INSERT INTO kids (id, name, color, photo_data_url) VALUES (${kid.id}, ${kid.name}, ${kid.color}, ${kid.photoDataUrl});`;
  }
  for (const task of tasks) {
    await sql`INSERT INTO tasks (id, kid_id, title, icon_type, icon_value, "order", is_done, is_active)
      VALUES (${task.id}, ${task.kidId}, ${task.title}, ${task.iconType}, ${task.iconValue}, ${task.order}, ${task.isDone}, ${task.isActive});`;
  }
  const today = getCstDateStr();
  await sql`INSERT INTO meta (key, value) VALUES ('lastResetDate', ${today}) ON CONFLICT (key) DO UPDATE SET value = ${today};`;
}

async function getLastResetDate() {
  const { rows } = await sql`SELECT value FROM meta WHERE key = 'lastResetDate';`;
  return rows[0]?.value || null;
}

async function setLastResetDate(dateStr) {
  await sql`INSERT INTO meta (key, value) VALUES ('lastResetDate', ${dateStr}) ON CONFLICT (key) DO UPDATE SET value = ${dateStr};`;
}

async function listData() {
  const kidsResult = await sql`SELECT id, name, color, photo_data_url AS "photoDataUrl" FROM kids ORDER BY name;`;
  const tasksResult = await sql`SELECT id, kid_id AS "kidId", title, icon_type AS "iconType", icon_value AS "iconValue", "order", is_done AS "isDone", is_active AS "isActive" FROM tasks;`;
  const streaksResult = await sql`SELECT kid_id AS "kidId", streak_count AS "streakCount", last_perfect_date AS "lastPerfectDate", longest_streak AS "longestStreak" FROM streaks;`;
  const lastResetDate = await getLastResetDate();
  return { kids: kidsResult.rows, tasks: tasksResult.rows, lastResetDate, streaks: streaksResult.rows };
}

function getCstDateStr() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

function toDateValue(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function dayDiff(prev, current) {
  if (!prev || !current) return null;
  const prevDate = toDateValue(prev);
  const currentDate = toDateValue(current);
  const diffMs = currentDate - prevDate;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

async function updateStreakIfPerfect(kidId, dateStr) {
  const { rows: countsRows } = await sql`
    SELECT
      COUNT(*) FILTER (WHERE is_active) AS "activeCount",
      COUNT(*) FILTER (WHERE is_active AND is_done) AS "doneCount"
    FROM tasks
    WHERE kid_id = ${kidId};
  `;

  const activeCount = Number(countsRows[0]?.activeCount || 0);
  const doneCount = Number(countsRows[0]?.doneCount || 0);
  if (activeCount === 0 || activeCount !== doneCount) return;

  const { rows: streakRows } = await sql`
    SELECT streak_count AS "streakCount", last_perfect_date AS "lastPerfectDate", longest_streak AS "longestStreak"
    FROM streaks
    WHERE kid_id = ${kidId};
  `;
  const current = streakRows[0];
  let nextCount = 1;
  let nextLongest = 1;

  if (current) {
    if (current.lastPerfectDate === dateStr) {
      nextCount = current.streakCount;
    } else {
      const diff = dayDiff(current.lastPerfectDate, dateStr);
      nextCount = diff === 1 ? current.streakCount + 1 : 1;
    }
    nextLongest = Math.max(current.longestStreak || 0, nextCount);
  }

  await sql`
    INSERT INTO streaks (kid_id, streak_count, last_perfect_date, longest_streak)
    VALUES (${kidId}, ${nextCount}, ${dateStr}, ${nextLongest})
    ON CONFLICT (kid_id) DO UPDATE
    SET streak_count = EXCLUDED.streak_count,
        last_perfect_date = EXCLUDED.last_perfect_date,
        longest_streak = EXCLUDED.longest_streak;
  `;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  await ensureTables();
  await seedIfEmpty();

  if (req.method === 'GET') {
    const data = await listData();
    return res.status(200).json(data);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, payload } = req.body || {};

  try {
    switch (action) {
      case 'addKid': {
        const kid = { ...payload, id: `kid${Date.now()}` };
        await sql`INSERT INTO kids (id, name, color, photo_data_url) VALUES (${kid.id}, ${kid.name}, ${kid.color}, ${kid.photoDataUrl || ''});`;
        return res.status(200).json(kid);
      }
      case 'updateKid': {
        const { id, updates } = payload;
        await sql`UPDATE kids SET name = COALESCE(${updates.name}, name), color = COALESCE(${updates.color}, color), photo_data_url = COALESCE(${updates.photoDataUrl}, photo_data_url) WHERE id = ${id};`;
        const updated = await sql`SELECT id, name, color, photo_data_url AS "photoDataUrl" FROM kids WHERE id = ${id};`;
        if (!updated.rows[0]) return res.status(404).json({ error: 'Kid not found' });
        return res.status(200).json(updated.rows[0]);
      }
      case 'deleteKid': {
        const { id } = payload;
        await sql`DELETE FROM kids WHERE id = ${id};`;
        return res.status(200).json({ success: true });
      }
      case 'addTask': {
        const task = { ...payload, id: `task${Date.now()}` };
        await sql`INSERT INTO tasks (id, kid_id, title, icon_type, icon_value, "order", is_done, is_active)
          VALUES (${task.id}, ${task.kidId}, ${task.title}, ${task.iconType}, ${task.iconValue || ''}, ${task.order}, ${task.isDone}, ${task.isActive});`;
        return res.status(200).json(task);
      }
      case 'updateTask': {
        const { id, updates } = payload;
        const existing = await sql`SELECT * FROM tasks WHERE id = ${id};`;
        if (!existing.rows[0]) return res.status(404).json({ error: 'Task not found' });
        await sql`UPDATE tasks
          SET title = COALESCE(${updates.title}, title),
              icon_type = COALESCE(${updates.iconType}, icon_type),
              icon_value = COALESCE(${updates.iconValue}, icon_value),
              "order" = COALESCE(${updates.order}, "order"),
              is_done = COALESCE(${updates.isDone}, is_done),
              is_active = COALESCE(${updates.isActive}, is_active)
          WHERE id = ${id};`;
        const updated = await sql`SELECT id, kid_id AS "kidId", title, icon_type AS "iconType", icon_value AS "iconValue", "order", is_done AS "isDone", is_active AS "isActive" FROM tasks WHERE id = ${id};`;
        if (updates?.isDone === true) {
          const kidId = existing.rows[0].kid_id;
          await updateStreakIfPerfect(kidId, getCstDateStr());
        }
        return res.status(200).json(updated.rows[0]);
      }
      case 'deleteTask': {
        const { id } = payload;
        await sql`DELETE FROM tasks WHERE id = ${id};`;
        return res.status(200).json({ success: true });
      }
      case 'reorderTasks': {
        const { kidId, taskIds } = payload;
        for (let i = 0; i < taskIds.length; i++) {
          await sql`UPDATE tasks SET "order" = ${i + 1} WHERE id = ${taskIds[i]} AND kid_id = ${kidId};`;
        }
        return res.status(200).json({ success: true });
      }
      case 'resetTasksIfNeeded': {
        const today = getCstDateStr();
        const last = await getLastResetDate();
        if (last !== today) {
          await sql`UPDATE tasks SET is_done = FALSE, is_active = FALSE;`;
          await setLastResetDate(today);
        }
        return res.status(200).json({ success: true });
      }
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
