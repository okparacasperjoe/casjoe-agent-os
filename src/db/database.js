import Dexie from 'dexie';

// Initialize Dexie database
const db = new Dexie('CasjoeOfflineAIDB');

// Define the database schema
db.version(1).stores({
  customers: '++id, name, company, location, phone, totalSpent, status, createdAt',
  invoices: '++id, invoiceId, customer, amount, currency, date, status, items, createdAt',
  chatMessages: '++id, conversationId, sender, text, time, createdAt',
  documents: '++id, name, size, type, pages, date, summary, createdAt',
  settings: 'key, value'
});

db.version(2).stores({
  inventory: '++id, sku, name, category, quantity, price, location, status, createdAt'
});

db.version(3).stores({
  agentTasks: '++id, taskId, goal, status, agentType, steps, result, createdAt, updatedAt',
  agentMemory: '++id, key, category, content, vector, createdAt'
});

db.version(4).stores({
  projects: '++id, name, description, status, createdAt, updatedAt',
  tasks: '++id, title, projectId, status, dueDate, createdAt, updatedAt'
});

/**
 * Seeds the database with initial mock data if the tables are empty.
 */
export const initializeDatabase = async () => {
  try {
    const now = new Date().toISOString();

    // Check and seed customers
    const customerCount = await db.customers.count();
    if (customerCount === 0) {
      await db.customers.bulkAdd([
        { name: 'Amina Bello', company: 'Sahara Logistics Ltd', location: 'Lagos, Nigeria', phone: '+234 802 123 4567', totalSpent: '₦4.2M', status: 'Active', createdAt: now },
        { name: 'Kwame Mensah', company: 'Gold Coast Traders', location: 'Accra, Ghana', phone: '+233 24 555 0192', totalSpent: 'GHS 85,000', status: 'Active', createdAt: now },
        { name: 'David Ochieng', company: 'Nairobi Health Hub', location: 'Nairobi, Kenya', phone: '+254 712 345 678', totalSpent: 'KSh 1.4M', status: 'Active', createdAt: now },
        { name: 'Sipho Dlamini', company: 'Cape Solar Systems', location: 'Johannesburg, South Africa', phone: '+27 82 999 4433', totalSpent: 'ZAR 240,000', status: 'Pending', createdAt: now },
        { name: 'Dr. Fatima Umar', company: 'Kano Community Clinic', location: 'Kano, Nigeria', phone: '+234 803 888 1122', totalSpent: '₦3.1M', status: 'Active', createdAt: now }
      ]);
    }

    // Check and seed invoices
    const invoiceCount = await db.invoices.count();
    if (invoiceCount === 0) {
      await db.invoices.bulkAdd([
        { invoiceId: 'INV-2026-001', customer: 'Sahara Logistics Ltd', amount: '₦1,850,000', currency: 'NGN', date: '2026-07-28', status: 'Paid', items: 'Casjoe Agent OS Hub x2', createdAt: now },
        { invoiceId: 'INV-2026-002', customer: 'Nairobi Health Hub', amount: 'KSh 450,000', currency: 'KES', date: '2026-07-25', status: 'Pending', items: 'Medical RAG License & 8GB Laptop Config', createdAt: now },
        { invoiceId: 'INV-2026-003', customer: 'Gold Coast Traders', amount: 'GHS 32,000', currency: 'GHS', date: '2026-07-20', status: 'Paid', items: 'Offline CRM System Setup', createdAt: now },
        { invoiceId: 'INV-2026-004', customer: 'Kano Community Clinic', amount: '₦1,200,000', currency: 'NGN', date: '2026-07-18', status: 'Paid', items: 'Offline Telehealth Knowledge Base', createdAt: now }
      ]);
    }

    // Check and seed documents
    const docCount = await db.documents.count();
    if (docCount === 0) {
      await db.documents.bulkAdd([
        { name: 'Business_Proposal.pdf', size: '2.4 MB', type: 'pdf', pages: 18, date: '2026-07-20', summary: 'Contains terms for client engagement, milestones, payment schedule, and service scope.', createdAt: now },
        { name: 'HR_Policy.docx', size: '1.3 MB', type: 'docx', pages: 24, date: '2026-07-15', summary: 'Standard operating procedures, staff leave allowance, code of conduct, and finance policies.', createdAt: now },
        { name: 'Sales_Report.xlsx', size: '985 KB', type: 'xlsx', pages: 4, date: '2026-07-28', summary: 'Quarterly breakdown of sales performance across Lagos, Abuja, Port Harcourt & Kano branches.', createdAt: now },
        { name: 'Operations_Manual.pdf', size: '3.1 MB', type: 'pdf', pages: 32, date: '2026-06-10', summary: 'Hardware setup, offline model installation guide, thermal management on 8GB laptops.', createdAt: now },
        { name: 'Strategy_Deck.docx', size: '2.7 MB', type: 'docx', pages: 15, date: '2026-07-02', summary: '2026 expansion roadmap across West & East African SME hubs with 0% cloud cost.', createdAt: now }
      ]);
    }

    // Check and seed inventory
    const inventoryCount = await db.inventory.count();
    if (inventoryCount === 0) {
      await db.inventory.bulkAdd([
        { sku: 'SKU-001', name: 'Casjoe Agent OS Hub', category: 'Hardware', quantity: 45, price: '850000', location: 'Lagos Warehouse', status: 'In Stock', createdAt: now },
        { sku: 'SKU-002', name: '8GB RAM Upgrade Kit', category: 'Components', quantity: 120, price: '45000', location: 'Lagos Warehouse', status: 'In Stock', createdAt: now },
        { sku: 'SKU-003', name: 'Offline Solar Router', category: 'Hardware', quantity: 12, price: '120000', location: 'Kano Branch', status: 'Low Stock', createdAt: now },
        { sku: 'SKU-004', name: 'Medical RAG License', category: 'Software', quantity: 999, price: '250000', location: 'Digital', status: 'In Stock', createdAt: now },
        { sku: 'SKU-005', name: 'Thermal Cooling Pad', category: 'Accessories', quantity: 0, price: '15000', location: 'Accra Branch', status: 'Out of Stock', createdAt: now }
      ]);
    }
  } catch (error) {
    console.error('Failed to initialize mock database data:', error);
  }
};

