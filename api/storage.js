import { sql } from '@vercel/postgres';
import crypto from 'crypto';

const APP_PASSWORD = process.env.APP_PASSWORD || '';

function makeToken(secret) {
  return crypto.createHash('sha256').update(secret || 'open-access').digest('hex');
}

function requireAuth(req, res) {
  if (!APP_PASSWORD) return true; // open access if no password set
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token && token === makeToken(APP_PASSWORD)) return true;
  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  try {
    if (req.method === 'GET') {
      const kidsResult = await sql`SELECT * FROM kids ORDER BY id`;
      const tasksResult = await sql`SELECT * FROM tasks ORDER BY "order"`;
      const settingsResult = await sql`SELECT value FROM settings WHERE key = 'lastResetDate'`;
      const lastResetDate = settingsResult.rows[0]?.value || new Date().toISOString().split('T')[0];
      return res.status(200).json({ kids: kidsResult.rows, tasks: tasksResult.rows, lastResetDate });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, payload } = req.body || {};

    switch (action) {
      case 'addKid': {
        const id = `kid${Date.now()}`;
        const result = await sql`INSERT INTO kids (id, name, color, photoDataUrl) VALUES (${id}, ${payload.name}, ${payload.color}, ${payload.photoDataUrl}) RETURNING *`;
        return res.status(200).json(result.rows[0]);
      }
      case 'updateKid': {
        const result = await sql`UPDATE kids SET name = ${payload.updates.name}, color = ${payload.updates.color}, photoDataUrl = ${payload.updates.photoDataUrl} WHERE id = ${payload.id} RETURNING *`;
        if (result.rows.length === 0) return res.status(404).json({ error: 'Kid not found' });
        return res.status(200).json(result.rows[0]);
      }
      case 'deleteKid': {
        await sql`DELETE FROM tasks WHERE kidId = ${payload.id}`;
        await sql`DELETE FROM kids WHERE id = ${payload.id}`;
        return res.status(200).json({ success: true });
      }
      case 'addTask': {
        const id = `task${Date.now()}`;
        const result = await sql`INSERT INTO tasks (id, kidId, title, iconType, iconValue, "order", isDone, isActive) VALUES (${id}, ${payload.kidId}, ${payload.title}, ${payload.iconType}, ${payload.iconValue}, ${payload.order}, ${payload.isDone}, ${payload.isActive}) RETURNING *`;
        return res.status(200).json(result.rows[0]);
      }
      case 'updateTask': {
        const result = await sql`UPDATE tasks SET title = ${payload.updates.title}, iconType = ${payload.updates.iconType}, iconValue = ${payload.updates.iconValue}, "order" = ${payload.updates.order}, isDone = ${payload.updates.isDone}, isActive = ${payload.updates.isActive} WHERE id = ${payload.id} RETURNING *`;
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        return res.status(200).json(result.rows[0]);
      }
      case 'deleteTask': {
        await sql`DELETE FROM tasks WHERE id = ${payload.id}`;
        return res.status(200).json({ success: true });
      }
      case 'reorderTasks': {
        const { kidId, taskIds } = payload;
        for (let i = 0; i < taskIds.length; i++) {
          await sql`UPDATE tasks SET "order" = ${i + 1} WHERE id = ${taskIds[i]} AND kidId = ${kidId}`;
        }
        return res.status(200).json({ success: true });
      }
      case 'resetTasksIfNeeded': {
        const today = new Date().toISOString().split('T')[0];
        const settingsResult = await sql`SELECT value FROM settings WHERE key = 'lastResetDate'`;
        const lastResetDate = settingsResult.rows[0]?.value;
        if (lastResetDate !== today) {
          await sql`UPDATE tasks SET isDone = false`;
          await sql`INSERT INTO settings (key, value) VALUES ('lastResetDate', ${today}) ON CONFLICT (key) DO UPDATE SET value = ${today}`;
        }
        return res.status(200).json({ success: true });
      }
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
