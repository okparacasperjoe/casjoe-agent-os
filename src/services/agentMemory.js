import db from '../db/database';

/**
 * Agent Memory & Context Service
 * Manages long-term vector/keyword memory, learned workflows, and task history in IndexedDB.
 */

export async function saveMemory({ key, category, content }) {
  try {
    const existing = await db.agentMemory.where({ key }).first();
    const now = new Date().toISOString();
    if (existing) {
      await db.agentMemory.update(existing.id, { content, updatedAt: now });
    } else {
      await db.agentMemory.add({
        key,
        category: category || 'general',
        content,
        createdAt: now
      });
    }
    return { success: true };
  } catch (err) {
    console.error('Error saving memory:', err);
    return { success: false, error: err.message };
  }
}

export async function searchMemory(query) {
  try {
    const all = await db.agentMemory.toArray();
    if (!query) return all.slice(0, 10);
    const qLower = query.toLowerCase();
    return all.filter(m => 
      m.key?.toLowerCase().includes(qLower) || 
      m.category?.toLowerCase().includes(qLower) || 
      m.content?.toLowerCase().includes(qLower)
    ).slice(0, 10);
  } catch (err) {
    console.error('Error searching memory:', err);
    return [];
  }
}

export async function logAgentTask({ taskId, goal, status = 'running', agentType = 'CEO Agent', steps = [], result = null }) {
  try {
    const now = new Date().toISOString();
    const existing = await db.agentTasks.where({ taskId }).first();

    if (existing) {
      await db.agentTasks.update(existing.id, {
        status,
        steps,
        result,
        updatedAt: now
      });
      return existing.id;
    } else {
      const id = await db.agentTasks.add({
        taskId,
        goal,
        status,
        agentType,
        steps,
        result,
        createdAt: now,
        updatedAt: now
      });
      return id;
    }
  } catch (err) {
    console.error('Error logging task:', err);
    return null;
  }
}

export async function getRecentAgentTasks(limit = 15) {
  try {
    return await db.agentTasks.orderBy('id').reverse().limit(limit).toArray();
  } catch {
    return [];
  }
}
