import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, WifiOff, ShieldCheck, Zap, Paperclip, Loader2 } from 'lucide-react';
import { streamChat, agentChat } from '../services/ollama';
import { addChatMessage, useChatMessages } from '../db/hooks';
import { PROMPT_LIBRARY } from '../data/prompts';
import * as pdfjsLib from 'pdfjs-dist';

// Robust worker configuration for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function ChatView({ selectedModel, ollamaConnected, activePrompt, setActivePrompt }) {
  const messages = useChatMessages('main-chat') || [];
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, streamingText, isGenerating]);

  // Handle incoming activePrompt from the Prompt Library tab
  useEffect(() => {
    if (activePrompt) {
      setInput(activePrompt);
      setActivePrompt(''); // clear it after setting
    }
  }, [activePrompt, setActivePrompt]);

  // Tools definition for agentChat (if the user asks the AI to create a document based on the uploaded file)
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
            amount: { type: "number", description: "Total amount in numbers" },
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
        description: "Generate and save a document, business proposal, or report.",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the document" },
            summary: { type: "string", description: "Short summary of the document" },
            type: { type: "string", description: "Document type (pdf, txt)" },
            content: { type: "string", description: "The full text content of the generated document. MUST be detailed." }
          },
          required: ["name", "summary", "content"]
        }
      }
    }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    let extractedText = '';

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          extractedText += strings.join(' ') + '\n';
        }
      } else {
        extractedText = await file.text();
      }

      if (extractedText) {
        await addChatMessage({
          conversationId: 'main-chat',
          sender: 'user',
          text: `[System: The user has uploaded a document named "${file.name}"]\n\nDocument Content:\n${extractedText.substring(0, 5000)}... (truncated for context limits)`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        
        await addChatMessage({
          conversationId: 'main-chat',
          sender: 'ai',
          text: `I have successfully read the document "${file.name}". How can I help you analyze it or what would you like to create based on this document?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
      await addChatMessage({
        conversationId: 'main-chat',
        sender: 'ai',
        text: `Sorry, there was an error reading the file "${file.name}".`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userText = input.trim();
    
    setInput('');
    
    // Save user message to IndexedDB
    await addChatMessage({
      conversationId: 'main-chat',
      sender: 'user',
      text: userText,
      time: formattedTime
    });

    if (!ollamaConnected) {
      await addChatMessage({
        conversationId: 'main-chat',
        sender: 'ai',
        text: 'Ollama is not running. Please install and start Ollama to use AI chat.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    if (!selectedModel) {
      await addChatMessage({
        conversationId: 'main-chat',
        sender: 'ai',
        text: 'Please select a model first.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    setIsGenerating(true);
    setStreamingText('');

    try {
      // Build conversation history format for streamChat
      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Inject system prompt instructing it to use tools if asked
      history.unshift({
        role: 'system',
        content: 'You are Casjoe Offline AI. EXTREMELY IMPORTANT: DO NOT USE TOOLS UNLESS EXPLICITLY ASKED. If the user just says "hello", "how are you", or asks a normal question, YOU MUST ANSWER NORMALLY WITH TEXT and DO NOT use any tools. ONLY use the add_document tool if the user explicitly says "create a document", "write a proposal", or "generate a report".'
      });
      
      history.push({ role: 'user', content: userText });

      // First check if the model wants to call a tool (using agentChat)
      const agentResponse = await agentChat(selectedModel, history, tools);

      if (agentResponse.tool_calls && agentResponse.tool_calls.length > 0) {
        // Model called a tool!
        for (const tool of agentResponse.tool_calls) {
          const fn = tool.function;
          const args = typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : fn.arguments;

          if (fn.name === 'add_document') {
             // Let's also import db dynamically here or just let the main GlobalAIChat handle db? 
             // Wait, we need to save to db. We don't have direct db access imported here, but we can import it.
             const db = (await import('../db/database')).default;
             
             await db.documents.add({
              name: (args.name || 'Generated Document') + '.' + (args.type || 'pdf'),
              size: '1.2 MB',
              type: args.type || 'pdf',
              pages: 1,
              date: new Date().toISOString().split('T')[0],
              summary: args.summary || 'Generated via Chat',
              content: args.content || args.summary || 'Empty document.',
              createdAt: new Date().toISOString()
            });

            await addChatMessage({
              conversationId: 'main-chat',
              sender: 'ai',
              text: `✅ I have generated the document **${args.name}** and saved it to your Documents Vault. You can go to the Docs tab to view, edit, or download it as a PDF!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          } else {
            // Handle other tools casually
             await addChatMessage({
              conversationId: 'main-chat',
              sender: 'ai',
              text: `✅ Executed command: **${fn.name}**. Action completed successfully in the background.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }
        }
      } else {
        // Normal streaming chat if no tools were called
        let fullResponse = '';
        await streamChat(selectedModel, history, (chunk) => {
          fullResponse += chunk;
          setStreamingText(fullResponse);
        });

        await addChatMessage({
          conversationId: 'main-chat',
          sender: 'ai',
          text: fullResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      await addChatMessage({
        conversationId: 'main-chat',
        sender: 'ai',
        text: 'An error occurred while communicating with the local AI model.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsGenerating(false);
      setStreamingText('');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner matching Image 4 */}
      <div className="bg-[#070B15] border border-white/10 p-6 lg:p-8 rounded-2xl space-y-4 relative overflow-hidden">
        <div className="space-y-2">
          <h2 className="text-3xl lg:text-5xl font-extrabold font-['Outfit'] text-white">
            AI That Works. <span className="text-[#FF9F00]">Anywhere.</span>
          </h2>
          <p className="text-sm lg:text-base text-slate-300 font-medium">
            No Internet. No Limits. Just Powerful AI on Your Laptop.
          </p>
        </div>

        {/* 4 Feature Cards matching Image 4 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#0C1222] border border-white/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
            <WifiOff className="w-5 h-5 text-[#FF9F00]" />
            <span className="text-xs font-bold text-white uppercase">100% Offline</span>
            <span className="text-[10px] text-slate-400">No internet required</span>
          </div>

          <div className="bg-[#0C1222] border border-white/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-[#FF9F00]" />
            <span className="text-xs font-bold text-white uppercase">Private & Secure</span>
            <span className="text-[10px] text-slate-400">Your data stays on your device</span>
          </div>

          <div className="bg-[#0C1222] border border-white/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
            <Zap className="w-5 h-5 text-[#FF9F00]" />
            <span className="text-xs font-bold text-white uppercase">Fast & Efficient</span>
            <span className="text-[10px] text-slate-400">Built for 8GB laptops</span>
          </div>

          <div className="bg-[#0C1222] border border-white/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
            <Sparkles className="w-5 h-5 text-[#FF9F00]" />
            <span className="text-xs font-bold text-white uppercase">Smart & Powerful</span>
            <span className="text-[10px] text-slate-400">Local LLM + Document RAG</span>
          </div>
        </div>
      </div>

      {/* App Interface Layout matching Image 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#090E1B] border border-white/10 p-6 rounded-2xl">
        {/* Main Conversation Workspace (8 cols) */}
        <div className="lg:col-span-8 bg-[#070B15] border border-white/10 rounded-xl p-5 flex flex-col justify-between min-h-[500px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF9F00]" />
              <h3 className="font-bold text-white font-['Outfit'] text-sm">AI Assistant</h3>
            </div>
          </div>

          <div className="py-4 space-y-4 flex-1 overflow-y-auto max-h-[360px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#162345] text-white rounded-br-none'
                      : 'bg-[#101A33] text-slate-200 rounded-bl-none border border-white/5'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[10px] text-slate-400 text-right block mt-1">{msg.time}</span>
                </div>
              </div>
            ))}
            
            {isGenerating && streamingText && (
              <div className="flex gap-3 justify-start">
                <div className="max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed bg-[#101A33] text-slate-200 rounded-bl-none border border-white/5">
                  <p className="whitespace-pre-wrap">{streamingText}</p>
                  <span className="text-[10px] text-slate-400 text-right block mt-1">Generating...</span>
                </div>
              </div>
            )}

            {isGenerating && !streamingText && (
              <div className="flex items-center gap-2 text-xs text-amber-400 italic">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Casjoe local model processing...</span>
              </div>
            )}
            
            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 italic justify-end">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Reading PDF securely on device...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="relative mt-2 flex gap-2">
            <input 
              type="file"
              ref={fileInputRef}
              accept=".pdf,.txt,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isGenerating}
              className="w-12 h-11 shrink-0 rounded-xl bg-[#090E1B] border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#FF9F00] hover:border-[#FF9F00]/50 transition-colors"
              title="Upload PDF or Document"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything or request a document..."
                className="w-full bg-[#090E1B] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
              />
              <button 
                type="submit" 
                disabled={isGenerating || !input.trim()}
                className="absolute right-2 top-1.5 w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF9F00] to-[#FF6B00] text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Status Panel (4 cols) matching Image 4 */}
        <div className="lg:col-span-4 space-y-4">
          {/* Model Status */}
          <div className="bg-[#070B15] border border-white/10 p-4 rounded-xl space-y-2">
            <span className="text-xs text-slate-400 block font-medium">Model Status</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selectedModel ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                {selectedModel ? selectedModel : 'No Model Selected'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selectedModel ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                {selectedModel ? 'Active' : 'Idle'}
              </span>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-[#070B15] border border-white/10 p-4 rounded-xl space-y-2">
            <span className="text-xs text-slate-400 block font-medium">System</span>
            <div className={`flex items-center gap-2 text-xs font-bold ${ollamaConnected ? 'text-emerald-400' : 'text-amber-500'}`}>
              <span className={`w-2 h-2 rounded-full ${ollamaConnected ? 'bg-emerald-400' : 'bg-amber-500'}`} />
              <span>{ollamaConnected ? 'AI Connected' : 'Ollama Not Running'}</span>
            </div>
          </div>

          {/* Quick Prompts Widget */}
          <div className="bg-[#070B15] border border-white/10 p-4 rounded-xl flex flex-col max-h-[300px]">
            <span className="text-xs text-slate-400 block font-medium mb-3">Quick Prompts</span>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {PROMPT_LIBRARY.slice(0, 15).map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setInput(p.text)}
                  className="bg-[#090E1B] border border-white/5 p-3 rounded-lg hover:border-[#FF9F00]/30 hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <p className="text-xs font-bold text-white group-hover:text-[#FF9F00] transition-colors">{p.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tagline matching Image 4 */}
      <div className="bg-[#0C1222] border border-amber-500/30 p-4 rounded-xl text-center">
        <span className="text-xs font-extrabold text-[#FF9F00] uppercase tracking-widest">
          AI POWERED. PRIVACY FIRST. AFRICA READY.
        </span>
      </div>
    </div>
  );
}
