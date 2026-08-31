import { useLiveQuery } from 'dexie-react-hooks';
import db from './database';

// ==========================================
// Hooks (Reactive Queries)
// ==========================================

export const useCustomers = () => {
  return useLiveQuery(
    () => db.customers.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const useInvoices = () => {
  return useLiveQuery(
    () => db.invoices.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const useDocuments = () => {
  return useLiveQuery(
    () => db.documents.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const useProjects = () => {
  return useLiveQuery(
    () => db.projects.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const useTasks = () => {
  return useLiveQuery(
    () => db.tasks.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const useInventory = () => {
  return useLiveQuery(
    () => db.inventory.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const useExpenses = () => {
  return useLiveQuery(
    () => db.expenses.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const useVendors = () => {
  return useLiveQuery(
    () => db.vendors.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const usePurchaseOrders = () => {
  return useLiveQuery(
    () => db.purchaseOrders.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const useEmployees = () => {
  return useLiveQuery(
    () => db.employees.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const usePayroll = () => {
  return useLiveQuery(
    () => db.payroll.orderBy('createdAt').reverse().toArray(),
    []
  );
};

export const useChatMessages = (conversationId) => {
  return useLiveQuery(
    () => db.chatMessages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('createdAt'),
    [conversationId]
  );
};

export const useStats = () => {
  return useLiveQuery(async () => {
    const customers = await db.customers.count();
    const invoices = await db.invoices.count();
    const documents = await db.documents.count();
    const chatMessages = await db.chatMessages.count();
    const inventory = await db.inventory.count();
    const projects = await db.projects.count();
    const tasks = await db.tasks.count();
    const expenses = await db.expenses.count();
    const vendors = await db.vendors.count();
    const purchaseOrders = await db.purchaseOrders.count();
    const employees = await db.employees.count();
    
    return { 
      customers, invoices, documents, chatMessages, inventory, 
      projects, tasks, expenses, vendors, purchaseOrders, employees 
    };
  }, [], { 
    customers: 0, invoices: 0, documents: 0, chatMessages: 0, inventory: 0, 
    projects: 0, tasks: 0, expenses: 0, vendors: 0, purchaseOrders: 0, employees: 0 
  });
};

export const useSetting = (key) => {
  return useLiveQuery(
    async () => {
      const setting = await db.settings.get(key);
      return setting ? setting.value : null;
    },
    [key]
  );
};

// ==========================================
// Mutations (Non-hooks)
// ==========================================

export const addCustomer = async (data) => {
  return db.customers.add({
    ...data,
    createdAt: new Date().toISOString()
  });
};

export const addInvoice = async (data) => {
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const generatedId = `INV-${new Date().getFullYear()}-${randomNum}`;
  
  return db.invoices.add({
    invoiceId: generatedId,
    ...data,
    createdAt: new Date().toISOString()
  });
};

export const addDocument = async (data) => {
  return db.documents.add({
    ...data,
    createdAt: new Date().toISOString()
  });
};

export const addInventoryItem = async (data) => {
  return db.inventory.add({
    ...data,
    createdAt: new Date().toISOString()
  });
};

export const addProject = async (data) => {
  const now = new Date().toISOString();
  return db.projects.add({
    ...data,
    progress: data.progress !== undefined ? data.progress : 0,
    status: data.status || 'Planning',
    createdAt: now,
    updatedAt: now
  });
};

export const updateProject = async (id, data) => {
  return db.projects.update(id, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const deleteProject = async (id) => {
  return db.projects.delete(id);
};

export const addTask = async (data) => {
  const now = new Date().toISOString();
  return db.tasks.add({
    ...data,
    status: data.status || 'To Do',
    priority: data.priority || 'Medium',
    createdAt: now,
    updatedAt: now
  });
};

export const updateTaskStatus = async (id, status) => {
  return db.tasks.update(id, {
    status,
    updatedAt: new Date().toISOString()
  });
};

export const updateTask = async (id, data) => {
  return db.tasks.update(id, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const deleteTask = async (id) => {
  return db.tasks.delete(id);
};

export const addExpense = async (data) => {
  return db.expenses.add({
    ...data,
    createdAt: new Date().toISOString()
  });
};

export const deleteExpense = async (id) => {
  return db.expenses.delete(id);
};

export const addVendor = async (data) => {
  return db.vendors.add({
    ...data,
    status: data.status || 'Active',
    createdAt: new Date().toISOString()
  });
};

export const deleteVendor = async (id) => {
  return db.vendors.delete(id);
};

export const addPurchaseOrder = async (data) => {
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const poNumber = data.poNumber || `PO-${new Date().getFullYear()}-${randomNum}`;
  return db.purchaseOrders.add({
    ...data,
    poNumber,
    status: data.status || 'Draft',
    createdAt: new Date().toISOString()
  });
};

export const updatePurchaseOrderStatus = async (id, status) => {
  const po = await db.purchaseOrders.get(id);
  if (po && status === 'Received') {
    // If PO items mention sku or name, we can attempt stock update if matched
  }
  return db.purchaseOrders.update(id, { status });
};

export const deletePurchaseOrder = async (id) => {
  return db.purchaseOrders.delete(id);
};

export const addEmployee = async (data) => {
  return db.employees.add({
    ...data,
    status: data.status || 'Active',
    createdAt: new Date().toISOString()
  });
};

export const deleteEmployee = async (id) => {
  return db.employees.delete(id);
};

export const addPayrollRecord = async (data) => {
  return db.payroll.add({
    ...data,
    status: data.status || 'Paid',
    createdAt: new Date().toISOString()
  });
};

export const deletePayrollRecord = async (id) => {
  return db.payroll.delete(id);
};

export const addChatMessage = async (data) => {
  return db.chatMessages.add({
    ...data,
    createdAt: new Date().toISOString()
  });
};

export const setSetting = async (key, value) => {
  return db.settings.put({ key, value });
};

export const deleteCustomer = async (id) => {
  return db.customers.delete(id);
};

export const deleteInvoice = async (id) => {
  return db.invoices.delete(id);
};

export const updateDocument = async (id, data) => {
  return db.documents.update(id, data);
};

export const deleteDocument = async (id) => {
  return db.documents.delete(id);
};

export const deleteInventoryItem = async (id) => {
  return db.inventory.delete(id);
};