/**
 * Dumps all IndexedDB tables to a single JSON backup object.
 */
export async function exportDatabaseToJson() {
  const backup = {
    version: '1.0.2',
    timestamp: new Date().toISOString(),
    appName: 'Casjoe Agent OS',
    tables: {
      customers: await db.customers.toArray(),
      invoices: await db.invoices.toArray(),
      inventory: await db.inventory.toArray(),
      documents: await db.documents.toArray(),
      settings: await db.settings.toArray(),
      agentTasks: await db.agentTasks.toArray(),
      agentMemory: await db.agentMemory.toArray(),
      projects: await db.projects.toArray(),
      tasks: await db.tasks.toArray()
    }
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `casjoe_os_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { success: true, count: Object.keys(backup.tables).length };
}

/**
 * Restores all IndexedDB tables from a valid JSON backup object.
 */
export async function importDatabaseFromJson(jsonString) {
  try {
    const backup = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    if (!backup || !backup.tables) {
      throw new Error('Invalid Casjoe OS backup format.');
    }

    await db.transaction('rw', [
      db.customers, db.invoices, db.inventory, db.documents,
      db.settings, db.agentTasks, db.agentMemory, db.projects, db.tasks
    ], async () => {
      if (backup.tables.customers) {
        await db.customers.clear();
        await db.customers.bulkAdd(backup.tables.customers);
      }
      if (backup.tables.invoices) {
        await db.invoices.clear();
        await db.invoices.bulkAdd(backup.tables.invoices);
      }
      if (backup.tables.inventory) {
        await db.inventory.clear();
        await db.inventory.bulkAdd(backup.tables.inventory);
      }
      if (backup.tables.documents) {
        await db.documents.clear();
        await db.documents.bulkAdd(backup.tables.documents);
      }
      if (backup.tables.settings) {
        await db.settings.clear();
        await db.settings.bulkAdd(backup.tables.settings);
      }
      if (backup.tables.agentTasks) {
        await db.agentTasks.clear();
        await db.agentTasks.bulkAdd(backup.tables.agentTasks);
      }
      if (backup.tables.agentMemory) {
        await db.agentMemory.clear();
        await db.agentMemory.bulkAdd(backup.tables.agentMemory);
      }
      if (backup.tables.projects) {
        await db.projects.clear();
        await db.projects.bulkAdd(backup.tables.projects);
      }
      if (backup.tables.tasks) {
        await db.tasks.clear();
        await db.tasks.bulkAdd(backup.tables.tasks);
      }
    });

    return { success: true, message: 'Database successfully restored.' };
  } catch (err) {
    console.error('Database restore failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Automatically prunes old agent tasks to prevent quota bloat.
 */
export async function pruneOldAgentLogs(keepLatestCount = 100) {
  try {
    const total = await db.agentTasks.count();
    if (total > keepLatestCount) {
      const allTasks = await db.agentTasks.orderBy('id').toArray();
      const toDelete = allTasks.slice(0, total - keepLatestCount);
      const deleteIds = toDelete.map(t => t.id);
      await db.agentTasks.bulkDelete(deleteIds);
      return { success: true, deletedCount: deleteIds.length };
    }
    return { success: true, deletedCount: 0 };
  } catch (err) {
    console.error('Pruning error:', err);
    return { success: false, error: err.message };
  }
}

// Run initialization
initializeDatabase();

export default db;
