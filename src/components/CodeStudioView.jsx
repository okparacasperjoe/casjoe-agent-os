import React, { useState, useEffect, useRef } from 'react';
import { 
  Code, Eye, Play, Sparkles, Download, Copy, Check, Smartphone, Tablet, Monitor, 
  RotateCcw, ExternalLink, Save, FolderOpen, Layers, Wand2, Palette, Zap, 
  Columns2, FileCode, CheckCircle2, Maximize2, Minimize2, Split
} from 'lucide-react';
import { executeModelRequest } from '../services/modelManager';
import db from '../db/database';

const STARTER_TEMPLATES = [
  {
    id: 'saas_ai',
    name: 'SaaS AI Platform',
    category: 'Software & AI',
    desc: 'Dark theme high-converting landing page with animated gradients, pricing & FAQ.',
    code: `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexusAI — Next-Gen Autonomous Intelligence</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #060913; color: #f1f5f9; }
    .gradient-glow { background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.25) 0%, transparent 65%); }
    .glass-card { background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .glass-card:hover { border-color: rgba(99, 102, 241, 0.4); transform: translateY(-4px); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  </style>
</head>
<body class="overflow-x-hidden">
  <!-- Top Glow -->
  <div class="fixed inset-0 gradient-glow pointer-events-none"></div>

  <!-- Navbar -->
  <nav class="sticky top-0 z-50 backdrop-blur-md bg-[#060913]/80 border-b border-white/5 px-6 py-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-lg shadow-indigo-500/25">
          ⚡
        </div>
        <span class="text-lg font-extrabold tracking-tight text-white">Nexus<span class="text-indigo-400">AI</span></span>
      </div>
      <div class="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
        <a href="#features" class="hover:text-white transition">Features</a>
        <a href="#solutions" class="hover:text-white transition">Solutions</a>
        <a href="#pricing" class="hover:text-white transition">Pricing</a>
        <a href="#faq" class="hover:text-white transition">FAQ</a>
      </div>
      <div class="flex items-center gap-3">
        <a href="#pricing" class="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs hover:opacity-95 shadow-md shadow-indigo-500/20 transition">Get Started Free</a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="relative pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
      ✨ Introducing Autonomous Multi-Agent Workflows
    </div>
    <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
      Automate Your Business Operations with <span class="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">Private Local AI</span>
    </h1>
    <p class="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      Execute autonomous market research, instant finance invoicing, CRM synchronization, and smart browser automation without recurring cloud fees.
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="#pricing" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2">
        Launch Free Trial &rarr;
      </a>
      <a href="#features" class="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-card text-slate-300 font-semibold text-sm hover:text-white transition">
        Explore Features
      </a>
    </div>
  </header>

  <!-- Feature Grid -->
  <section id="features" class="py-16 px-6 max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Capabilities</h2>
      <p class="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Autonomous Growth</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-8 rounded-2xl">
        <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-6">🤖</div>
        <h3 class="text-lg font-bold text-white mb-2">Autonomous Agent OS</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Decompose high-level business goals into specialized agent graphs for automated research, code, and finance.</p>
      </div>
      <div class="glass-card p-8 rounded-2xl">
        <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl mb-6">🌐</div>
        <h3 class="text-lg font-bold text-white mb-2">Visual Browser Takeover</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Watch the agent navigate websites, scroll feeds, interact with elements, and extract structured datasets in real-time.</p>
      </div>
      <div class="glass-card p-8 rounded-2xl">
        <div class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-xl mb-6">🛡️</div>
        <h3 class="text-lg font-bold text-white mb-2">100% Offline Standalone ERP</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Manage CRM, Invoices, Expenses, Payroll, Inventory, and Kanban Tasks locally with zero internet requirement.</p>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="py-16 px-6 max-w-5xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Simple Pricing</h2>
      <p class="text-2xl sm:text-3xl font-extrabold text-white">Pay Once. Own Forever.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="glass-card p-8 rounded-3xl relative">
        <h3 class="text-base font-bold text-slate-300">Starter Edition</h3>
        <div class="my-4"><span class="text-4xl font-extrabold text-white">Free</span> <span class="text-xs text-slate-400">/ forever</span></div>
        <p class="text-xs text-slate-400 mb-6">Essential offline ERP, CRM, Invoicing, Document Vault & Local AI chat.</p>
        <button class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition">Download Free</button>
      </div>
      <div class="glass-card p-8 rounded-3xl relative border-indigo-500/50 bg-gradient-to-b from-indigo-950/20 to-slate-900/60">
        <div class="absolute -top-3 right-6 bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">Most Popular</div>
        <h3 class="text-base font-bold text-white">Pro Lifetime License</h3>
        <div class="my-4"><span class="text-4xl font-extrabold text-white">₦25,000</span> <span class="text-xs text-slate-400">/ one-time</span></div>
        <p class="text-xs text-slate-400 mb-6">Unlimited Autonomous Browser Takeover, Multi-Agent Orchestrator & Priority Updates.</p>
        <button class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition">Unlock Lifetime Access</button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-white/5 py-8 text-center text-xs text-slate-500">
    <p>&copy; 2026 NexusAI. Built with Casjoe Agent OS Studio. All rights reserved.</p>
  </footer>
</body>
</html>`
  },
  {
    id: 'school_portal',
    name: 'School & Academy Portal',
    category: 'Education & Schools',
    desc: 'Modern education portal with admissions banner, faculty directory, curriculum & tuition.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Greenwood International Academy — Excellence in Education</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Outfit', sans-serif; }</style>
</head>
<body class="bg-slate-50 text-slate-900">
  <!-- Announcement Bar -->
  <div class="bg-emerald-900 text-emerald-200 px-4 py-2 text-center text-xs font-semibold">
    📢 2026/2027 Academic Admissions are now open! <a href="#apply" class="underline font-bold text-white ml-1">Apply Online &rarr;</a>
  </div>

  <!-- Header -->
  <nav class="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">🎓</div>
        <div>
          <h1 class="text-base font-bold text-slate-900 leading-tight">Greenwood Academy</h1>
          <p class="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Port Harcourt Campus</p>
        </div>
      </div>
      <div class="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
        <a href="#about" class="hover:text-emerald-600">About</a>
        <a href="#academics" class="hover:text-emerald-600">Academics</a>
        <a href="#admissions" class="hover:text-emerald-600">Admissions</a>
        <a href="#contact" class="hover:text-emerald-600">Contact</a>
      </div>
      <a href="#apply" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20">Enroll Student</a>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="py-20 px-6 bg-gradient-to-b from-emerald-50/60 to-white text-center">
    <div class="max-w-3xl mx-auto">
      <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">Accredited Cambridge & National Curriculum</span>
      <h2 class="text-4xl sm:text-5xl font-black text-slate-950 mt-4 mb-6 leading-tight">Nurturing Tomorrow's Global Innovators & Leaders</h2>
      <p class="text-base text-slate-600 mb-8 leading-relaxed">Providing world-class STEM, arts, leadership development, and character education in a secure, vibrant campus environment.</p>
      <div class="flex items-center justify-center gap-4">
        <a href="#apply" class="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition">Submit Admission Form</a>
        <a href="#contact" class="px-7 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition">Book Campus Tour</a>
      </div>
    </div>
  </header>

  <!-- Quick Info Cards -->
  <section class="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 -mt-10">
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div class="text-2xl mb-3">🔬</div>
      <h3 class="font-bold text-base text-slate-900 mb-1">State-of-the-Art Labs</h3>
      <p class="text-xs text-slate-600">Robotics, Artificial Intelligence, and Modern Chemistry & Biology research suites.</p>
    </div>
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div class="text-2xl mb-3">🏅</div>
      <h3 class="font-bold text-base text-slate-900 mb-1">Sports & Recreation</h3>
      <p class="text-xs text-slate-600">Olympic swimming pool, football academy, basketball courts, and athletics training.</p>
    </div>
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div class="text-2xl mb-3">🌍</div>
      <h3 class="font-bold text-base text-slate-900 mb-1">Global University Placements</h3>
      <p class="text-xs text-slate-600">100% university admission rate across premier institutions in the UK, US, Canada & Nigeria.</p>
    </div>
  </section>

  <!-- Contact Section -->
  <footer id="contact" class="bg-slate-900 text-slate-300 py-12 px-6">
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
      <div>
        <h4 class="font-bold text-white text-sm mb-3">Greenwood Academy</h4>
        <p class="text-slate-400 leading-relaxed">Forces Avenue, Old GRA, Port Harcourt, Rivers State, Nigeria.</p>
      </div>
      <div>
        <h4 class="font-bold text-white text-sm mb-3">Admissions Office</h4>
        <p class="text-slate-400">Phone: +234 803 555 0192</p>
        <p class="text-slate-400">Email: admissions@greenwood.sch.ng</p>
      </div>
      <div>
        <h4 class="font-bold text-white text-sm mb-3">Office Hours</h4>
        <p class="text-slate-400">Monday - Friday: 07:30 AM - 04:30 PM</p>
      </div>
    </div>
  </footer>
</body>
</html>`
  },
  {
    id: 'solar_energy',
    name: 'Solar Energy & Inverter Co',
    category: 'Energy & Commerce',
    desc: 'Commercial clean energy installer page with ROI calculator, inverter packages & WhatsApp CTA.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SunPower Africa — 24/7 Uninterrupted Solar Power</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-[#0B1120] text-slate-100">
  <nav class="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
    <div class="flex items-center gap-2">
      <span class="text-2xl text-amber-400">☀️</span>
      <span class="font-extrabold text-lg text-white">SunPower<span class="text-amber-400">Africa</span></span>
    </div>
    <a href="https://wa.me/2348001234567" target="_blank" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-2">
      💬 WhatsApp Quote
    </a>
  </nav>

  <header class="py-16 px-6 text-center max-w-4xl mx-auto">
    <span class="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full uppercase">Zero Generator Noise • 24/7 Electricity</span>
    <h1 class="text-4xl sm:text-5xl font-extrabold text-white mt-4 mb-6 leading-tight">Reliable Solar Power for Homes & Businesses in Nigeria</h1>
    <p class="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8">Stop spending ₦150k+ monthly on petrol and diesel. Switch to tier-1 Lithium Inverter solutions with 5-year warranty.</p>
    <div class="flex items-center justify-center gap-4">
      <a href="#packages" class="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20">View Inverter Packages</a>
    </div>
  </header>

  <section id="packages" class="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
      <h3 class="font-bold text-white text-base">3.5kVA Basic Home</h3>
      <p class="text-2xl font-extrabold text-amber-400 my-2">₦1,450,000</p>
      <p class="text-xs text-slate-400 mb-4">Powers TV, Lights, Fans, Laptop & Decoders.</p>
      <ul class="text-xs text-slate-300 space-y-2 mb-6">
        <li>✓ 1x 3.5kVA Pure Sine Wave Inverter</li>
        <li>✓ 1x 5kWh Lithium Battery</li>
        <li>✓ 4x 450W Mono Solar Panels</li>
        <li>✓ Complete Installation Included</li>
      </ul>
      <button class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl">Order Package</button>
    </div>

    <div class="bg-slate-900 border-2 border-amber-500/80 p-6 rounded-2xl relative shadow-xl shadow-amber-500/10">
      <div class="absolute -top-3 right-4 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-3 py-0.5 rounded-full uppercase">Most Recommended</div>
      <h3 class="font-bold text-white text-base">5kVA Standard Villa</h3>
      <p class="text-2xl font-extrabold text-amber-400 my-2">₦2,850,000</p>
      <p class="text-xs text-slate-400 mb-4">Powers 1x 1HP Inverter AC, Fridge, TVs & Lights.</p>
      <ul class="text-xs text-slate-300 space-y-2 mb-6">
        <li>✓ 1x 5kVA MPPT Smart Inverter</li>
        <li>✓ 2x 5kWh Lithium Iron Phosphate (LiFePO4)</li>
        <li>✓ 8x 550W Mono PERC Panels</li>
        <li>✓ Surge Protection & Remote App</li>
      </ul>
      <button class="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">Order Package</button>
    </div>

    <div class="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
      <h3 class="font-bold text-white text-base">10kVA Commercial</h3>
      <p class="text-2xl font-extrabold text-amber-400 my-2">₦5,400,000</p>
      <p class="text-xs text-slate-400 mb-4">Powers Offices, Multiple ACs, Freezers & Equipment.</p>
      <ul class="text-xs text-slate-300 space-y-2 mb-6">
        <li>✓ 1x 10kVA Heavy Duty Inverter</li>
        <li>✓ 3x 5kWh High Capacity Lithium</li>
        <li>✓ 16x 550W High-Efficiency Panels</li>
        <li>✓ 5-Year Replacement Warranty</li>
      </ul>
      <button class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl">Order Package</button>
    </div>
  </section>
</body>
</html>`
  }
];

