const fs = require('fs');
const path = require('path');

const websiteDir = path.join(__dirname, 'website');
const docsDir = path.join(__dirname, 'docs');

if (!fs.existsSync(websiteDir)) fs.mkdirSync(websiteDir, { recursive: true });
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Casjoe Agent OS — Autonomous Local AI Operating System & Business Suite</title>
  <meta name="description" content="Stop paying $1,500+/year in AI & ERP subscriptions. Run 100% offline, private AI with autonomous browser agents, CRM, invoicing, inventory, and document RAG on your PC.">
  
  <!-- Open Graph / Meta -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Casjoe Agent OS — Autonomous Local AI Operating System">
  <meta property="og:description" content="Pay Once. Own Forever. Offline AI agents, CRM, Invoicing, and Document Vault for PC, Mac & Linux.">
  <meta property="og:image" content="banner.png">

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#fffbeb',
              100: '#fef3c7',
              200: '#fde68a',
              300: '#fcd34d',
              400: '#fbbf24',
              500: '#f59e0b',
              600: '#d97706',
              700: '#b45309',
              800: '#92400e',
              900: '#78350f',
            },
            dark: {
              950: '#07090e',
              900: '#0f172a',
              850: '#131d35',
              800: '#1e293b',
              700: '#334155'
            }
          },
          animation: {
            'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'float': 'float 6s ease-in-out infinite',
          },
          keyframes: {
            float: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
            }
          }
        }
      }
    }
  </script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #07090e;
      color: #f8fafc;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .glass-card {
      background: rgba(19, 29, 53, 0.65);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(245, 158, 11, 0.15);
    }
    .glass-card-hover {
      transition: all 0.3s ease;
    }
    .glass-card-hover:hover {
      border-color: rgba(245, 158, 11, 0.45);
      transform: translateY(-4px);
      box-shadow: 0 12px 30px -10px rgba(245, 158, 11, 0.2);
    }
    .gradient-text {
      background: linear-gradient(135deg, #fef3c7 0%, #f59e0b 50%, #d97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .grid-pattern {
      background-image: radial-gradient(rgba(245, 158, 11, 0.08) 1px, transparent 0);
      background-size: 28px 28px;
    }
  </style>
</head>
<body class="antialiased selection:bg-amber-500 selection:text-black">

  <!-- TOP BANNER -->
  <div class="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-black py-2.5 px-4 text-center text-xs md:text-sm font-semibold tracking-wide flex items-center justify-center gap-2">
    <span class="bg-black text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">Limited Launch Deal</span>
    <span>Get Lifetime Pro Access for only <strong>$19.99</strong> (Pay Once, Own Forever &mdash; Zero Monthly Fees)</span>
    <a href="https://casperjoe.gumroad.com/l/casjoeagent" target="_blank" class="underline font-bold ml-2 hover:opacity-80 transition">Claim Deal &rarr;</a>
  </div>

  <!-- NAVBAR -->
  <nav class="sticky top-0 z-50 bg-dark-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <!-- Logo -->
      <a href="#" class="flex items-center gap-3 group">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
          <img src="logo.png" alt="Casjoe Logo" class="w-full h-full object-contain rounded-[10px] bg-dark-950 p-1" onerror="this.src='https://raw.githubusercontent.com/okparacasperjoe/casjoe-agent-os/main/casjoelocalailogoicon.png'">
        </div>
        <div>
          <span class="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
            Casjoe <span class="text-amber-400">Agent OS</span>
          </span>
          <span class="text-[10px] block font-mono text-slate-400 -mt-1 tracking-wider uppercase">Autonomous Local AI Platform</span>
        </div>
      </a>

      <!-- Nav Links -->
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#features" class="hover:text-amber-400 transition">Features</a>
        <a href="#autonomous-agent" class="hover:text-amber-400 transition">Autonomous Agent</a>
        <a href="#calculator" class="hover:text-amber-400 transition">Savings Calculator</a>
        <a href="#erp-suite" class="hover:text-amber-400 transition">ERP Suite</a>
        <a href="#pricing" class="hover:text-amber-400 transition">Pricing</a>
        <a href="#faq" class="hover:text-amber-400 transition">FAQ</a>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <a href="https://github.com/okparacasperjoe/casjoe-agent-os/releases" target="_blank" class="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition">
          <i data-lucide="download" class="w-4 h-4 text-amber-400"></i> Free Download
        </a>
        <a href="https://casperjoe.gumroad.com/l/casjoeagent" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5">
          <i data-lucide="zap" class="w-4 h-4 fill-current"></i> Buy Pro ($19.99)
        </a>
      </div>
    </div>
  </nav>

  <!-- HERO SECTION -->
  <section class="relative pt-12 pb-24 overflow-hidden grid-pattern">
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none"></div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      
      <!-- Pill Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6 animate-pulse-slow">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span>100% Offline • Zero Data Leaks • $0 Monthly Cloud Subscriptions</span>
      </div>

      <!-- Main Headline -->
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
        Stop Paying <span class="text-red-400 line-through decoration-red-500/60">$1,500+/Year</span> In Recurring Software Fees.
        <span class="block mt-2 gradient-text">Run Your Entire Business 100% Offline.</span>
      </h1>

      <!-- Subheadline -->
      <p class="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
        <strong>Casjoe Agent OS</strong> brings together a <span class="text-amber-300 font-medium">Manus-Grade Autonomous Browser Agent</span>, complete <span class="text-amber-300 font-medium">Offline ERP Suite</span> (CRM, Invoicing, Inventory, POS), and <span class="text-amber-300 font-medium">Document Vault RAG</span> &mdash; directly on your PC, Mac, or Linux laptop.
      </p>

      <!-- CTA Buttons Group -->
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
        <a href="https://casperjoe.gumroad.com/l/casjoeagent" target="_blank" class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 transition-all transform hover:-translate-y-1">
          <i data-lucide="sparkles" class="w-5 h-5 fill-current"></i>
          <span>Get Lifetime Pro License &mdash; $19.99</span>
        </a>
        <a href="https://github.com/okparacasperjoe/casjoe-agent-os/releases" target="_blank" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all">
          <i data-lucide="download" class="w-5 h-5 text-amber-400"></i>
          <span>Download Free Edition</span>
        </a>
      </div>

      <!-- Trust Badges -->
      <div class="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
        <span class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i> Pay once, own forever</span>
        <span class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i> Zero internet needed for local AI</span>
        <span class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i> Windows, macOS & Linux</span>
        <span class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i> Runs smoothly on 8GB RAM laptops</span>
      </div>

      <!-- PRODUCT INTERACTIVE PREVIEW MOCKUP -->
      <div class="mt-14 relative max-w-5xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-amber-500/40 via-slate-700/30 to-slate-900/50 shadow-2xl shadow-amber-500/10" id="autonomous-agent">
        <div class="rounded-xl bg-dark-950 border border-slate-800 overflow-hidden shadow-2xl">
          
          <!-- Mock Window Title Bar -->
          <div class="bg-dark-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span class="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1">
                <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400"></i> Casjoe Agent OS &mdash; Local Offline Mode
              </span>
            </div>
            
            <!-- Live Tabs in Mockup -->
            <div class="hidden sm:flex items-center gap-1 bg-dark-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button onclick="switchHeroTab('browser')" id="tab-btn-browser" class="px-3 py-1 rounded font-medium bg-amber-500 text-black transition">Autonomous Browser</button>
              <button onclick="switchHeroTab('erp')" id="tab-btn-erp" class="px-3 py-1 rounded font-medium text-slate-400 hover:text-white transition">ERP & Invoicing</button>
              <button onclick="switchHeroTab('rag')" id="tab-btn-rag" class="px-3 py-1 rounded font-medium text-slate-400 hover:text-white transition">Document Vault RAG</button>
              <button onclick="switchHeroTab('prompts')" id="tab-btn-prompts" class="px-3 py-1 rounded font-medium text-slate-400 hover:text-white transition">120+ Prompts</button>
            </div>
          </div>

          <!-- Mock Window Body -->
          <div class="p-6 bg-dark-950 min-h-[420px] text-left relative overflow-hidden flex flex-col justify-between" id="hero-tab-content">
            
            <!-- TAB 1: Autonomous Browser (Default) -->
            <div id="tab-content-browser" class="space-y-4">
              <!-- Omnibar -->
              <div class="flex items-center gap-2 bg-dark-850 p-2.5 rounded-xl border border-amber-500/30 shadow-inner">
                <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold flex items-center gap-1">
                  <i data-lucide="bot" class="w-3.5 h-3.5"></i> AI AUTONOMOUS
                </span>
                <span class="text-xs text-slate-300 font-mono flex-1 truncate">
                  "Find top 10 agro suppliers in Lagos, extract contact details, and draft supplier inquiry emails"
                </span>
                <span class="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono animate-pulse">Running Task (Step 3/5)</span>
              </div>

              <!-- Browser Live View Simulation -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <!-- Live browser canvas with simulated cursor -->
                <div class="md:col-span-2 bg-slate-900 rounded-xl p-4 border border-slate-800 relative min-h-[260px] overflow-hidden">
                  <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs text-slate-400">
                    <span class="flex items-center gap-1"><i data-lucide="globe" class="w-3.5 h-3.5 text-blue-400"></i> Google Search SERP Navigation</span>
                    <span class="text-amber-400 font-mono">100% Autonomous</span>
                  </div>
                  
                  <div class="space-y-2.5 opacity-90 text-xs">
                    <div class="p-2.5 rounded bg-dark-850 border border-slate-800 text-slate-300">
                      <div class="text-blue-400 font-semibold flex items-center justify-between">
                        1. Lagos Agro-Allied Commodities Ltd.
                        <span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Scraped</span>
                      </div>
                      <p class="text-[11px] text-slate-400 mt-1">Contact: info@lagosagro.com | Tel: +234 803 123 4567 | Ikeja, Lagos</p>
                    </div>

                    <div class="p-2.5 rounded bg-dark-850 border border-amber-500/40 text-slate-300 shadow-md">
                      <div class="text-blue-400 font-semibold flex items-center justify-between">
                        2. GreenHarvest Grains & Feeds Nigeria
                        <span class="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded animate-pulse">Filling Form...</span>
                      </div>
                      <p class="text-[11px] text-slate-400 mt-1">Automating inquiry form with typewriter keystroke animation...</p>
                    </div>

                    <div class="p-2.5 rounded bg-dark-850 border border-slate-800 text-slate-400">
                      <div class="text-blue-400 font-semibold">3. Prime Agro Export Hub</div>
                      <p class="text-[11px] text-slate-500 mt-1">Queued for autonomous deep extraction...</p>
                    </div>
                  </div>

                  <!-- Animated Cursor Pointer Overlay -->
                  <div class="absolute bottom-12 right-1/4 flex items-center gap-2 pointer-events-none animate-float">
                    <div class="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
                    </div>
                    <span class="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">Casjoe AI Cursor</span>
                  </div>
                </div>

                <!-- Execution Terminal Logs -->
                <div class="bg-dark-900 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2 flex flex-col justify-between">
                  <div class="space-y-1.5">
                    <div class="text-xs font-bold text-amber-400 flex items-center gap-1 border-b border-slate-800 pb-1">
                      <i data-lucide="terminal" class="w-3.5 h-3.5"></i> Execution Steps
                    </div>
                    <div class="text-emerald-400">&gt; Initialized local engine</div>
                    <div class="text-slate-400">&gt; Navigated to SERP</div>
                    <div class="text-slate-400">&gt; Synthesized 10 suppliers</div>
                    <div class="text-amber-300 font-bold">&gt; Keystrokes & Click Active</div>
                  </div>
                  <div class="bg-dark-950 p-2 rounded border border-slate-800 text-[10px] text-slate-400">
                    Memory: <span class="text-emerald-400">4.2 GB RAM</span> | Latency: <span class="text-amber-400">0ms Cloud</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 2: ERP & Invoicing (Hidden by default) -->
            <div id="tab-content-erp" class="hidden space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="bg-dark-850 p-4 rounded-xl border border-slate-800">
                  <span class="text-xs text-slate-400">Total Invoiced</span>
                  <div class="text-xl font-bold text-white mt-1">$48,250.00</div>
                  <span class="text-[10px] text-emerald-400">&uarr; 24% this month</span>
                </div>
                <div class="bg-dark-850 p-4 rounded-xl border border-slate-800">
                  <span class="text-xs text-slate-400">Active CRM Customers</span>
                  <div class="text-xl font-bold text-white mt-1">142 Clients</div>
                  <span class="text-[10px] text-amber-400">Stored 100% locally</span>
                </div>
                <div class="bg-dark-850 p-4 rounded-xl border border-slate-800">
                  <span class="text-xs text-slate-400">Inventory Items</span>
                  <div class="text-xl font-bold text-white mt-1">320 SKUs</div>
                  <span class="text-[10px] text-blue-400">POS Checkout Ready</span>
                </div>
              </div>
              <div class="bg-dark-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold text-amber-400">Instant Natural-Language Invoice Creation:</span>
                  <span class="text-[11px] font-mono text-slate-400">PDF Generator Ready</span>
                </div>
                <div class="bg-dark-950 p-2.5 rounded border border-slate-800 font-mono text-slate-300">
                  <span class="text-amber-400 font-bold">User:</span> "Generate an invoice for Amaka Johnson: 50 Custom Web Designs @ $150 each, with 5% VAT" &rarr; <span class="text-emerald-400">Invoice #INV-2026-089 generated in 0.4s</span>
                </div>
              </div>
            </div>

            <!-- TAB 3: Document Vault RAG (Hidden by default) -->
            <div id="tab-content-rag" class="hidden space-y-4">
              <div class="bg-dark-850 p-4 rounded-xl border border-slate-800">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <i data-lucide="file-text" class="w-4 h-4"></i> Local Document RAG (Zero Cloud Transmission)
                  </span>
                  <span class="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">PDF.js Local Vectorizer</span>
                </div>
                <p class="text-xs text-slate-300">
                  Drop contracts, 500-page business plans, or medical manuals. Query specific clauses, synthesize summaries, or compare terms without a single byte leaving your SSD.
                </p>
              </div>
              <div class="p-3 rounded-lg bg-dark-950 border border-slate-800 text-xs font-mono text-slate-400">
                <span class="text-emerald-400">&gt; Indexed:</span> "2026_Commercial_Lease_Agreement.pdf" (42 pages, 100% offline chunking)
              </div>
            </div>

            <!-- TAB 4: 120+ Prompts (Hidden by default) -->
            <div id="tab-content-prompts" class="hidden space-y-4">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div class="p-3 rounded-xl bg-dark-850 border border-slate-800 text-slate-300 hover:border-amber-500/50 transition">
                  <div class="font-bold text-amber-400">🏥 Healthcare</div>
                  <div class="text-[10px] text-slate-400 mt-1">Clinical notes, triage guides, dosage charts</div>
                </div>
                <div class="p-3 rounded-xl bg-dark-850 border border-slate-800 text-slate-300 hover:border-amber-500/50 transition">
                  <div class="font-bold text-amber-400">⚖️ Legal</div>
                  <div class="text-[10px] text-slate-400 mt-1">NDAs, vendor contracts, dispute briefs</div>
                </div>
                <div class="p-3 rounded-xl bg-dark-850 border border-slate-800 text-slate-300 hover:border-amber-500/50 transition">
                  <div class="font-bold text-amber-400">📈 Marketing</div>
                  <div class="text-[10px] text-slate-400 mt-1">Ad copy, sales funnels, SEO strategy</div>
                </div>
                <div class="p-3 rounded-xl bg-dark-850 border border-slate-800 text-slate-300 hover:border-amber-500/50 transition">
                  <div class="font-bold text-amber-400">💼 Finance</div>
                  <div class="text-[10px] text-slate-400 mt-1">Cashflow models, audit checks, tax prep</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- SAAS TRAP VS CASJOE (THE PROBLEM & COMPARISON) -->
  <section class="py-20 bg-dark-900 border-y border-slate-800/80">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto">
        <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400">The Subscription Trap</h2>
        <p class="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Why Pay Rent on Software When You Can Own It?</p>
        <p class="mt-4 text-slate-300 text-base">
          Modern SaaS platforms charge monthly fees for every seat, lock your data in foreign cloud servers, and stop working the moment your internet cuts out.
        </p>
      </div>

      <!-- Comparison Matrix Grid -->
      <div class="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        <!-- The Expensive SaaS Stack -->
        <div class="glass-card rounded-2xl p-8 border-red-500/20 relative">
          <div class="flex items-center justify-between pb-6 border-b border-slate-800">
            <div>
              <h3 class="text-xl font-bold text-red-400 flex items-center gap-2">
                <i data-lucide="x-circle" class="w-5 h-5 text-red-400"></i> The Traditional SaaS Stack
              </h3>
              <p class="text-xs text-slate-400 mt-1">Recurring monthly drain on your business</p>
            </div>
            <span class="text-2xl font-extrabold text-red-400">~$1,500<span class="text-xs font-normal text-slate-400">/yr</span></span>
          </div>

          <div class="mt-6 space-y-4 text-sm text-slate-300">
            <div class="flex items-center justify-between p-3 rounded-lg bg-dark-950/60 border border-slate-800">
              <span class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4 text-red-400"></i> ChatGPT Plus / Claude Pro</span>
              <span class="font-mono font-semibold text-red-300">$240 / year</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-dark-950/60 border border-slate-800">
              <span class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4 text-red-400"></i> HubSpot / Pipedrive CRM</span>
              <span class="font-mono font-semibold text-red-300">$600 / year</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-dark-950/60 border border-slate-800">
              <span class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4 text-red-400"></i> QuickBooks / FreshBooks</span>
              <span class="font-mono font-semibold text-red-300">$360 / year</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-dark-950/60 border border-slate-800">
              <span class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4 text-red-400"></i> Web Automation & Scraping</span>
              <span class="font-mono font-semibold text-red-300">$300 / year</span>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800 text-xs text-red-300/80 space-y-1.5">
            <p>&bull; Cloud downtime & internet dependent</p>
            <p>&bull; Client data stored on foreign third-party servers</p>
            <p>&bull; Price hikes happen every year without your consent</p>
          </div>
        </div>

        <!-- Casjoe Agent OS Solution -->
        <div class="glass-card rounded-2xl p-8 border-amber-500/40 relative shadow-xl shadow-amber-500/10 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-6 border-b border-amber-500/20">
              <div>
                <h3 class="text-xl font-bold text-amber-400 flex items-center gap-2">
                  <i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i> Casjoe Agent OS (Pro)
                </h3>
                <p class="text-xs text-slate-300 mt-1">Autonomous Agent + Full ERP Suite</p>
              </div>
              <div class="text-right">
                <span class="text-3xl font-extrabold text-amber-400">$19.99</span>
                <span class="block text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Pay Once &bull; Lifetime</span>
              </div>
            </div>

            <div class="mt-6 space-y-4 text-sm text-slate-200">
              <div class="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <span class="flex items-center gap-2 font-medium"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Autonomous AI Browser Agent</span>
                <span class="font-mono text-emerald-400 font-bold">Included</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <span class="flex items-center gap-2 font-medium"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> CRM, Invoicing, Inventory & POS</span>
                <span class="font-mono text-emerald-400 font-bold">Included</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <span class="flex items-center gap-2 font-medium"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Local Document RAG & PDF Vault</span>
                <span class="font-mono text-emerald-400 font-bold">Included</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <span class="flex items-center gap-2 font-medium"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> 120+ Enterprise Sector Prompts</span>
                <span class="font-mono text-emerald-400 font-bold">Included</span>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800">
            <a href="https://casperjoe.gumroad.com/l/casjoeagent" target="_blank" class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20">
              <i data-lucide="zap" class="w-4 h-4 fill-current"></i> Buy Pro Lifetime License ($19.99)
            </a>
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- INTERACTIVE ROI / SAVINGS CALCULATOR -->
  <section id="calculator" class="py-20 bg-dark-950 relative">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400">Live ROI Simulator</h2>
        <p class="mt-2 text-3xl font-extrabold text-white">Calculate Your Real Savings Over Time</p>
        <p class="mt-3 text-slate-400 text-sm">Select the subscriptions you currently pay for and see how much cash stays in your pocket.</p>
      </div>

      <div class="glass-card rounded-2xl p-8 border-slate-800 shadow-2xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Tool Selection Checkboxes -->
          <div class="lg:col-span-7 space-y-3">
            <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Select Cloud Subscriptions:</h3>
            
            <label class="flex items-center justify-between p-3.5 rounded-xl bg-dark-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
              <div class="flex items-center gap-3">
                <input type="checkbox" id="calc-chatgpt" checked class="w-4 h-4 text-amber-500 rounded bg-dark-950 border-slate-700 focus:ring-0" onchange="calculateSavings()">
                <span class="text-sm font-medium text-slate-200">ChatGPT Plus / Claude AI Pro</span>
              </div>
              <span class="text-xs font-mono text-slate-400">$20 / month</span>
            </label>

            <label class="flex items-center justify-between p-3.5 rounded-xl bg-dark-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
              <div class="flex items-center gap-3">
                <input type="checkbox" id="calc-crm" checked class="w-4 h-4 text-amber-500 rounded bg-dark-950 border-slate-700 focus:ring-0" onchange="calculateSavings()">
                <span class="text-sm font-medium text-slate-200">HubSpot / Pipedrive CRM</span>
              </div>
              <span class="text-xs font-mono text-slate-400">$50 / month</span>
            </label>

            <label class="flex items-center justify-between p-3.5 rounded-xl bg-dark-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
              <div class="flex items-center gap-3">
                <input type="checkbox" id="calc-invoicing" checked class="w-4 h-4 text-amber-500 rounded bg-dark-950 border-slate-700 focus:ring-0" onchange="calculateSavings()">
                <span class="text-sm font-medium text-slate-200">QuickBooks / Invoicing Software</span>
              </div>
              <span class="text-xs font-mono text-slate-400">$30 / month</span>
            </label>

            <label class="flex items-center justify-between p-3.5 rounded-xl bg-dark-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
              <div class="flex items-center gap-3">
                <input type="checkbox" id="calc-automation" checked class="w-4 h-4 text-amber-500 rounded bg-dark-950 border-slate-700 focus:ring-0" onchange="calculateSavings()">
                <span class="text-sm font-medium text-slate-200">Web Automation & Scraping</span>
              </div>
              <span class="text-xs font-mono text-slate-400">$25 / month</span>
            </label>

            <!-- Years Slider -->
            <div class="pt-4">
              <div class="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Timeframe Horizon:</span>
                <span id="calc-years-label" class="text-amber-400 font-bold font-mono">3 Years</span>
              </div>
              <input type="range" id="calc-years" min="1" max="5" value="3" step="1" class="w-full accent-amber-500 cursor-pointer" oninput="calculateSavings()">
              <div class="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 Year</span>
                <span>3 Years</span>
                <span>5 Years</span>
              </div>
            </div>
          </div>

          <!-- Total Savings Result Card -->
          <div class="lg:col-span-5 bg-gradient-to-br from-dark-900 to-dark-850 p-6 rounded-2xl border border-amber-500/30 text-center space-y-4 shadow-xl">
            <span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Estimated Money Saved</span>
            <div class="text-4xl sm:text-5xl font-black gradient-text font-mono" id="calc-savings-total">
              $4,480.01
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              Cloud SaaS would cost you <span id="calc-saas-total" class="text-red-400 font-mono font-bold">$4,500.00</span>. With Casjoe Agent OS, you pay <span class="text-emerald-400 font-mono font-bold">$19.99</span> once.
            </p>
            <div class="pt-2">
              <a href="https://casperjoe.gumroad.com/l/casjoeagent" target="_blank" class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20">
                <i data-lucide="wallet" class="w-4 h-4 fill-current"></i> Keep Your Money &rarr; Get Pro
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  </section>

  <!-- CORE FEATURES BENTO GRID -->
  <section id="features" class="py-24 bg-dark-900 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400">Everything You Need In One Desktop OS</h2>
        <p class="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Built for Maximum Speed, Autonomy & Privacy</p>
        <p class="mt-4 text-slate-400 text-base">Engineered specifically to give small businesses, agencies, and power users enterprise-level superpowers on everyday laptops.</p>
      </div>

      <!-- Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Bento 1: Autonomous Web Engine (Span 2) -->
        <div class="md:col-span-2 glass-card glass-card-hover rounded-2xl p-8 relative overflow-hidden">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
            <i data-lucide="mouse-pointer-click" class="w-6 h-6"></i>
          </div>
          <h3 class="text-2xl font-bold text-white">Manus-Grade Autonomous Web Engine</h3>
          <p class="mt-3 text-slate-300 text-sm leading-relaxed">
            Watch the AI live cursor browse the web, interact with inputs using human typewriter keystrokes, extract structured data from Google search results, and fill online forms autonomously.
          </p>
          <div class="mt-6 flex flex-wrap gap-2 text-xs font-mono">
            <span class="px-3 py-1 rounded-lg bg-dark-950 border border-slate-800 text-amber-300">Live AI Cursor</span>
            <span class="px-3 py-1 rounded-lg bg-dark-950 border border-slate-800 text-amber-300">Google SERP Takeover</span>
            <span class="px-3 py-1 rounded-lg bg-dark-950 border border-slate-800 text-amber-300">Form AutoFill</span>
            <span class="px-3 py-1 rounded-lg bg-dark-950 border border-slate-800 text-amber-300">Yopmail Workflow</span>
          </div>
        </div>

        <!-- Bento 2: 100% Offline Privacy -->
        <div class="glass-card glass-card-hover rounded-2xl p-8">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
            <i data-lucide="shield-check" class="w-6 h-6"></i>
          </div>
          <h3 class="text-xl font-bold text-white">Zero Cloud Leaks & 100% Offline</h3>
          <p class="mt-3 text-slate-300 text-sm leading-relaxed">
            Powered locally by Ollama (Llama 3.2, Phi-3, Mistral). Your client files, financial ledgers, and trade secrets never leave your device.
          </p>
          <div class="mt-6 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <i data-lucide="lock" class="w-4 h-4"></i> Complete Offline Data Sovereignty
          </div>
        </div>

        <!-- Bento 3: Full Business Suite (CRM + Finance) -->
        <div class="glass-card glass-card-hover rounded-2xl p-8" id="erp-suite">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
            <i data-lucide="briefcase" class="w-6 h-6"></i>
          </div>
          <h3 class="text-xl font-bold text-white">Integrated ERP Suite</h3>
          <p class="mt-3 text-slate-300 text-sm leading-relaxed">
            Manage your customers in a unified CRM, issue professional PDF invoices with tax calculations, and track revenue without third-party subscriptions.
          </p>
          <div class="mt-6 text-xs text-blue-400 font-semibold flex items-center gap-1.5">
            <i data-lucide="receipt" class="w-4 h-4"></i> PDF Invoicing & CRM in One Place
          </div>
        </div>

        <!-- Bento 4: Inventory & Point-of-Sale (POS) -->
        <div class="glass-card glass-card-hover rounded-2xl p-8">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
            <i data-lucide="shopping-cart" class="w-6 h-6"></i>
          </div>
          <h3 class="text-xl font-bold text-white">Inventory & Point of Sale (POS)</h3>
          <p class="mt-3 text-slate-300 text-sm leading-relaxed">
            Track stock levels, set low-inventory alerts, and ring up sales with thermal receipt printing directly from your counter.
          </p>
          <div class="mt-6 text-xs text-purple-400 font-semibold flex items-center gap-1.5">
            <i data-lucide="printer" class="w-4 h-4"></i> Thermal Receipt Printing Ready
          </div>
        </div>

        <!-- Bento 5: Document Vault RAG & 120+ Prompts -->
        <div class="glass-card glass-card-hover rounded-2xl p-8">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
            <i data-lucide="library" class="w-6 h-6"></i>
          </div>
          <h3 class="text-xl font-bold text-white">120+ Sector Prompts & Document RAG</h3>
          <p class="mt-3 text-slate-300 text-sm leading-relaxed">
            Pre-tuned AI prompts across 12 sectors (Healthcare, Law, Tech, Finance, Marketing) plus client-side PDF document interrogation.
          </p>
          <div class="mt-6 text-xs text-amber-400 font-semibold flex items-center gap-1.5">
            <i data-lucide="sparkles" class="w-4 h-4"></i> 12 Enterprise Sectors Pre-Configured
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- STEP BY STEP HOW IT WORKS -->
  <section class="py-20 bg-dark-950 border-t border-slate-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400">Zero Technical Headaches</h2>
        <p class="mt-2 text-3xl font-extrabold text-white">Up & Running in Under 3 Minutes</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div class="p-6 rounded-2xl bg-dark-900 border border-slate-800 relative">
          <div class="w-10 h-10 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center mb-4">1</div>
          <h3 class="text-lg font-bold text-white">Download & Install</h3>
          <p class="mt-2 text-sm text-slate-400">Download the installer for Windows (.exe), macOS (.dmg), or Linux (.tar.gz) from GitHub releases.</p>
        </div>

        <div class="p-6 rounded-2xl bg-dark-900 border border-slate-800 relative">
          <div class="w-10 h-10 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center mb-4">2</div>
          <h3 class="text-lg font-bold text-white">Connect Local AI</h3>
          <p class="mt-2 text-sm text-slate-400">Download free Ollama and pull any model (Llama 3.2, Phi-3, Mistral). Casjoe auto-detects it in 1 second.</p>
        </div>

        <div class="p-6 rounded-2xl bg-dark-900 border border-slate-800 relative">
          <div class="w-10 h-10 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center mb-4">3</div>
          <h3 class="text-lg font-bold text-white">Activate Pro & Automate</h3>
          <p class="mt-2 text-sm text-slate-400">Enter your Pro license key in Settings to unlock unlimited prompts, advanced autonomous web agents, and priority updates.</p>
        </div>

      </div>

    </div>
  </section>

  <!-- PRICING SECTION -->
  <section id="pricing" class="py-24 bg-dark-900 border-t border-slate-800 relative">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400">Simple, Honest Pricing</h2>
        <p class="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Pay Once. Keep Forever. No Hidden Fees.</p>
        <p class="mt-4 text-slate-400 text-base">Never worry about surprise price increases or canceled accounts again.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        
        <!-- FREE STARTER -->
        <div class="glass-card rounded-2xl p-8 border-slate-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 class="text-xl font-bold text-white">Community Starter</h3>
                <p class="text-xs text-slate-400 mt-1">For students & basic offline AI exploration</p>
              </div>
              <span class="text-3xl font-extrabold text-white">$0</span>
            </div>

            <ul class="mt-6 space-y-3.5 text-sm text-slate-300">
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Core Local AI Chat</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Basic CRM & Invoice Generation</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Inventory & Point of Sale</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Document RAG Search</li>
              <li class="flex items-center gap-2.5 text-slate-500"><i data-lucide="x" class="w-4 h-4 text-slate-600"></i> Advanced Autonomous Web Engine</li>
              <li class="flex items-center gap-2.5 text-slate-500"><i data-lucide="x" class="w-4 h-4 text-slate-600"></i> Priority Auto-Updater & Support</li>
            </ul>
          </div>

          <div class="mt-8">
            <a href="https://github.com/okparacasperjoe/casjoe-agent-os/releases" target="_blank" class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">
              <i data-lucide="download" class="w-4 h-4"></i> Download Free App
            </a>
          </div>
        </div>

        <!-- PRO LIFETIME (HIGHLIGHTED) -->
        <div class="glass-card rounded-2xl p-8 border-amber-500/50 relative shadow-2xl shadow-amber-500/20 flex flex-col justify-between bg-gradient-to-b from-dark-850 to-dark-900">
          
          <!-- Popular Pill -->
          <div class="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[11px] font-black uppercase tracking-wider shadow">
            Most Popular &bull; Lifetime
          </div>

          <div>
            <div class="flex items-center justify-between pb-4 border-b border-amber-500/20">
              <div>
                <h3 class="text-xl font-bold text-amber-400">Pro Lifetime License</h3>
                <p class="text-xs text-slate-300 mt-1">Full power for businesses & agencies</p>
              </div>
              <div class="text-right">
                <span class="text-3xl font-black text-amber-400">$19.99</span>
                <span class="block text-[10px] text-slate-400 font-mono">one-time payment</span>
              </div>
            </div>

            <ul class="mt-6 space-y-3.5 text-sm text-slate-200">
              <li class="flex items-center gap-2.5 font-medium"><i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400"></i> <strong>Everything in Starter</strong></li>
              <li class="flex items-center gap-2.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400"></i> <strong>Autonomous Browser Engine</strong> (Google SERP & Live Cursor)</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400"></i> <strong>Unlimited Prompt Studio Slots</strong></li>
              <li class="flex items-center gap-2.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400"></i> <strong>Commercial License</strong> (Use for your business/clients)</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400"></i> <strong>One-Click In-App Auto Updates</strong></li>
              <li class="flex items-center gap-2.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400"></i> <strong>Instant Gumroad License Delivery</strong></li>
            </ul>
          </div>

          <div class="mt-8">
            <a href="https://casperjoe.gumroad.com/l/casjoeagent" target="_blank" class="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 transition transform hover:-translate-y-0.5">
              <i data-lucide="zap" class="w-5 h-5 fill-current"></i> Buy Pro License &mdash; $19.99
            </a>
            <p class="text-[11px] text-center text-slate-400 mt-2.5 flex items-center justify-center gap-1">
              <i data-lucide="shield" class="w-3.5 h-3.5 text-emerald-400"></i> 30-Day Money-Back Guarantee &bull; Instant Access
            </p>
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- FAQ SECTION (OBJECTION BUSTERS) -->
  <section id="faq" class="py-20 bg-dark-950 border-t border-slate-800">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-2xl mx-auto mb-14">
        <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400">Got Questions?</h2>
        <p class="mt-2 text-3xl font-extrabold text-white">Frequently Asked Questions</p>
      </div>

      <div class="space-y-4">
        
        <details class="group bg-dark-900 border border-slate-800 rounded-xl p-5 open:border-amber-500/40 transition">
          <summary class="flex items-center justify-between font-semibold text-white cursor-pointer list-none">
            <span>Do I need an expensive gaming computer or GPU to run this?</span>
            <span class="text-amber-400 group-open:rotate-180 transition-transform"><i data-lucide="chevron-down" class="w-5 h-5"></i></span>
          </summary>
          <p class="mt-3 text-sm text-slate-400 leading-relaxed">
            No. Casjoe Agent OS was engineered specifically to run smoothly on standard 8GB RAM laptops using lightweight models like Llama 3.2 (3B) or Phi-3 via Ollama. No expensive cloud GPU required.
          </p>
        </details>

        <details class="group bg-dark-900 border border-slate-800 rounded-xl p-5 open:border-amber-500/40 transition">
          <summary class="flex items-center justify-between font-semibold text-white cursor-pointer list-none">
            <span>Does it really work 100% offline without internet?</span>
            <span class="text-amber-400 group-open:rotate-180 transition-transform"><i data-lucide="chevron-down" class="w-5 h-5"></i></span>
          </summary>
          <p class="mt-3 text-sm text-slate-400 leading-relaxed">
            Yes! All core features &mdash; AI Chat, CRM, Invoicing, Inventory, POS, and Document Vault RAG &mdash; run completely offline using your local CPU/RAM and local IndexedDB database. The Autonomous Browser Agent connects to the web only when you ask it to search or scrape online websites.
          </p>
        </details>

        <details class="group bg-dark-900 border border-slate-800 rounded-xl p-5 open:border-amber-500/40 transition">
          <summary class="flex items-center justify-between font-semibold text-white cursor-pointer list-none">
            <span>How do I get my Pro license key after purchase?</span>
            <span class="text-amber-400 group-open:rotate-180 transition-transform"><i data-lucide="chevron-down" class="w-5 h-5"></i></span>
          </summary>
          <p class="mt-3 text-sm text-slate-400 leading-relaxed">
            Immediately upon completing checkout on Gumroad, your license key is displayed on screen and emailed to you. Simply copy the key, open <strong>Settings &rarr; License Activation</strong> in Casjoe Agent OS, paste it in, and Pro unlocks instantly.
          </p>
        </details>

        <details class="group bg-dark-900 border border-slate-800 rounded-xl p-5 open:border-amber-500/40 transition">
          <summary class="flex items-center justify-between font-semibold text-white cursor-pointer list-none">
            <span>Can I use this for my business or clients?</span>
            <span class="text-amber-400 group-open:rotate-180 transition-transform"><i data-lucide="chevron-down" class="w-5 h-5"></i></span>
          </summary>
          <p class="mt-3 text-sm text-slate-400 leading-relaxed">
            Yes. The Pro License includes a full commercial license. You can use Casjoe Agent OS to run your company, manage customer accounts, issue invoices, and perform automated web research for clients.
          </p>
        </details>

        <details class="group bg-dark-900 border border-slate-800 rounded-xl p-5 open:border-amber-500/40 transition">
          <summary class="flex items-center justify-between font-semibold text-white cursor-pointer list-none">
            <span>What operating systems are supported?</span>
            <span class="text-amber-400 group-open:rotate-180 transition-transform"><i data-lucide="chevron-down" class="w-5 h-5"></i></span>
          </summary>
          <p class="mt-3 text-sm text-slate-400 leading-relaxed">
            Casjoe Agent OS is natively built for Windows 10/11 (NSIS Installer), macOS (Apple Silicon & Intel DMG), and Linux (tar.gz/zip).
          </p>
        </details>

      </div>

    </div>
  </section>

  <!-- FINAL CTA CALLOUT -->
  <section class="py-20 bg-gradient-to-b from-dark-900 to-dark-950 border-t border-slate-800 text-center relative overflow-hidden">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
        Take Full Control of Your AI & Business Today.
      </h2>
      <p class="mt-4 text-slate-300 text-lg max-w-2xl mx-auto">
        Join hundreds of smart entrepreneurs, freelancers, and businesses saving thousands every year with Casjoe Agent OS.
      </p>
      
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="https://casperjoe.gumroad.com/l/casjoeagent" target="_blank" class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-2xl shadow-amber-500/40 transition transform hover:-translate-y-1">
          <i data-lucide="zap" class="w-5 h-5 fill-current"></i> Buy Lifetime Pro License ($19.99)
        </a>
        <a href="https://github.com/okparacasperjoe/casjoe-agent-os/releases" target="_blank" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">
          <i data-lucide="download" class="w-5 h-5 text-amber-400"></i> Download Free Version
        </a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-dark-950 py-12 border-t border-slate-900 text-slate-500 text-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
      
      <div class="flex items-center gap-3">
        <img src="logo.png" alt="Casjoe Logo" class="w-6 h-6 object-contain" onerror="this.src='https://raw.githubusercontent.com/okparacasperjoe/casjoe-agent-os/main/casjoelocalailogoicon.png'">
        <span class="text-slate-300 font-bold">Casjoe Agent OS</span>
        <span>&copy; 2026 Casper Joe Okpara. All rights reserved.</span>
      </div>

      <div class="flex items-center gap-6 text-slate-400">
        <a href="https://github.com/okparacasperjoe/casjoe-agent-os" target="_blank" class="hover:text-amber-400 transition flex items-center gap-1">
          <i data-lucide="github" class="w-4 h-4"></i> GitHub
        </a>
        <a href="https://casperjoe.gumroad.com/l/casjoeagent" target="_blank" class="hover:text-amber-400 transition flex items-center gap-1">
          <i data-lucide="shopping-bag" class="w-4 h-4"></i> Gumroad Store
        </a>
        <a href="mailto:casperjoeproduction@gmail.com" class="hover:text-amber-400 transition flex items-center gap-1">
          <i data-lucide="mail" class="w-4 h-4"></i> Support
        </a>
      </div>

    </div>
  </footer>

  <!-- SCRIPT LOGIC -->
  <script>
    // Initialize Lucide Icons
    lucide.createIcons();

    // Tab Switching in Hero Mockup
    function switchHeroTab(tabId) {
      const tabs = ['browser', 'erp', 'rag', 'prompts'];
      tabs.forEach(t => {
        const btn = document.getElementById('tab-btn-' + t);
        const content = document.getElementById('tab-content-' + t);
        if (t === tabId) {
          btn.className = 'px-3 py-1 rounded font-medium bg-amber-500 text-black transition';
          content.classList.remove('hidden');
        } else {
          btn.className = 'px-3 py-1 rounded font-medium text-slate-400 hover:text-white transition';
          content.classList.add('hidden');
        }
      });
      lucide.createIcons();
    }

    // Savings Calculator Logic
    function calculateSavings() {
      let monthlyCost = 0;
      if (document.getElementById('calc-chatgpt').checked) monthlyCost += 20;
      if (document.getElementById('calc-crm').checked) monthlyCost += 50;
      if (document.getElementById('calc-invoicing').checked) monthlyCost += 30;
      if (document.getElementById('calc-automation').checked) monthlyCost += 25;

      const years = parseInt(document.getElementById('calc-years').value);
      document.getElementById('calc-years-label').innerText = years + (years === 1 ? ' Year' : ' Years');

      const totalSaaS = monthlyCost * 12 * years;
      const casjoeCost = 19.99;
      const netSavings = Math.max(0, totalSaaS - casjoeCost);

      document.getElementById('calc-saas-total').innerText = '$' + totalSaaS.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      document.getElementById('calc-savings-total').innerText = '$' + netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Run on load
    calculateSavings();
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(websiteDir, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(docsDir, 'index.html'), html, 'utf8');

// Copy assets
['casjoelocalailogoicon.png', 'casjoelocalai.png'].forEach(file => {
  const src = path.join(__dirname, file);
  if (fs.existsSync(src)) {
    const dest = file.includes('icon') ? 'logo.png' : 'banner.png';
    fs.copyFileSync(src, path.join(websiteDir, dest));
    fs.copyFileSync(src, path.join(docsDir, dest));
  }
});

console.log('Successfully generated website/index.html and docs/index.html');