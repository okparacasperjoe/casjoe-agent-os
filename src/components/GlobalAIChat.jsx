import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { agentChat } from '../services/ollama';
import db from '../db/database';

export default function GlobalAIChat({ selectedModel, ollamaConnected }) {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null); // { text: string, type: 'success' | 'error' | 'chat' }

  const tools = [
    {
      type: "function",
      function: {
        name: "create_invoice",
        description: "Create an invoice for a customer.",
        parameters: {
          type: "object",
          properties: {
            customer: { type: "string", description: "Name of the customer" },
            amount: { type: "number", description: "Total amount in numbers, e.g. 50000" },
            items: { type: "string", description: "Description of the items" }
          },
          required: ["customer", "amount", "items"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "add_customer",
        description: "Add a new customer to the CRM.",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the customer" },
            company: { type: "string", description: "Company name" },
            location: { type: "string", description: "City or Country" },
            phone: { type: "string", description: "Phone number" }
          },
          required: ["name", "company"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "add_document",
        description: "Add a document, lesson plan, or healthcare policy to the system.",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the document (e.g. Lesson Plan 1, Patient Protocol)" },
            summary: { type: "string", description: "Summary of the document contents" },
            type: { type: "string", description: "Document type (pdf, docx, txt)" },
            content: { type: "string", description: "The full text content of the generated document. MUST be detailed and comprehensive." }
          },
          required: ["name", "summary", "content"]
        }
      }
    }
  ];

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!command.trim() || !ollamaConnected || !selectedModel) return;

    setIsProcessing(true);
    setFeedback(null);
    const userPrompt = command;
    setCommand('');

    try {
      const messages = [
        { 
          role: 'system', 
          content: 'You are Casjoe Offline AI, an agentic AI assistant. EXTREMELY IMPORTANT: DO NOT USE TOOLS UNLESS EXPLICITLY ASKED. If the user asks a general question, DO NOT use tools. Just respond nicely with the answer directly in Markdown. ONLY use tools if they say "add a customer", "create an invoice", or "add a document".' 
        },
        { role: 'user', content: userPrompt }
      ];

      const response = await agentChat(selectedModel, messages, tools);

      if (response.tool_calls && response.tool_calls.length > 0) {
        for (const tool of response.tool_calls) {
          const fn = tool.function;
          const args = typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : fn.arguments;

          if (fn.name === 'add_customer') {
            await db.customers.add({
              name: args.name || 'Unknown',
              company: args.company || 'Unknown',
              location: args.location || 'N/A',
              phone: args.phone || 'N/A',
              totalSpent: '₦0',
              status: 'Active',
              createdAt: new Date().toISOString()
            });
            setFeedback({ text: `Customer ${args.name} added successfully!`, type: 'success' });
          } 
          else if (fn.name === 'create_invoice') {
            const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const generatedId = `INV-${new Date().getFullYear()}-${randomNum}`;
            
            await db.invoices.add({
              invoiceId: generatedId,
              customer: args.customer || 'Unknown Customer',
              amount: `₦${new Intl.NumberFormat('en-US').format(args.amount || 0)}`,
              currency: 'NGN',
              date: new Date().toISOString().split('T')[0],
              status: 'Pending',
              items: args.items || 'General Services',
              createdAt: new Date().toISOString()
            });
            setFeedback({ text: `Invoice ${generatedId} created for ${args.customer}!`, type: 'success' });
          }
          else if (fn.name === 'add_document') {
            await db.documents.add({
              name: (args.name || 'Untitled') + '.' + (args.type || 'txt'),
              size: '1.2 MB',
              type: args.type || 'txt',
              pages: 1,
              date: new Date().toISOString().split('T')[0],
              summary: args.summary || 'Added via AI Agent',
              content: args.content || args.summary || 'Empty document.',
              createdAt: new Date().toISOString()
            });
            setFeedback({ text: `Document '${args.name}' added successfully to the vault!`, type: 'success' });
          }
        }
      } else {
        // Model replied with plain text (didn't use a tool, it's a chat response)
        setFeedback({ text: response.content || "I didn't understand the command.", type: 'chat' });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ text: 'AI processing failed.', type: 'error' });
    }

    setIsProcessing(false);
    
    // Only auto-close if it's a success/error toast. Chat stays open.
    // We will clear toasts in a timeout, but not chat.
  };

  useEffect(() => {
    let timer;
    if (feedback && (feedback.type === 'success' || feedback.type === 'error')) {
      timer = setTimeout(() => setFeedback(null), 5000);
    }
    return () => clearTimeout(timer);
  }, [feedback]);

  return (
    <div className="flex-1 max-w-2xl mx-4 relative hidden lg:block">
      <form onSubmit={handleCommand} className="relative group">
        <div className={`absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-md transition-opacity duration-300 ${isProcessing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
        
        <div className="relative flex items-center bg-[#111A30] border-2 border-[#FF9F00]/30 rounded-xl overflow-hidden focus-within:border-[#FF9F00] focus-within:shadow-[0_0_15px_rgba(255,159,0,0.3)] transition-all">
          <div className="pl-4 pr-2 py-2 flex items-center justify-center bg-[#FF9F00]/10 border-r border-[#FF9F00]/20">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 text-[#FF9F00] animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#FF9F00]" />
            )}
          </div>
          
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            disabled={!ollamaConnected || isProcessing}
            placeholder="Agent Command: 'Create an invoice for Sarah for 50000' or 'Add customer Google'"
            className="w-full bg-transparent border-none py-3 px-4 text-sm text-white placeholder-amber-500/40 focus:outline-none focus:ring-0 font-medium tracking-wide"
          />
          
          <button 
            type="submit"
            disabled={!command.trim() || !ollamaConnected || isProcessing}
            className="px-4 py-2 mr-2 bg-[#FF9F00] text-black font-bold text-xs rounded-lg hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Execute
          </button>
        </div>
      </form>

      {/* Floating Feedback Panel */}
      {feedback && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-fade-in-up">
          {feedback.type === 'chat' ? (
            <div className="bg-[#0A0F1D] border border-[#FF9F00]/50 rounded-xl shadow-2xl shadow-orange-500/10 overflow-hidden flex flex-col max-h-[60vh]">
              <div className="bg-[#111A30] border-b border-white/5 px-4 py-2 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  AI Agent Response
                </span>
                <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 text-sm text-slate-300 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {feedback.text}
              </div>
            </div>
          ) : (
            <div className={`p-3 rounded-lg border flex items-center gap-3 text-sm font-bold shadow-xl ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400' 
                : 'bg-red-950/90 border-red-500/50 text-red-400'
            }`}>
              <Sparkles className="w-4 h-4" />
              {feedback.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
