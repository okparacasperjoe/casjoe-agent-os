import React, { useState } from 'react';
import { FileText, Search, Upload, BookOpen, Lock, Send, Plus, Laptop, Trash2, X, Download, Edit3, Save, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { deleteDocument, updateDocument } from '../db/hooks';
import { PRESET_QNA } from '../data/mockData';
import jsPDF from 'jspdf';

export default function DocumentsView({ documents = [], onOpenUploadModal }) {
  const [searchQuery, setSearchQuery] = useState("What are the key terms of the payment policy?");
  const [activeQna, setActiveQna] = useState(PRESET_QNA[0]);

  // Document Modal State
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    const lower = searchQuery.toLowerCase();
    let matched = PRESET_QNA.find(q => lower.includes(q.question.toLowerCase().slice(0, 15)));
    if (!matched) matched = PRESET_QNA[0];
    setActiveQna(matched);
  };

  const handleOpenDocument = (doc) => {
    setSelectedDoc(doc);
    setEditContent(doc.content || doc.summary || 'No content available.');
    setIsEditing(false);
  };

  const handleSaveDocument = async () => {
    if (selectedDoc) {
      await updateDocument(selectedDoc.id, { content: editContent });
      setSelectedDoc({ ...selectedDoc, content: editContent });
      setIsEditing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedDoc) return;
    const doc = new jsPDF();
    const margin = 10;
    const maxLineWidth = 190; // A4 width (210) - 2 * margin
    const lineHeight = 7;
    let y = 20;

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(selectedDoc.name, margin, y);
    y += lineHeight * 2;

    // Content
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const contentLines = doc.splitTextToSize(selectedDoc.content || selectedDoc.summary || '', maxLineWidth);
    
    // Page break logic
    contentLines.forEach(line => {
      if (y > 280) { // A4 height is 297
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    doc.save(selectedDoc.name.replace(/\.[^/.]+$/, "") + ".pdf");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner matching Image 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#070B15] border border-white/10 p-6 lg:p-8 rounded-2xl relative overflow-hidden">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-3xl lg:text-5xl font-extrabold font-['Outfit'] text-white leading-tight">
            Find Answers <br />
            <span className="text-[#FF9F00]">Instantly.</span>
          </h2>
          <p className="text-sm lg:text-base font-medium text-slate-300">
            Search Your Documents with AI
          </p>
          <p className="text-xs lg:text-sm text-slate-400 max-w-xl">
            Upload your documents. Ask questions. Get accurate answers with references.
          </p>

          {/* 4 Feature Cards matching Image 3 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#0C1222] border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
              <FileText className="w-5 h-5 text-rose-500" />
              <span className="text-[11px] font-bold text-white">PDF Support</span>
            </div>
            <div className="bg-[#0C1222] border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span className="text-[11px] font-bold text-white">Knowledge Base</span>
            </div>
            <div className="bg-[#0C1222] border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
              <Search className="w-5 h-5 text-amber-400" />
              <span className="text-[11px] font-bold text-white">Smart Search</span>
            </div>
            <div className="bg-[#0C1222] border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
              <Lock className="w-5 h-5 text-amber-500" />
              <span className="text-[11px] font-bold text-white">Private & Secure</span>
            </div>
          </div>
        </div>

        {/* Top Right Offline Lock Pill matching Image 3 */}
        <div className="lg:col-span-5 flex justify-end items-start">
          <div className="offline-status-pill">
            <Lock className="w-3.5 h-3.5 text-[#FF9F00]" />
            <span className="text-xs font-bold text-white">100% OFFLINE</span>
          </div>
        </div>
      </div>

      {/* Main RAG Laptop Container matching Image 3 */}
      <div className="bg-[#090E1B] border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Documents Stack (4 cols) matching Image 3 */}
          <div className="lg:col-span-4 space-y-4 bg-[#070B15] p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white font-['Outfit'] text-sm">Documents</h3>
              <button
                onClick={onOpenUploadModal}
                className="w-6 h-6 rounded-md bg-[#FF9F00] text-black font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleOpenDocument(doc)}
                  className="bg-[#0C1222] border border-white/5 hover:border-amber-500/30 p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 w-full justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-5 h-5 ${doc.type === 'pdf' ? 'text-rose-400' : doc.type === 'docx' ? 'text-sky-400' : 'text-emerald-400'}`} />
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors">{doc.name}</h4>
                        <span className="text-[10px] text-slate-400">{doc.size}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Zone matching Image 3 */}
            <div
              onClick={onOpenUploadModal}
              className="border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-xl p-4 text-center cursor-pointer bg-[#090E1B] space-y-1"
            >
              <Upload className="w-5 h-5 text-amber-500 mx-auto" />
              <h4 className="text-xs font-bold text-white">Upload Documents</h4>
              <p className="text-[10px] text-slate-400">PDF, DOCX, XLSX, TXT</p>
            </div>
          </div>

          {/* Right Search & AI Answer Area (8 cols) matching Image 3 */}
          <div className="lg:col-span-8 space-y-5">
            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-[#070B15] border border-white/10 rounded-2xl p-2">
                <Search className="w-4 h-4 text-slate-400 ml-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are the key terms of the payment policy?"
                  className="w-full bg-transparent border-none outline-none px-3 text-xs text-white placeholder-slate-500"
                />
                <button type="submit" className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF9F00] to-[#FF6B00] text-black flex items-center justify-center shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Glowing Orange Border AI Answer Box matching Image 3 */}
            <div className="bg-[#0C1222] border-2 border-[#FF9F00] rounded-2xl p-6 space-y-3 relative shadow-xl shadow-orange-500/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF9F00] text-black font-bold flex items-center justify-center text-xs">
                  AI
                </div>
                <span className="text-xs font-bold text-[#FF9F00]">Offline AI Answer</span>
              </div>
              <p className="text-sm text-slate-100 leading-relaxed font-medium">
                {activeQna?.answer}
              </p>
            </div>

            {/* Cited Sources Box matching Image 3 */}
            <div className="bg-[#070B15] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-bold text-white">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Sources</span>
              </div>

              <div className="space-y-2">
                {activeQna?.sources?.map((src, index) => (
                  <div key={index} className="bg-[#0C1222] border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#FF9F00]" />
                      <span className="font-bold text-white">{src.doc}</span>
                      <span className="text-slate-400 text-[11px]">— {src.snippet}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-500/10 text-[#FF9F00] px-2 py-0.5 rounded-md border border-amber-500/20">
                      {src.page}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Strip matching Image 3 */}
      <div className="bg-[#070B15] border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Private AI. Instant Knowledge.</h4>
            <p className="text-xs text-slate-400">Transform documents into intelligence. Ask anything. Get trusted answers. All offline.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
          <span>🚫 No Internet Required</span>
          <span>🔒 Data Stays Local</span>
          <span>⚡ Faster Results</span>
          <span>📈 Boost Productivity</span>
        </div>
      </div>

      {/* Document Viewer / Editor Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0A0F1D] border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#070B15] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#FF9F00]" />
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{selectedDoc.name}</h3>
                  <span className="text-xs text-slate-400">{selectedDoc.date} • {selectedDoc.size}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button 
                    onClick={handleSaveDocument}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-xs font-bold transition-colors border border-emerald-500/30"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-slate-300 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
                
                <button 
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#FF9F00]/20 text-[#FF9F00] hover:bg-[#FF9F00]/30 rounded-lg text-xs font-bold transition-colors border border-[#FF9F00]/30"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto bg-[#0C1222] rounded-b-2xl">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full min-h-[400px] bg-[#070B15] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9F00] resize-none"
                  placeholder="Document content goes here..."
                />
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed bg-transparent border-none p-0 m-0">
                    {selectedDoc.content || selectedDoc.summary || 'No content available.'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
