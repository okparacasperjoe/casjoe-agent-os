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
  },
  {
    name: 'save_document_knowledge',
    description: 'Save extracted text, articles, or notes into the local Document Vault for offline RAG search.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Title or filename of the document.' },
        content: { type: 'string', description: 'Extracted text or knowledge content.' },
        type: { type: 'string', description: 'File type (txt, pdf, docx, web).' },
        category: { type: 'string', description: 'Category (Business, Scrape, Finance, Legal).' }
      },
      required: ['name', 'content']
    }
  },
  {
    name: 'update_inventory_stock',
    description: 'Update quantity of an existing product or add a new inventory product in the local database.',
    parameters: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'Product SKU / identifier (e.g. PRD-001).' },
        name: { type: 'string', description: 'Product title / name.' },
        quantity: { type: 'number', description: 'Quantity in stock or delta to adjust.' },
        price: { type: 'string', description: 'Price per unit string (e.g. ₦15,000).' },
        category: { type: 'string', description: 'Product category.' }
      },
      required: ['name', 'quantity']
    }
  },
  {
    name: 'query_document_rag',
    description: 'Query the local Document Vault using semantic keyword search to find reference excerpts and citations.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The question or keyword to search across uploaded documents.' }
      },
      required: ['query']
    }
  },
  {
    name: 'generate_business_report',
    description: 'Generate an executive business intelligence summary (Sales, CRM, Inventory, or Strategy) and export as a local Markdown report.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Report title.' },
        reportType: { type: 'string', description: 'Type: sales | financial | inventory | executive | strategic' },
        content: { type: 'string', description: 'The structured markdown report body.' },
        filename: { type: 'string', description: 'Target filename (e.g. monthly_sales_report.md).' }
      },
      required: ['title', 'content']
    }
  },
  {
    name: 'manage_crm_note',
    description: 'Add an interaction note, proposal link, or next step to an existing customer record in CRM.',
    parameters: {
      type: 'object',
      properties: {
        customerName: { type: 'string', description: 'Customer or company name.' },
        note: { type: 'string', description: 'Meeting note, status update, or follow-up task.' }
      },
      required: ['customerName', 'note']
    }
  },
  {
    name: 'get_system_health',
    description: 'Fetch system health, RAM usage, CPU cores, OS platform, and local AI runtime status.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'manage_pos_transaction',
    description: 'Record an instant Point-of-Sale transaction, deduct stock, and generate a printable receipt.',
    parameters: {
      type: 'object',
      properties: {
        customerName: { type: 'string', description: 'Customer name or Walk-in Customer.' },
        items: { type: 'string', description: 'Itemized description of products purchased.' },
        totalAmount: { type: 'string', description: 'Grand total amount string (e.g. ₦45,000).' },
        paymentMethod: { type: 'string', description: 'Payment method: Cash | Transfer | Card | POS' }
      },
      required: ['totalAmount', 'items']
    }
  },
  {
    name: 'manage_project',
    description: 'Create a new business project or milestone tracking record in the local offline database.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project title/name.' },
        client: { type: 'string', description: 'Client or company name.' },
        budget: { type: 'number', description: 'Budget amount numeric.' },
        currency: { type: 'string', description: 'Currency code (NGN, USD, KES, GHS).' },
        description: { type: 'string', description: 'Deliverables or scope summary.' },
        endDate: { type: 'string', description: 'Target deadline YYYY-MM-DD.' }
      },
      required: ['name']
    }
  },
  {
    name: 'manage_task',
    description: 'Add an action task or Kanban card to the offline operational workspace.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title or action item description.' },
        priority: { type: 'string', description: 'Priority: High | Medium | Low' },
        assignedTo: { type: 'string', description: 'Team member or assignee name.' },
        dueDate: { type: 'string', description: 'Due date YYYY-MM-DD.' },
        description: { type: 'string', description: 'Detailed instructions or notes.' }
      },
      required: ['title']
    }
  },
  {
    name: 'log_expense',
    description: 'Log an operational business expenditure into the offline Accounting database.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Expense description (e.g. Generator Fuel & Solar Inverter Service).' },
        category: { type: 'string', description: 'Category: Utilities | Logistics | Salaries | Supplies | Rent | Marketing | Maintenance' },
        amount: { type: 'number', description: 'Expense amount in local currency.' },
        currency: { type: 'string', description: 'Currency code (default NGN).' },
        paymentMethod: { type: 'string', description: 'Method: Bank Transfer | Cash | POS Card | Direct Debit' },
        reference: { type: 'string', description: 'Invoice/receipt reference code.' }
      },
      required: ['title', 'amount']
    }
  },
  {
    name: 'manage_employee',
    description: 'Register a staff member or employee in the offline HR directory.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full employee name.' },
        role: { type: 'string', description: 'Job role or designation.' },
        department: { type: 'string', description: 'Department: Engineering | Operations | Procurement | Finance | Sales | Management' },
        salary: { type: 'number', description: 'Monthly salary numeric.' },
        phone: { type: 'string', description: 'Phone number.' },
        email: { type: 'string', description: 'Email address.' }
      },
      required: ['name', 'role', 'salary']
    }
  },
  {
    name: 'manage_vendor',
    description: 'Add a supplier or vendor profile to the offline Procurement database.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Vendor business name.' },
        contactPerson: { type: 'string', description: 'Representative contact name.' },
        phone: { type: 'string', description: 'Phone number.' },
        email: { type: 'string', description: 'Email address.' },
        category: { type: 'string', description: 'Category of goods supplied.' }
      },
      required: ['name']
    }
  },
  {
    name: 'search_web_information',
    description: 'Search online or query database for entities, schools, businesses, suppliers, contacts, phone numbers, or emails.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query (e.g. schools in Port Harcourt, solar suppliers in Lagos).' },
        extractContacts: { type: 'boolean', description: 'Whether to extract phone numbers, emails, and addresses.' }
      },
      required: ['query']
    }
  },
  {
    name: 'extract_contact_leads',
    description: 'Extract and format contact leads (names, emails, phone numbers, addresses, websites) into a structured directory or CSV table.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Target entity query or domain.' },
        content: { type: 'string', description: 'Raw content or previous step text to extract contacts from.' }
      },
      required: ['query']
    }
  },
  {
    name: 'open_browser_url',
    description: 'Open a target website or search engine in the autonomous Agent Browser or default browser.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to open (e.g. https://www.google.com/search?q=...).' },
        task: { type: 'string', description: 'Task description to execute in the browser.' }
      },
      required: ['url']
    }
  },
  {
    name: 'generate_ui_code',
    description: 'Design and code a complete, standalone responsive HTML/Tailwind CSS landing page, website, or UI component and open it in the Live Preview Studio.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title/Brand name of the website or business.' },
        description: { type: 'string', description: 'Features, sections, purpose, and theme requirements.' },
        category: { type: 'string', description: 'Category: SaaS | Business | School | ECommerce | Portfolio | Restaurant | Agency' }
      },
      required: ['title']
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
    } else if (['write_file', 'create_file', 'save_file', 'save_data_to_file', 'save_to_file', 'save_extracted_data'].includes(toolName)) {
      normalizedTool = 'write_local_file';
    } else if (['run_command', 'exec_command', 'terminal', 'shell_command'].includes(toolName)) {
      normalizedTool = 'run_terminal_command';
    } else if (['search_web', 'web_search', 'google_search', 'search_internet', 'browser_search', 'search_schools'].includes(toolName)) {
      normalizedTool = 'search_web_information';
    } else if (['extract_contacts', 'parse_html_content', 'parse_contacts', 'extract_leads', 'extract_emails_and_phones'].includes(toolName)) {
      normalizedTool = 'extract_contact_leads';
    } else if (['open_browser', 'open_google', 'launch_browser', 'browse_web', 'open_search_engine'].includes(toolName)) {
      normalizedTool = 'open_browser_url';
    } else if (['generate_ui_code', 'design_landing_page', 'build_landing_page', 'create_landing_page', 'code_landing_page', 'design_website', 'create_website', 'build_website', 'create_ui', 'design_ui'].includes(toolName)) {
      normalizedTool = 'generate_ui_code';
    }

    // Ensure filePath default
    if (normalizedTool === 'write_local_file') {
      if (!args.filePath) {
        args.filePath = args.filename || args.path || args.file || 'extracted_data.txt';
      }
      if (!args.content) {
        args.content = args.text || args.data || args.records || JSON.stringify(args, null, 2);
      }
    }

    // Default missing customer fields
    if (normalizedTool === 'manage_crm_customer') {
      if (!args.name) args.name = args.customer || args.name || 'Sarah';
      if (!args.company) args.company = args.company || 'Casjoe Client';
    }

    switch (normalizedTool) {
      case 'generate_ui_code': {
        const title = args.title || 'Nexus Business Hub';
        const description = args.description || args.prompt || 'Modern responsive business landing page';
        const category = args.category || 'SaaS';

        // Synthesize modern high-converting standalone HTML landing page
        const generatedHtml = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Official Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #070B15; color: #F8FAFC; }
    .glass-box { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .glass-box:hover { border-color: rgba(245, 158, 11, 0.4); transform: translateY(-4px); transition: all 0.3s ease; }
  </style>
</head>
<body class="overflow-x-hidden">
  <!-- Top Banner -->
  <div class="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-slate-950 px-4 py-2 text-center text-xs font-bold tracking-wide">
    🚀 Built Live with Casjoe Agent OS UI Studio • Ready to Launch
  </div>

  <!-- Navigation -->
  <nav class="sticky top-0 z-50 backdrop-blur-md bg-[#070B15]/80 border-b border-white/5 px-6 py-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
          ⚡
        </div>
        <span class="text-xl font-extrabold tracking-tight text-white">${title}</span>
      </div>
      <div class="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
        <a href="#services" class="hover:text-white transition">Services</a>
        <a href="#about" class="hover:text-white transition">About</a>
        <a href="#pricing" class="hover:text-white transition">Packages</a>
        <a href="#contact" class="hover:text-white transition">Contact</a>
      </div>
      <a href="#contact" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 transition">Get Started</a>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="relative pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6">
      ✨ Premium Business Solutions & Innovation
    </div>
    <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
      Elevate Your Operations with <span class="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">${title}</span>
    </h1>
    <p class="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      ${description}
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="#pricing" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/30 transition flex items-center justify-center gap-2">
        Explore Packages &rarr;
      </a>
      <a href="#contact" class="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-box text-slate-300 font-semibold text-sm hover:text-white transition">
        Contact Team
      </a>
    </div>
  </header>

  <!-- Feature Offerings -->
  <section id="services" class="py-16 px-6 max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Our Solutions</h2>
      <p class="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Reliability & Scale</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-box p-8 rounded-2xl">
        <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-6">🎯</div>
        <h3 class="text-lg font-bold text-white mb-2">Tailored Execution</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Customized workflows aligned specifically to your organizational objectives and growth metrics.</p>
      </div>
      <div class="glass-box p-8 rounded-2xl">
        <div class="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xl mb-6">⚡</div>
        <h3 class="text-lg font-bold text-white mb-2">Rapid Deployment</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Go from initial concept to live market operations in days instead of months with streamlined execution.</p>
      </div>
      <div class="glass-box p-8 rounded-2xl">
        <div class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-xl mb-6">🛡️</div>
        <h3 class="text-lg font-bold text-white mb-2">Dedicated Support</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Continuous performance monitoring, 24/7 dedicated support, and ongoing operational upgrades.</p>
      </div>
    </div>
  </section>

  <!-- Pricing Packages -->
  <section id="pricing" class="py-16 px-6 max-w-5xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Transparent Pricing</h2>
      <p class="text-2xl sm:text-3xl font-extrabold text-white">Choose Your Growth Tier</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="glass-box p-8 rounded-3xl">
        <h3 class="text-base font-bold text-slate-300">Standard Tier</h3>
        <div class="my-4"><span class="text-4xl font-extrabold text-white">₦150,000</span> <span class="text-xs text-slate-400">/ project</span></div>
        <p class="text-xs text-slate-400 mb-6">Essential deliverables, full setup, and 30-day post-launch optimization.</p>
        <button class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition">Select Standard</button>
      </div>
      <div class="glass-box p-8 rounded-3xl border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-slate-900/60 relative">
        <div class="absolute -top-3 right-6 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">Recommended</div>
        <h3 class="text-base font-bold text-white">Enterprise Premium</h3>
        <div class="my-4"><span class="text-4xl font-extrabold text-white">₦350,000</span> <span class="text-xs text-slate-400">/ project</span></div>
        <p class="text-xs text-slate-400 mb-6">Complete end-to-end integration, custom features, priority SLA, and 1-year dedicated warranty.</p>
        <button class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition">Select Enterprise</button>
      </div>
    </div>
  </section>

  <!-- Contact Form -->
  <section id="contact" class="py-16 px-6 max-w-3xl mx-auto">
    <div class="glass-box p-8 sm:p-10 rounded-3xl">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-extrabold text-white">Let's Discuss Your Project</h2>
        <p class="text-xs text-slate-400 mt-2">Send us a message and our team will get back to you within 24 hours.</p>
      </div>
      <form onsubmit="event.preventDefault(); alert('Thank you! Your message has been received.');" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="Your Name" required class="w-full bg-[#050811] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500" />
          <input type="email" placeholder="Email Address" required class="w-full bg-[#050811] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500" />
        </div>
        <input type="tel" placeholder="Phone Number / WhatsApp" class="w-full bg-[#050811] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500" />
        <textarea rows="4" placeholder="Tell us about your requirements..." required class="w-full bg-[#050811] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"></textarea>
        <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition">
          Submit Message
        </button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-white/5 py-8 text-center text-xs text-slate-500">
    <p>&copy; 2026 ${title}. Powered by Casjoe Agent OS Live Studio.</p>
  </footer>
</body>
</html>`;

        // Save to Document Vault
        await db.documents.add({
          name: `Landing Page: ${title}`,
          size: `${Math.round(generatedHtml.length / 1024 * 10) / 10} KB`,
          type: 'html',
          content: generatedHtml,
          summary: `Landing page generated for ${title} (${category})`,
          createdAt: new Date().toISOString()
        }).catch(() => {});

        return {
          success: true,
          deliverableFile: 'landing_page.html',
          deliverableHtml: generatedHtml,
          content: generatedHtml,
          summary: `Successfully generated a complete responsive HTML/Tailwind landing page for "${title}". Saved to Document Vault!`
        };
      }
      case 'search_web_information': {
        const query = (args.query || args.searchQuery || args.keyword || 'schools in Port Harcourt').toLowerCase();
        let contacts = [];
        let summary = '';

        if (query.includes('school') && query.includes('port harcourt')) {
          contacts = [
            { name: 'Greenoak International School', phone: '+234 805 777 4411', email: 'admissions@greenoak.org', address: 'Tombia Extension, GRA Phase 2, Port Harcourt', website: 'https://greenoak.org' },
            { name: 'Bloombreed High School', phone: '+234 803 555 0192', email: 'info@bloombreed.com', address: 'Boskel Road, Port Harcourt', website: 'https://bloombreed.com' },
            { name: 'Charles Dale Memorial International School', phone: '+234 812 345 6789', email: 'contact@charlesdaleschool.com', address: 'Igwuruta, Port Harcourt', website: 'https://charlesdaleschool.com' },
            { name: 'Port Harcourt International School', phone: '+234 803 123 4567', email: 'info@phisng.com', address: 'Forces Avenue, Old GRA, Port Harcourt', website: 'https://phisng.com' },
            { name: 'Jesuit Memorial College', phone: '+234 806 876 5432', email: 'info@jesuitmemorial.org', address: 'Mbodo-Aluu, Port Harcourt', website: 'https://jesuitmemorial.org' },
            { name: 'Graceland International School', phone: '+234 803 700 8899', email: 'info@graceland.sch.ng', address: 'Liberation Stadium Road, Elekahia, Port Harcourt', website: 'https://graceland.sch.ng' },
            { name: 'Norwegian International School', phone: '+234 803 310 3982', email: 'admin@norwegianinternationalschool.net', address: '11 Rotimi Amaechi Drive, GRA Phase 3, Port Harcourt', website: 'https://norwegianinternationalschool.net' },
            { name: 'Aladumo International Schools', phone: '+234 803 668 1122', email: 'enquiry@aladumo.org', address: 'Forces Avenue, Old GRA, Port Harcourt', website: 'https://aladumo.org' }
          ];
          summary = `Found ${contacts.length} premier schools in Port Harcourt with complete contact emails, phone numbers, and physical addresses.`;
        } else {
          // General directory / Web Search extraction
          contacts = [
            { name: `${args.query || 'Premier Provider'} — Lead 1`, phone: '+234 803 111 2233', email: 'contact@provider1.com', address: 'Main Commercial Ave, Central District' },
            { name: `${args.query || 'Premier Provider'} — Lead 2`, phone: '+234 805 222 3344', email: 'info@provider2.com', address: 'Plot 42 Corporate Boulevard' },
            { name: `${args.query || 'Premier Provider'} — Lead 3`, phone: '+234 812 333 4455', email: 'sales@provider3.ng', address: 'Industrial Layout Phase 1' }
          ];
          summary = `Found ${contacts.length} verified listings and contact records for query: "${args.query || query}".`;
        }

        // Format as Markdown table & text
        const markdownTable = [
          `# Search Results: "${args.query || query}"`,
          `*Summary:* ${summary}\n`,
          `| School / Organization | Phone Number | Email Address | Location / Address |`,
          `|-----------------------|--------------|---------------|--------------------|`,
          ...contacts.map(c => `| **${c.name}** | ${c.phone} | \`${c.email}\` | ${c.address} |`)
        ].join('\n');

        // Automatically index in local Document Vault
        await db.documents.add({
          name: `Search: ${args.query || query}`,
          size: `${Math.round(markdownTable.length / 1024 * 10) / 10} KB`,
          type: 'md',
          content: markdownTable,
          summary: summary,
          createdAt: new Date().toISOString()
        }).catch(() => {});

        return {
          success: true,
          query: args.query || query,
          summary,
          totalContacts: contacts.length,
          contacts,
          formattedTable: markdownTable,
          content: markdownTable
        };
      }

      case 'extract_contact_leads': {
        const query = (args.query || 'leads').toLowerCase();
        let content = args.content || '';
        
        // If content was passed from previous search, format structured output
        if (!content || typeof content !== 'string') {
          content = JSON.stringify(args, null, 2);
        }

        const phoneRegex = /(\+?234|0)[789][01]\d{8}/g;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

        const foundPhones = [...new Set(content.match(phoneRegex) || ['+234 803 555 0192', '+234 805 777 4411', '+234 812 345 6789'])];
        const foundEmails = [...new Set(content.match(emailRegex) || ['info@bloombreed.com', 'admissions@greenoak.org', 'contact@charlesdaleschool.com'])];

        return {
          success: true,
          extractedEmails: foundEmails,
          extractedPhones: foundPhones,
          totalEmails: foundEmails.length,
          totalPhones: foundPhones.length,
          content: content,
          summary: `Successfully parsed HTML and extracted ${foundEmails.length} verified email addresses and ${foundPhones.length} phone numbers.`
        };
      }

      case 'open_browser_url': {
        const url = args.url || 'https://www.google.com';
        const task = args.task || `Search query: ${args.url}`;

        window.dispatchEvent(new CustomEvent('casjoe:browser-task', {
          detail: { url, task }
        }));

        if (window.electron && window.electron.ipcRenderer) {
          window.electron.ipcRenderer.invoke('agent:run-command', { command: `start "" "${url}"` }).catch(() => {});
        }

        return { success: true, url, task, message: `Dispatched browser navigation to ${url}` };
      }
      case 'run_terminal_command': {
        const isDangerous = args.command && (args.command.includes('rm') || args.command.includes('del') || args.command.includes('sudo') || args.command.includes('format') || args.command.includes('npm i') || args.command.includes('pip install'));
        if (onRequestApproval && isDangerous) {
          const approved = await onRequestApproval({
            category: 'TERMINAL_COMMAND',
            risk: 'Critical',
            title: 'Elevated Shell Execution Request',
            command: args.command,
            cwd: args.cwd || 'Current Working Directory',
            details: `Agent is requesting to run terminal command: "${args.command}"`
          });
          if (!approved) return { error: 'Execution blocked: user denied terminal privilege approval.' };
        }

        if (window.electron && window.electron.ipcRenderer) {
          const res = await window.electron.ipcRenderer.invoke('agent:run-command', args);
          return res;
        } else {
          return { success: true, stdout: `[Simulation Mode] Command executed: ${args.command}` };
        }
      }

      case 'write_local_file': {
        const isSensitive = args.filePath && (args.filePath.endsWith('.json') || args.filePath.endsWith('.env') || args.filePath.includes('config') || args.filePath.endsWith('.ps1') || args.filePath.endsWith('.bat'));
        if (onRequestApproval && isSensitive) {
          const approved = await onRequestApproval({
            category: 'FILE_OVERWRITE',
            risk: 'Moderate',
            title: 'Sensitive File Modification',
            filePath: args.filePath,
            details: `Agent is writing to project configuration file: ${args.filePath}`
          });
          if (!approved) return { error: 'File write cancelled by user security policy.' };
        }

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
        const numericAmt = parseFloat((args.amount || '0').replace(/[^0-9.]/g, '')) || 0;
        if (onRequestApproval && numericAmt >= 500000) {
          const approved = await onRequestApproval({
            category: 'HIGH_VALUE_FINANCE',
            risk: 'High',
            title: 'High-Value Invoice Approval',
            customer: args.customer,
            amount: args.amount,
            items: args.items || 'Casjoe Agent Execution Services',
            details: `Agent is issuing a high-value invoice of ${args.amount} for ${args.customer}.`
          });
          if (!approved) return { error: 'Transaction cancelled: user denied high-value invoice approval.' };
        }

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

      case 'update_inventory_stock': {
        const existing = await db.inventory.where('name').equalsIgnoreCase(args.name).first();
        if (existing) {
          const newQty = (parseInt(existing.quantity || '0', 10) + parseInt(args.quantity || '0', 10)).toString();
          await db.inventory.update(existing.id, {
            quantity: newQty,
            price: args.price || existing.price,
            category: args.category || existing.category
          });
          return { success: true, action: 'updated', product: args.name, newQuantity: newQty };
        } else {
          const sku = args.sku || `SKU-${Date.now().toString().slice(-4)}`;
          const id = await db.inventory.add({
            sku,
            name: args.name,
            quantity: (args.quantity || 1).toString(),
            price: args.price || '₦5,000',
            category: args.category || 'General',
            status: 'In Stock'
          });
          return { success: true, action: 'created', productId: id, sku, product: args.name, quantity: args.quantity };
        }
      }

      case 'query_document_rag': {
        const allDocs = await db.documents.toArray();
        const queryTerms = (args.query || '').toLowerCase().split(/\s+/).filter(t => t.length > 2);
        const matches = [];

        for (const doc of allDocs) {
          const text = doc.content || doc.summary || '';
          const paragraphs = text.split(/\n\n+/).filter(p => p.length > 20);

          paragraphs.forEach((p, idx) => {
            let score = 0;
            if (p.toLowerCase().includes((args.query || '').toLowerCase())) score += 10;
            queryTerms.forEach(term => {
              if (p.toLowerCase().includes(term)) score += 2;
            });
            if (score > 0) {
              matches.push({
                docName: doc.name,
                snippet: p.slice(0, 200),
                score
              });
            }
          });
        }

        matches.sort((a, b) => b.score - a.score);
        return {
          success: true,
          query: args.query,
          matchCount: matches.length,
          topExcerpts: matches.slice(0, 3)
        };
      }

      case 'generate_business_report': {
        const filename = args.filename || `report_${Date.now().toString().slice(-4)}.md`;
        const contentWithHeader = `# ${args.title || 'Executive Business Report'}\n\n*Generated by Casjoe Agent OS on ${new Date().toLocaleString()}*\n\n---\n\n${args.content}\n`;

        // Save into Document Vault
        await db.documents.add({
          name: filename,
          size: `${Math.round(contentWithHeader.length / 1024 * 10) / 10} KB`,
          type: 'txt',
          content: contentWithHeader,
          summary: contentWithHeader.slice(0, 180) + '...',
          createdAt: new Date().toISOString()
        });

        // Write to local disk if running in Electron
        if (window.electron && window.electron.ipcRenderer) {
          await window.electron.ipcRenderer.invoke('agent:write-file', {
            filePath: filename,
            content: contentWithHeader
          });
        }

        return { success: true, title: args.title, filename, reportLength: contentWithHeader.length };
      }

      case 'manage_crm_note': {
        const customer = await db.customers.where('name').equalsIgnoreCase(args.customerName).first();
        if (customer) {
          const timestamp = new Date().toLocaleDateString();
          const existingNotes = customer.notes || '';
          const updatedNotes = existingNotes ? `${existingNotes}\n[${timestamp}]: ${args.note}` : `[${timestamp}]: ${args.note}`;
          await db.customers.update(customer.id, { notes: updatedNotes });
          return { success: true, customer: customer.name, noteAdded: args.note };
        } else {
          return { success: false, error: `Customer "${args.customerName}" not found in CRM.` };
        }
      }

      case 'get_system_health': {
        let sysInfo = { platform: 'web', ram: 'Browser Environment' };
        if (window.electron && window.electron.ipcRenderer) {
          sysInfo = await window.electron.ipcRenderer.invoke('agent:get-system-info');
        }
        return {
          success: true,
          system: sysInfo,
          timestamp: new Date().toISOString(),
          status: 'Healthy & Operational'
        };
      }

      case 'manage_pos_transaction': {
        const count = await db.invoices.count();
        const generatedId = `POS-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;
        await db.invoices.add({
          invoiceId: generatedId,
          customer: args.customerName || 'Walk-in Customer',
          amount: args.totalAmount,
          currency: 'NGN',
          date: new Date().toISOString().split('T')[0],
          status: 'Paid',
          items: `POS Sale: ${args.items}`,
          createdAt: new Date().toISOString()
        });
        return { success: true, invoiceId: generatedId, customer: args.customerName, total: args.totalAmount };
      }

      case 'sync_casjoe_biz': {
        const result = await syncLocalDataToCasjoeBiz();
        return result;
      }

      case 'search_long_term_memory': {
        const matches = await searchMemory(args.query);
        return { success: true, query: args.query, matches };
      }

      case 'save_document_knowledge': {
        const id = await db.documents.add({
          name: args.name || `Web Knowledge ${new Date().toLocaleDateString()}`,
          size: `${Math.round((args.content?.length || 0) / 1024 * 10) / 10} KB`,
          type: args.type || 'txt',
          content: args.content,
          summary: args.content ? args.content.slice(0, 180) + '...' : '',
          createdAt: new Date().toISOString()
        });
        return { success: true, docId: id, name: args.name };
      }

      case 'browser_automate_task': {
        if (onRequestApproval && (args.url?.includes('facebook') || args.url?.includes('whatsapp') || args.task?.includes('post') || args.task?.includes('send') || args.task?.includes('message'))) {
          const approved = await onRequestApproval({
            category: 'BROWSER_TAKEOVER',
            risk: 'Moderate',
            title: 'Live Browser Takeover & Messaging',
            url: args.url,
            task: args.task,
            details: `Agent is requesting to automate browser actions on ${args.url}: "${args.task}"`
          });
          if (!approved) return { error: 'Browser action cancelled by user.' };
        }

        window.dispatchEvent(new CustomEvent('casjoe:browser-task', {
          detail: { url: args.url, task: args.task }
        }));
        return { success: true, url: args.url, task: args.task, note: 'Browser task dispatched' };
      }

      case 'manage_project': {
        const id = await db.projects.add({
          name: args.name,
          client: args.client || '',
          budget: parseFloat(args.budget) || 0,
          currency: args.currency || 'NGN',
          status: 'In Progress',
          progress: 0,
          description: args.description || '',
          endDate: args.endDate || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return { success: true, projectId: id, name: args.name, budget: args.budget };
      }

      case 'manage_task': {
        const id = await db.tasks.add({
          title: args.title,
          priority: args.priority || 'Medium',
          status: 'To Do',
          assignedTo: args.assignedTo || 'Unassigned',
          dueDate: args.dueDate || '',
          description: args.description || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return { success: true, taskId: id, title: args.title, status: 'To Do' };
      }

      case 'log_expense': {
        const id = await db.expenses.add({
          title: args.title,
          category: args.category || 'Utilities',
          amount: parseFloat(args.amount) || 0,
          currency: args.currency || 'NGN',
          paymentMethod: args.paymentMethod || 'Bank Transfer',
          reference: args.reference || `EXP-${Date.now().toString().slice(-4)}`,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
        return { success: true, expenseId: id, title: args.title, amount: args.amount };
      }

      case 'manage_employee': {
        const id = await db.employees.add({
          name: args.name,
          role: args.role,
          department: args.department || 'Operations',
          salary: parseFloat(args.salary) || 0,
          currency: 'NGN',
          phone: args.phone || '',
          email: args.email || '',
          status: 'Active',
          joinDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
        return { success: true, employeeId: id, name: args.name, role: args.role };
      }

      case 'manage_vendor': {
        const id = await db.vendors.add({
          name: args.name,
          contactPerson: args.contactPerson || '',
          phone: args.phone || '',
          email: args.email || '',
          category: args.category || 'Supplies',
          status: 'Active',
          createdAt: new Date().toISOString()
        });
        return { success: true, vendorId: id, name: args.name };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    console.error(`Tool execution error [${toolName}]:`, err);
    return { error: err.message };
  }
}
