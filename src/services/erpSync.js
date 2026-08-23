// src/services/erpSync.js
import db from '../db/database';

const BASE_URL = '/api/v1/erp'; // prepend your domain when deployed

// Helper to get auth token from settings
const getAuthToken = async () => {
  const rec = await db.settings.get('erpApiToken');
  return rec ? rec.value : '';
};

// Generic push of local records to server (POST)
const pushEntity = async (entityName, records, token) => {
  try {
    await fetch(`${BASE_URL}/${entityName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: records }),
    });
  } catch (e) {
    console.error(`Push ${entityName} failed`, e);
    throw e;
  }
};

// Generic pull from server (GET) and upsert into Dexie
const pullEntity = async (entityName, table, token) => {
  try {
    const res = await fetch(`${BASE_URL}/${entityName}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch ${entityName}`);
    const { data } = await res.json();
    // Simple upsert: clear table then bulkAdd
    await table.clear();
    if (Array.isArray(data) && data.length) {
      await table.bulkAdd(data);
    }
  } catch (e) {
    console.error(`Pull ${entityName} failed`, e);
    throw e;
  }
};

export const syncAll = async () => {
  const token = await getAuthToken();
  if (!token) throw new Error('ERP API token not set');

  const entities = [
    { name: 'customers', table: db.customers },
    { name: 'invoices', table: db.invoices },
    { name: 'inventory', table: db.inventory },
    { name: 'projects', table: db.projects },
    { name: 'tasks', table: db.tasks },
    // Add more entities as needed, e.g., posTransactions
  ];

  const summary = { uploaded: 0, downloaded: 0, errors: [] };

  for (const { name, table } of entities) {
    try {
      const localRecords = await table.toArray();
      await pushEntity(name, localRecords, token);
      summary.uploaded++;
      await pullEntity(name, table, token);
      summary.downloaded++;
    } catch (err) {
      summary.errors.push({ entity: name, error: err.message });
    }
  }

  return summary;
};
