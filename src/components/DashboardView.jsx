import React, { useState } from 'react';
import { Users, ShoppingCart, TrendingUp, Sparkles, Send, UserPlus, FileText, CheckSquare, MoreVertical, CheckCheck } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { addChatMessage } from '../db/hooks';
import { streamChat } from '../services/ollama';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardView({ stats, onOpenModal }) {
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: 'Summarize sales performance for this month.',
      time: '10:30 AM'
    },
    {
      id: 2,
      sender: 'ai',
      text: 'Sales are up 18% this month. Revenue increased by 22% compared to last month.',
      time: '10:30 AM'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [timeRange, setTimeRange] = useState('This Month');

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputQuery.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const query = inputQuery;
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "Sales performance shows steady offline growth across regional retail stores.";
      if (query.toLowerCase().includes('invoice') || query.toLowerCase().includes('revenue')) {
        replyText = "Revenue for July reached ₦9.8M with an 18% increase month-over-month.";
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  // Sparkline Chart Config matching Image 1
  const createSparklineData = (dataPoints) => ({
    labels: ['', '', '', '', '', '', ''],
    datasets: [
      {
        data: dataPoints,
        borderColor: '#FF9F00',
        borderWidth: 2.5,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 50);
          gradient.addColorStop(0, 'rgba(255, 159, 0, 0.4)');
          gradient.addColorStop(1, 'rgba(255, 159, 0, 0)');
          return gradient;
        },
        tension: 0.45,
        pointRadius: 0
      }
    ]
  });

  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } }
  };

  // Analytics Line Chart Data matching Image 1
  const analyticsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Sales',
        data: [3, 7, 10, 8, 12, 11, 18],
        borderColor: '#FF8A00',
        borderWidth: 2.5,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#FF8A00',
        pointRadius: 0
      },
      {
        label: 'Revenue',
        data: [2, 3, 5, 6, 8, 7, 9],
        borderColor: '#38BDF8',
        borderWidth: 2.5,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#38BDF8',
        pointRadius: 0
      }
    ]
  };

  const analyticsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748B', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#64748B',
          font: { size: 11 },
          callback: (val) => (val === 0 ? '0' : `${val}K`)
        },
        max: 20
      }
    }
  };

  // Donut Chart Data matching Image 1
  const donutData = {
    labels: ['Sales', 'Revenue', 'AI Tasks'],
    datasets: [
      {
        data: [55, 30, 15],
        backgroundColor: ['#FF8A00', '#38BDF8', '#8B5CF6'],
        borderWidth: 0,
        hoverOffset: 2
      }
    ]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    plugins: { legend: { display: false } }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* 4 Metric Cards matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Customers */}
        <div className="bg-[#0C1222] border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#FF9F00]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-300">Customers</span>
          </div>

          <div className="text-2xl lg:text-3xl font-extrabold font-['Outfit'] text-white">
            {stats?.customers || 0}
          </div>

          <div className="h-10 w-full absolute bottom-0 left-0 right-0 pointer-events-none">
            <Line data={createSparklineData([5, 12, 8, 15, 10, 20, 25])} options={sparklineOptions} />
          </div>
        </div>

        {/* Card 2: Sales */}
        <div className="bg-[#0C1222] border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#FF9F00]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-300">Invoices</span>
          </div>

          <div className="text-2xl lg:text-3xl font-extrabold font-['Outfit'] text-white">
            {stats?.invoices || 0}
          </div>

          <div className="h-10 w-full absolute bottom-0 left-0 right-0 pointer-events-none">
            <Line data={createSparklineData([2, 5, 3, 7, 6, 8, 10])} options={sparklineOptions} />
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div className="bg-[#0C1222] border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#FF9F00]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-300">Documents</span>
          </div>

          <div className="text-2xl lg:text-3xl font-extrabold font-['Outfit'] text-white">
            {stats?.documents || 0}
          </div>

          <div className="h-10 w-full absolute bottom-0 left-0 right-0 pointer-events-none">
            <Line data={createSparklineData([1, 2, 2, 4, 3, 5, 7])} options={sparklineOptions} />
          </div>
        </div>

        {/* Card 4: AI Tasks */}
        <div className="bg-[#0C1222] border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#FF9F00]">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-300">AI Tasks</span>
          </div>

          <div className="text-2xl lg:text-3xl font-extrabold font-['Outfit'] text-white">
            {stats?.chatMessages || 0}
          </div>

          <div className="h-10 w-full absolute bottom-0 left-0 right-0 pointer-events-none">
            <Line data={createSparklineData([0, 5, 2, 10, 15, 8, 20])} options={sparklineOptions} />
          </div>
        </div>
      </div>

      {/* Middle Grid: Analytics (2/3) + AI Assistant Widget (1/3) matching Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Analytics Panel */}
        <div className="lg:col-span-2 bg-[#0C1222] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold font-['Outfit'] text-white">Analytics</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-[#090E1B] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
            >
              <option value="This Month">This Month ∨</option>
              <option value="This Quarter">This Quarter</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          {/* Charts Row: Line Graph + Donut Chart matching Image 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 h-64">
              <Line data={analyticsData} options={analyticsOptions} />
            </div>

            {/* Donut Chart */}
            <div className="flex flex-col items-center justify-center relative">
              <div className="w-40 h-40 relative flex items-center justify-center">
                <Doughnut data={donutData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-2xl font-extrabold text-white font-['Outfit']">72%</span>
                  <span className="text-[11px] font-medium text-slate-400">Growth</span>
                </div>
              </div>

              {/* Legend matching Image 1 */}
              <div className="flex items-center justify-center gap-3 mt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]" /> Sales</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" /> AI Tasks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right AI Assistant Sidebar Panel matching Image 1 */}
        <div className="bg-[#0C1222] border border-white/10 rounded-2xl p-5 flex flex-col justify-between min-h-[440px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF9F00]" />
              <h3 className="font-bold text-white font-['Outfit'] text-base">AI Assistant</h3>
            </div>
            <button className="text-slate-400 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="py-4 space-y-4 flex-1 overflow-y-auto max-h-[320px]">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9F00] to-[#FF6B00] text-black font-bold flex items-center justify-center text-xs shrink-0 mt-1 shadow-md">
                    C
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#162345] text-white rounded-br-none'
                      : 'bg-[#101A33] text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-slate-400">
                    <span>{msg.time}</span>
                    {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-sky-400" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-amber-400 italic">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Casjoe AI processing offline...</span>
              </div>
            )}
          </div>

          {/* Input Box matching Image 1 */}
          <form onSubmit={handleSendMessage} className="relative mt-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask AI anything..."
              className="w-full bg-[#090E1B] border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1.5 w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9F00] to-[#FF6B00] text-black flex items-center justify-center hover:opacity-90 transition-opacity shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 4 Bottom Quick Action Cards matching Image 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <button
          onClick={() => onOpenModal('addCustomer')}
          className="bg-[#0C1222] border border-white/10 hover:border-amber-500/40 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FF9F00] flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserPlus className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-200">Add Customer</span>
        </button>

        <button
          onClick={() => onOpenModal('createInvoice')}
          className="bg-[#0C1222] border border-white/10 hover:border-amber-500/40 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FF9F00] flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-200">Create Invoice</span>
        </button>

        <button
          onClick={() => onOpenModal('addTask')}
          className="bg-[#0C1222] border border-white/10 hover:border-amber-500/40 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FF9F00] flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckSquare className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-200">Add Task</span>
        </button>

        <button
          onClick={() => onOpenModal('aiReport')}
          className="bg-[#0C1222] border border-white/10 hover:border-amber-500/40 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FF9F00] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-200">AI Report</span>
        </button>
      </div>
    </div>
  );
}
