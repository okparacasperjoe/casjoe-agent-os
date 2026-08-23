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
    
    return { customers, invoices, documents, chatMessages, inventory };
  }, [], { customers: 0, invoices: 0, documents: 0, chatMessages: 0, inventory: 0 }); // Initial value
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
  // Generate random invoice ID if not provided, e.g. INV-2026-XXX
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
