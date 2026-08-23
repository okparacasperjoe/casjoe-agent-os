import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, Clock, Laptop, Play, MessageSquare, FileText, BookOpen, Settings, Gauge, Info, WifiOff, Minus, Square, X } from 'lucide-react';

export default function PerformanceView({ currentModel, ramUsage, cpuUsage }) {
  const [tokensPerSec, setTokensPerSec] = useState(12.4);
  const [responseTime, setResponseTime] = useState(1.23);

  const history = [
    { time: '10:20', cpu: 32, ram: 5.4, tokens: 11.8, response: 1.35 },
    { time: '10:21', cpu: 45, ram: 5.6, tokens: 12.1, response: 1.28 },
    { time: '10:22', cpu: 38, ram: 5.8, tokens: 12.4, response: 1.23 },
    { time: '10:23', cpu: 52, ram: 6.0, tokens: 13.0, response: 1.18 },
    { time: '10:24', cpu: 36, ram: 5.7, tokens: 12.5, response: 1.22 },
    { time: '10:25', cpu: 41, ram: 5.8, tokens: 12.4, response: 1.23 },
    { time: '10:26', cpu: 38, ram: 5.8, tokens: 12.4, response: 1.23 }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner matching Image 2 */}
      <div className="text-center space-y-2 py-4">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF9F00]">
          PERFORMANCE
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold font-['Outfit'] text-white">
          Fast. Efficient. Built for Local.
        </h2>
        <p className="text-sm md:text-base text-slate-300">
          High performance AI on standard 8 GB laptops.
        </p>

        {/* Laptop Badge top right matching Image 2 */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex items-center gap-3 bg-[#0C1222] border border-amber-500/40 px-5 py-2.5 rounded-full shadow-lg">
            <Laptop className="w-5 h-5 text-[#FF9F00]" />
            <span className="text-xs font-bold text-white">Runs on 8 GB Laptops</span>
          </div>
        </div>
      </div>

      {/* Main Desktop Window Mockup matching Image 2 */}
      <div className="bg-[#070B15] border border-white/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/80">
        {/* Titlebar matching Image 2 */}
        <div className="bg-[#090E1B] border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#FF9F00] text-black font-bold flex items-center justify-center text-[10px]">
              C
            </div>
            <span className="text-xs font-bold text-white">Casjoe Local AI</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Running Locally</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Minus className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
              <Square className="w-3 h-3 cursor-pointer hover:text-white" />
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-400" />
            </div>
          </div>
        </div>

        {/* Desktop App Interior matching Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          {/* Sub Sidebar (2 cols) */}
          <div className="md:col-span-2 bg-[#090E1B] border-r border-white/10 p-3 space-y-4 flex flex-col justify-between">
            <nav className="space-y-1">
              <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Chat</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Documents</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Knowledge Base</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#FF9F00] bg-[#111A30] rounded-lg cursor-pointer">
                <Gauge className="w-4 h-4 text-[#FF9F00]" />
                <span>Performance</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer">
                <Info className="w-4 h-4 text-slate-400" />
                <span>About</span>
              </div>
            </nav>

            {/* Offline Pill matching Image 2 */}
            <div className="bg-[#0C1222] border border-white/10 p-2.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Offline Mode</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <WifiOff className="w-3 h-3 text-slate-400" />
                <span>No Internet Required</span>
              </div>
            </div>
          </div>

          {/* Center AI Chat preview (4 cols) */}
          <div className="md:col-span-4 border-r border-white/10 p-4 space-y-4 flex flex-col justify-between bg-[#0C1222]/50">
            <h3 className="font-bold text-white font-['Outfit'] text-sm">AI Chat</h3>

            <div className="space-y-3 overflow-y-auto max-h-[380px]">
              <div className="bg-[#162345] p-3 rounded-xl text-xs text-white space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">You</span>
                <p>How can I increase sales for my small business?</p>
                <span className="text-[10px] text-slate-400 text-right block">10:24 AM</span>
              </div>

              <div className="bg-[#101A33] p-3 rounded-xl text-xs text-slate-200 space-y-2 border border-amber-500/20">
                <div className="flex items-center gap-1.5 text-[#FF9F00] font-bold text-xs">
                  <div className="w-4 h-4 rounded-full bg-[#FF9F00] text-black text-[9px] flex items-center justify-center font-bold">C</div>
                  <span>Casjoe Local AI</span>
                </div>
                <p className="leading-relaxed">Here are proven ways to increase sales for your small business:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Understand your customers deeply</li>
                  <li>Improve your product/service</li>
                  <li>Build a strong online presence</li>
                  <li>Leverage social media marketing</li>
                  <li>Offer excellent customer service</li>
                  <li>Track your results and optimize</li>
                </ol>
                <span className="text-[10px] text-slate-400 text-right block">10:24 AM</span>
              </div>
            </div>

            <div className="bg-[#090E1B] border border-white/10 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-400">
              <span>Type your message...</span>
              <Play className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>

          {/* Right Live Performance (6 cols) matching Image 2 */}
          <div className="md:col-span-6 p-5 space-y-5 bg-[#070B15]">
            <h3 className="font-bold text-white font-['Outfit'] text-base">Live Performance</h3>

            {/* 4 Stat Cards in a row matching Image 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0C1222] border border-white/10 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block">RAM Usage</span>
                <div className="text-xl font-extrabold text-white font-['Outfit']">{ramUsage} GB</div>
                <span className="text-[10px] text-slate-500 block">72% of 8 GB</span>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>

              <div className="bg-[#0C1222] border border-white/10 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block">CPU Usage</span>
                <div className="text-xl font-extrabold text-emerald-400 font-['Outfit']">{cpuUsage}%</div>
                <span className="text-[10px] text-slate-500 block">3.0 GHz</span>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${cpuUsage}%` }} />
                </div>
              </div>

              <div className="bg-[#0C1222] border border-white/10 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block">Tokens / Sec</span>
                <div className="text-xl font-extrabold text-[#FF9F00] font-['Outfit']">{tokensPerSec}</div>
                <span className="text-[10px] text-slate-500 block">Tokens per sec</span>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="bg-[#0C1222] border border-white/10 p-3 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block">Response Time</span>
                <div className="text-xl font-extrabold text-sky-400 font-['Outfit']">{responseTime} s</div>
                <span className="text-[10px] text-slate-500 block">Average</span>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
            </div>

            {/* Performance Over Time Graph matching Image 2 */}
            <div className="bg-[#0C1222] border border-white/10 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-white font-['Outfit']">Performance Over Time</h4>
              
              <div className="h-32 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                  {/* Green line: CPU */}
                  <polyline fill="none" stroke="#22C55E" strokeWidth="2" points="0,30 80,20 160,35 240,25 320,30 400,22 500,28" />
                  {/* Purple line: RAM */}
                  <polyline fill="none" stroke="#A855F7" strokeWidth="2" points="0,50 80,48 160,52 240,45 320,50 400,47 500,49" />
                  {/* Yellow line: Tokens */}
                  <polyline fill="none" stroke="#FF9F00" strokeWidth="2" points="0,75 80,70 160,78 240,72 320,74 400,71 500,73" />
                  {/* Blue line: Response */}
                  <polyline fill="none" stroke="#38BDF8" strokeWidth="2" points="0,90 80,88 160,92 240,89 320,91 400,88 500,90" />
                </svg>
              </div>

              {/* Legend matching Image 2 */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-white/5">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> CPU Usage (%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> RAM Usage (GB)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Tokens/sec</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> Response Time (s)</span>
              </div>
            </div>

            {/* Bottom Strip Info Cards matching Image 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-[#090E1B] border border-white/10 p-3 rounded-xl text-center text-[10px]">
              <div>
                <span className="text-slate-500 block uppercase">Model</span>
                <strong className="text-white font-['Outfit']">Mistral 7B Instruct</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">Quantization</span>
                <strong className="text-amber-400 font-mono">Q4_K_M</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">Context Window</span>
                <strong className="text-white font-mono">4096</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">Threads</span>
                <strong className="text-white font-mono">8</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">Backend</span>
                <strong className="text-sky-400 font-mono">llama.cpp</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">Device</span>
                <strong className="text-emerald-400 font-mono">CPU</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
