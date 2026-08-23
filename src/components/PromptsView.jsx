import React, { useState, useMemo } from "react";
import { Search, BookOpen, ChevronRight, Copy, Check } from "lucide-react";
import { PROMPT_LIBRARY } from "../data/prompts";

export default function PromptsView({ onUsePrompt }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  const categories = ["All", ...new Set(PROMPT_LIBRARY.map((p) => p.category))];

  const filteredPrompts = useMemo(() => {
    return PROMPT_LIBRARY.filter((prompt) => {
      const matchesCategory = activeCategory === "All" || prompt.category === activeCategory;
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0C1222] border border-white/10 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold font-['Outfit'] text-white flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-[#FF9F00]" />
              Enterprise Prompt Library
            </h1>
            <span className="bg-[#FF9F00]/10 border border-[#FF9F00]/30 text-[#FF9F00] text-xs font-mono font-bold px-3 py-1 rounded-full">
              100+ Offline Prompts (12 Sectors)
            </span>
          </div>
          <p className="text-slate-400 text-sm max-w-3xl">
            Pre-loaded with 120+ role-engineered, professional prompts covering Business, Healthcare, IT, Legal, Real Estate, Finance, Marketing, HR, E-Commerce, Education, Sales, and Customer Support. 100% offline, zero prompt engineering needed!
          </p>
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#090E1B] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00]/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-[#FF9F00] text-black"
                  : "bg-[#090E1B] border border-white/10 text-slate-400 hover:border-[#FF9F00]/50 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPrompts.map((prompt) => (
          <div 
            key={prompt.id} 
            onClick={() => onUsePrompt(prompt.text)}
            className="bg-[#090E1B] border border-white/10 rounded-2xl p-5 hover:border-[#FF9F00]/50 transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#FF9F00] bg-[#FF9F00]/10 px-2 py-1 rounded-md">
                {prompt.category}
              </span>
              <button 
                onClick={(e) => handleCopy(e, prompt.text, prompt.id)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                {copiedId === prompt.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <h3 className="font-bold text-white text-lg mb-1">{prompt.title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed flex-1">
              {prompt.description}
            </p>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-slate-500 group-hover:text-[#FF9F00] transition-colors">
              <span className="text-xs font-semibold">Use Prompt</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
        {filteredPrompts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
            No prompts found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
