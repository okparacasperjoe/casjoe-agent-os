// Mock Data for Casjoe Agent OS - Offline Business Engine

export const INITIAL_STATS = {
  customers: { value: '1,248', change: '+14.2%', trend: [15, 22, 28, 35, 42, 50, 68] },
  sales: { value: '₦12.4M', change: '+18.5%', trend: [2.1, 3.4, 4.8, 6.2, 8.5, 10.1, 12.4] },
  revenue: { value: '₦9.8M', change: '+22.0%', trend: [1.8, 2.9, 3.8, 4.9, 6.8, 8.0, 9.8] },
  aiTasks: { value: '842', change: '+34.1%', trend: [120, 240, 380, 490, 610, 720, 842] }
};

export const MONTHLY_ANALYTICS = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  sales: [3.2, 5.8, 8.4, 6.1, 10.5, 12.8, 16.4],
  revenue: [2.1, 3.5, 6.2, 4.8, 7.9, 9.2, 12.1],
  aiTasks: [200, 350, 520, 480, 710, 820, 980]
};

export const RAG_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'Business_Proposal.pdf',
    size: '2.4 MB',
    type: 'pdf',
    pages: 18,
    date: '2026-07-20',
    summary: 'Contains terms for client engagement, milestones, payment schedule, and service scope.'
  },
  {
    id: 'doc-2',
    name: 'HR_Policy.docx',
    size: '1.3 MB',
    type: 'docx',
    pages: 24,
    date: '2026-07-15',
    summary: 'Standard operating procedures, staff leave allowance, code of conduct, and finance policies.'
  },
  {
    id: 'doc-3',
    name: 'Sales_Report.xlsx',
    size: '985 KB',
    type: 'xlsx',
    pages: 4,
    date: '2026-07-28',
    summary: 'Quarterly breakdown of sales performance across Lagos, Abuja, Port Harcourt & Kano branches.'
  },
  {
    id: 'doc-4',
    name: 'Operations_Manual.pdf',
    size: '3.1 MB',
    type: 'pdf',
    pages: 32,
    date: '2026-06-10',
    summary: 'Hardware setup, offline model installation guide, thermal management on 8GB laptops.'
  },
  {
    id: 'doc-5',
    name: 'Strategy_Deck.docx',
    size: '2.7 MB',
    type: 'docx',
    pages: 15,
    date: '2026-07-02',
    summary: '2026 expansion roadmap across West & East African SME hubs with 0% cloud cost.'
  }
];

export const PRESET_QNA = [
  {
    question: "What are the key terms of the payment policy?",
    answer: "Payments are due within 30 days of invoice receipt. Late payments may incur a 5% penalty after 30 days. All payments should be made via approved methods only (Direct Bank Transfer or Offline POS ledger).",
    sources: [
      { doc: "Business_Proposal.pdf", page: "Page 7", snippet: "Section 4.2 - Payment Terms: Client shall settle all tax invoices within thirty (30) calendar days..." },
      { doc: "HR_Policy.docx", page: "Page 12", snippet: "Section 7.1 - Finance Policy: Accounts receivable must verify payment receipts before releasing hardware..." }
    ]
  },
  {
    question: "How can I increase sales for my small business?",
    answer: "Here are proven ways to increase sales for your small business:\n1. Understand your customers deeply\n2. Improve your product/service offering\n3. Build a strong local presence\n4. Leverage localized SMS & WhatsApp offline marketing\n5. Offer excellent customer service\n6. Track results and optimize using Casjoe Agent OS analytics",
    sources: [
      { doc: "Strategy_Deck.docx", page: "Page 4", snippet: "Growth Pillars: Focus on hyper-local merchant retention and zero-latency customer support." }
    ]
  },
  {
    question: "Summarize sales performance for this month.",
    answer: "Sales are up 18% this month across all retail channels. Revenue increased by 22% compared to last month (reaching ₦9.8M). The top revenue driver was the Casjoe Agent OS hardware bundle.",
    sources: [
      { doc: "Sales_Report.xlsx", page: "Page 2", snippet: "July Revenue Summary: Total Gross Sales ₦12.4M, Net Margin 79.0%." }
    ]
  }
];