export default function CodeStudioView({ initialCode = null, onNavigateTab }) {
  const [code, setCode] = useState(initialCode || STARTER_TEMPLATES[0].code);
  const [activeViewMode, setActiveViewMode] = useState('split'); // 'split' | 'code' | 'preview'
  const [viewport, setViewport] = useState('desktop'); // 'desktop' (100%) | 'tablet' (768px) | 'mobile' (375px)
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(STARTER_TEMPLATES[0].id);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  // Handle AI Code Generation or Modification
  const handleGenerateCode = async () => {
    if (!userPrompt.trim()) return;
    setIsGenerating(true);
    setSaveStatus('');

    const systemPrompt = `You are a world-class Frontend Engineer and UI/UX Designer.
Your job is to generate a complete, standalone, production-ready, beautiful HTML/CSS/JS landing page or web component.
Guidelines:
1. Always use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>).
2. Use modern fonts like 'Plus Jakarta Sans', 'Inter', or 'Outfit'.
3. Include modern UI elements: glowing gradients, glassmorphism cards, clear responsive hero sections, feature grids, pricing tables, testimonials, FAQs, and footers.
4. Output ONLY valid, complete HTML code (starting with <!DOCTYPE html> and ending with </html>). Do not include markdown explanation tags before or after.`;

    try {
      const messages = [
        {
          role: 'user',
          content: `Current Code Context:\n\`\`\`html\n${code.slice(0, 1500)}\n\`\`\`\n\nUser Request: "${userPrompt}"\n\nGenerate the complete, updated, beautiful HTML file:`
        }
      ];

      const res = await executeModelRequest({
        systemPrompt,
        messages
      });

      let raw = res.content || '';
      // Clean markdown code fence if returned
      const match = raw.match(/```html([\s\S]*?)```/) || raw.match(/```([\s\S]*?)```/);
      const cleanHtml = match ? match[1].trim() : raw.trim();

      if (cleanHtml.startsWith('<!DOCTYPE') || cleanHtml.startsWith('<html') || cleanHtml.includes('<body')) {
        setCode(cleanHtml);
        setSaveStatus('✨ AI Landing Page generated successfully!');
      } else {
        setCode(cleanHtml);
      }
      setUserPrompt('');
    } catch (err) {
      setSaveStatus(`Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export as standalone index.html
  const handleExportHtml = () => {
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing_page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSaveStatus('📥 Exported landing_page.html to your Downloads!');
  };

  // Copy Code to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save to Workspace / Document Vault
  const handleSaveToVault = async () => {
    try {
      const docName = `Landing Page (${new Date().toLocaleDateString()})`;
      await db.documents.add({
        name: docName,
        size: `${Math.round(code.length / 1024 * 10) / 10} KB`,
        type: 'html',
        content: code,
        summary: 'Interactive HTML Landing Page created with Casjoe AI Studio',
        createdAt: new Date().toISOString()
      });
      setSaveStatus(`💾 Saved to Document Vault as "${docName}"!`);
    } catch (err) {
      setSaveStatus(`Save error: ${err.message}`);
    }
  };

  // Open Fullscreen in New Window / Tab
  const handleOpenFullscreen = () => {
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] bg-[#070B15] text-slate-100 overflow-hidden select-none">
      {/* Studio Top Toolbar */}
      <div className="bg-[#0B1222] border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Branding & Template Selector */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 rounded-xl font-bold shadow-md shadow-orange-500/10">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              AI Code & Landing Page Studio
              <span className="text-[9px] bg-amber-500/20 text-amber-400 font-mono font-extrabold px-1.5 py-0.5 rounded">LIVE PREVIEW</span>
            </h1>
            <p className="text-[11px] text-slate-400">Design, code & preview responsive web apps in real-time</p>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Template:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                const sel = STARTER_TEMPLATES.find(t => t.id === e.target.value);
                if (sel) {
                  setSelectedTemplateId(sel.id);
                  setCode(sel.code);
                  setSaveStatus(`Loaded "${sel.name}" template.`);
                }
              }}
              className="bg-[#050811] border border-slate-800 text-xs text-amber-300 font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {STARTER_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Viewport Controls & Layout Modes */}
        <div className="flex items-center gap-2">
          {/* View Mode: Split / Code / Preview */}
          <div className="flex items-center bg-[#050811] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveViewMode('split')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeViewMode === 'split' ? 'bg-[#111A30] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Split View (Code + Live Preview)"
            >
              <Split className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setActiveViewMode('code')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeViewMode === 'code' ? 'bg-[#111A30] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Code Editor Only"
            >
              <Code className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Code</span>
            </button>
            <button
              onClick={() => setActiveViewMode('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeViewMode === 'preview' ? 'bg-[#111A30] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Live Interactive Preview Only"
            >
              <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Responsive Viewport Switcher */}
          {(activeViewMode === 'preview' || activeViewMode === 'split') && (
            <div className="hidden sm:flex items-center bg-[#050811] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded-lg text-xs transition ${viewport === 'desktop' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}
                title="Desktop View (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded-lg text-xs transition ${viewport === 'tablet' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-lg text-xs transition ${viewport === 'mobile' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions (Copy, Save, Export, Fullscreen) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#050811] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition"
            title="Copy HTML to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleSaveToVault}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#050811] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition"
            title="Save to Document Vault"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleOpenFullscreen}
            className="p-1.5 bg-[#050811] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition"
            title="Open Live Preview in New Window"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportHtml}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition"
            title="Download Standalone index.html"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export HTML</span>
          </button>
        </div>
      </div>

      {/* AI Prompt Modification Bar */}
      <div className="bg-[#090E1B] border-b border-slate-800/80 px-4 py-2.5 flex items-center gap-2 shrink-0">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <input
          type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerateCode()}
          placeholder="Ask AI to modify or build (e.g. 'Add a modern dark pricing table with 3 tiers and testimonials')..."
          disabled={isGenerating}
          className="flex-1 bg-[#050811] border border-slate-800/80 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 font-mono placeholder-slate-500"
        />
        <button
          onClick={handleGenerateCode}
          disabled={isGenerating || !userPrompt.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition disabled:opacity-50 shadow-md shadow-orange-500/20 shrink-0"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating UI...' : 'Update Design'}</span>
        </button>
      </div>

      {/* Status Feedback Banner */}
      {saveStatus && (
        <div className="bg-amber-950/40 border-b border-amber-800/50 text-amber-300 text-xs px-4 py-1.5 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            {saveStatus}
          </span>
          <button onClick={() => setSaveStatus('')} className="text-amber-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Main Workspace Area (Split / Code / Preview) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Code Editor */}
        {(activeViewMode === 'split' || activeViewMode === 'code') && (
          <div className={`${activeViewMode === 'split' ? 'w-1/2 border-r border-slate-800' : 'w-full'} flex flex-col bg-[#050811] overflow-hidden`}>
            <div className="bg-[#0B1222]/80 border-b border-slate-800 px-3.5 py-2 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
              <span className="flex items-center gap-2 text-slate-300 font-bold">
                <FileCode className="w-3.5 h-3.5 text-amber-400" /> index.html (Tailwind CSS)
              </span>
              <span>{code.split('\n').length} lines</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-[#050811] text-slate-200 font-mono text-xs p-4 leading-relaxed focus:outline-none resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800"
              spellCheck="false"
            />
          </div>
        )}

        {/* Right Pane: Live Interactive Iframe Sandbox Preview */}
        {(activeViewMode === 'split' || activeViewMode === 'preview') && (
          <div className={`${activeViewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col bg-[#0A0F1D] overflow-hidden items-center justify-start relative`}>
            <div className="w-full bg-[#0B1222]/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-300">Live Browser Sandbox</span>
              </div>
              <span className="text-[11px] text-slate-500">Viewport: {viewport.toUpperCase()}</span>
            </div>

            <div className="flex-1 w-full h-full flex items-center justify-center p-2 overflow-auto">
              <div
                className={`h-full bg-white rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-slate-800 ${
                  viewport === 'mobile'
                    ? 'w-[375px] max-w-full my-auto'
                    : viewport === 'tablet'
                    ? 'w-[768px] max-w-full my-auto'
                    : 'w-full'
                }`}
              >
                <iframe
                  ref={iframeRef}
                  srcDoc={code}
                  title="Live Preview Sandbox"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
