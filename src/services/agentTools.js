import db from '../db/database';
import { syncLocalDataToCasjoeBiz, getCasjoeBizUrl } from './casjoeBizSync';
import { saveMemory, searchMemory } from './agentMemory';

/**
 * Casjoe Agent OS Tool Definitions & Executable Handlers
 */

export const AGENT_TOOL_DEFINITIONS = [
  {
    name: 'run_terminal_command',
    description: 'Execute a terminal shell command on the host OS (e.g. npm run, git, python, dir, ls).',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The shell command to execute.' },
        cwd: { type: 'string', description: 'Working directory path (optional).' }
      },
      required: ['command']
    }
  },
  {
    name: 'write_local_file',
    description: 'Create or overwrite a file on the local computer with specified content.',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Absolute or relative file path.' },
        content: { type: 'string', description: 'Text or code content to write.' }
      },
      required: ['filePath', 'content']
    }
  },
  {
    name: 'read_local_file',
    description: 'Read the contents of a text or code file on the local computer.',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to the file.' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'list_local_directory',
    description: 'List all files and subdirectories within a target directory.',
    parameters: {
      type: 'object',
      properties: {
        dirPath: { type: 'string', description: 'Path to directory (optional, defaults to user home).' }
      }
    }
  },
  {
    name: 'manage_crm_customer',
    description: 'Add or update a customer record in the local CRM database.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Customer full name.' },
        company: { type: 'string', description: 'Company or business name.' },
        phone: { type: 'string', description: 'Phone number.' },
        location: { type: 'string', description: 'City/Location (e.g. Lagos, Nigeria).' },
        totalSpent: { type: 'string', description: 'Initial or updated total spent string (e.g. ₦500,000).' }
      },
      required: ['name', 'company']
    }
  },
  {
    name: 'create_finance_invoice',
    description: 'Generate an invoice in the local Finance database.',
    parameters: {
      type: 'object',
      properties: {
        customer: { type: 'string', description: 'Customer or company name.' },
        amount: { type: 'string', description: 'Invoice amount string (e.g. ₦250,000).' },
        currency: { type: 'string', description: 'Currency code (NGN, GHS, KES, USD).' },
        items: { type: 'string', description: 'Itemized description of services or products.' }
      },
      required: ['customer', 'amount']
    }
  },
  {
    name: 'sync_casjoe_biz',
    description: 'Synchronize local CRM, Invoice, and Inventory records with app.casjoe.com.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'search_long_term_memory',
    description: 'Search long-term memory for business notes, past proposals, or saved preferences.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or keyword.' }
      },
      required: ['query']
    }
  }
];

export async function executeAgentTool(toolName, args = {}, onRequestApproval) {
  try {
    // Tool Alias Normalization
    let normalizedTool = toolName;
    if (['add_customer', 'create_customer', 'add_crm_customer', 'crm_customer'].includes(toolName)) {
      normalizedTool = 'manage_crm_customer';
    } else if (['add_invoice', 'create_invoice', 'generate_invoice'].includes(toolName)) {
      normalizedTool = 'create_finance_invoice';
    } else if (['write_file', 'create_file'].includes(toolName)) {
      normalizedTool = 'write_local_file';
    } else if (['run_command', 'exec_command', 'terminal'].includes(toolName)) {
      normalizedTool = 'run_terminal_command';
    }

    // Default missing customer fields
    if (normalizedTool === 'manage_crm_customer') {
      if (!args.name) args.name = args.customer || args.name || 'Sarah';
      if (!args.company) args.company = args.company || 'Casjoe Client';
    }

    switch (normalizedTool) {
      case 'run_terminal_command': {
        if (window.electron && window.electron.ipcRenderer) {
          // Check for unsafe patterns or request user approval if callback provided
          if (onRequestApproval && (args.command.includes('rm') || args.command.includes('del') || args.command.includes('sudo'))) {
            const approved = await onRequestApproval({ type: 'terminal', command: args.command });
            if (!approved) return { error: 'Execution cancelled by user approval policy.' };
          }
          const res = await window.electron.ipcRenderer.invoke('agent:run-command', args);
          return res;
        } else {
          return { success: true, stdout: `[Simulation Mode] Command executed: ${args.command}` };
        }
      }

      case 'write_local_file': {
        if (window.electron && window.electron.ipcRenderer) {
          return await window.electron.ipcRenderer.invoke('agent:write-file', args);
        } else {
          return { success: true, filePath: args.filePath, note: 'Simulated file write in browser mode' };
        }
      }

      case 'read_local_file': {
        if (window.electron && window.electron.ipcRenderer) {
          return await window.electron.ipcRenderer.invoke('agent:read-file', args);
        } else {
          return { success: true, content: `[Simulated Content for ${args.filePath}]` };
        }
      }

      case 'list_local_directory': {
        if (window.electron && window.electron.ipcRenderer) {
          return await window.electron.ipcRenderer.invoke('agent:list-dir', args);
        } else {
          return { success: true, files: [{ name: 'demo.txt', isDirectory: false }] };
        }
      }

      case 'manage_crm_customer': {
        const now = new Date().toISOString();
        const id = await db.customers.add({
          name: args.name,
          company: args.company,
          location: args.location || 'Lagos, Nigeria',
          phone: args.phone || '+234 800 000 0000',
          totalSpent: args.totalSpent || '₦0',
          status: 'Active',
          createdAt: now
        });
        return { success: true, customerId: id, name: args.name, company: args.company };
      }

      case 'create_finance_invoice': {
        const now = new Date().toISOString();
        const count = await db.invoices.count();
        const invId = `INV-2026-${(count + 1).toString().padStart(3, '0')}`;
        const id = await db.invoices.add({
          invoiceId: invId,
          customer: args.customer,
          amount: args.amount,
          currency: args.currency || 'NGN',
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
          items: args.items || 'Casjoe Agent Execution Services',
          createdAt: now
        });
        return { success: true, id, invoiceId: invId, customer: args.customer, amount: args.amount };
      }

      case 'sync_casjoe_biz': {
        const result = await syncLocalDataToCasjoeBiz();
        return result;
      }

      case 'search_long_term_memory': {
        const matches = await searchMemory(args.query);
        return { success: true, query: args.query, matches };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    console.error(`Tool execution error [${toolName}]:`, err);
    return { error: err.message };
  }
}