export const AVAILABLE_MODELS = [
  {
    id: 'mistral-7b-q4',
    name: 'Mistral 7B Instruct',
    quantization: 'Q4_K_M',
    ramRequired: '4.1 GB',
    recommendedRam: '8 GB',
    speed: '12.4 t/s',
    context: 4096,
    description: 'High intelligence model for complex document reasoning and business drafting.'
  },
  {
    id: 'llama-3-8b-q4',
    name: 'Llama 3.2 3B Instruct',
    quantization: 'Q4_K_M',
    ramRequired: '2.2 GB',
    recommendedRam: '4 GB',
    speed: '28.6 t/s',
    context: 8192,
    description: 'Ultra-fast lightweight LLM designed specifically for 4GB RAM entry-level laptops.'
  },
  {
    id: 'qwen-25-7b-q4',
    name: 'Qwen 2.5 7B Business',
    quantization: 'Q4_K_M',
    ramRequired: '4.3 GB',
    recommendedRam: '8 GB',
    speed: '14.2 t/s',
    context: 4096,
    description: 'Specialized in multi-lingual African dialects, financial accounting, and CRM tasks.'
  },
  {
    id: 'gemma-2b-q4',
    name: 'Gemma 2B Micro',
    quantization: 'Q4_0',
    ramRequired: '1.6 GB',
    recommendedRam: '4 GB',
    speed: '34.0 t/s',
    context: 2048,
    description: 'Minimal memory footprint for legacy devices and low battery power usage.'
  }
];

export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Amina Bello', company: 'Sahara Logistics Ltd', location: 'Lagos, Nigeria', phone: '+234 802 123 4567', totalSpent: '₦4.2M', status: 'Active' },
  { id: 'c2', name: 'Kwame Mensah', company: 'Gold Coast Traders', location: 'Accra, Ghana', phone: '+233 24 555 0192', totalSpent: 'GHS 85,000', status: 'Active' },
  { id: 'c3', name: 'David Ochieng', company: 'Nairobi Health Hub', location: 'Nairobi, Kenya', phone: '+254 712 345 678', totalSpent: 'KSh 1.4M', status: 'Active' },
  { id: 'c4', name: 'Sipho Dlamini', company: 'Cape Solar Systems', location: 'Johannesburg, South Africa', phone: '+27 82 999 4433', totalSpent: 'ZAR 240,000', status: 'Pending' },
  { id: 'c5', name: 'Dr. Fatima Umar', company: 'Kano Community Clinic', location: 'Kano, Nigeria', phone: '+234 803 888 1122', totalSpent: '₦3.1M', status: 'Active' }
];

export const MOCK_INVOICES = [
  { id: 'INV-2026-001', customer: 'Sahara Logistics Ltd', amount: '₦1,850,000', currency: 'NGN', date: '2026-07-28', status: 'Paid', items: 'Casjoe Agent OS Hub x2' },
  { id: 'INV-2026-002', customer: 'Nairobi Health Hub', amount: 'KSh 450,000', currency: 'KES', date: '2026-07-25', status: 'Pending', items: 'Medical RAG License & 8GB Laptop Config' },
  { id: 'INV-2026-003', customer: 'Gold Coast Traders', amount: 'GHS 32,000', currency: 'GHS', date: '2026-07-20', status: 'Paid', items: 'Offline CRM System Setup' },
  { id: 'INV-2026-004', customer: 'Kano Community Clinic', amount: '₦1,200,000', currency: 'NGN', date: '2026-07-18', status: 'Paid', items: 'Offline Telehealth Knowledge Base' }
];
