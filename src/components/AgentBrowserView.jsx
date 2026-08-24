import React, { useState, useRef, useEffect } from 'react';
import { Compass, ArrowLeft, ArrowRight, RotateCw, Play, Sparkles, MessageSquare, Globe, Share2, ExternalLink, ChevronUp, ChevronDown, Key, Plus, X, CreditCard, GraduationCap, Link2, User, Building2, ShieldAlert } from 'lucide-react';
import { executeModelRequest } from '../services/modelManager';
import CookieImportModal from './CookieImportModal';

const ipc = window.require ? window.require('electron').ipcRenderer : null;
const shell = window.require ? window.require('electron').shell : null;


const CASJOE_SUITE = [
  { name: 'WhatsApp Web', url: 'https://web.whatsapp.com', icon: MessageSquare, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-400', desc: 'Chat & Social Messaging' },
  { name: 'Facebook', url: 'https://www.facebook.com', icon: Share2, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-400', desc: 'Social Media Management' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com', icon: Globe, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-400', desc: 'B2B Lead Generation' },
  { name: 'Casjoe BOS', url: 'https://app.casjoe.com', icon: Building2, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-400', desc: 'Business Operating System' },
  { name: 'Casjoe Pay', url: 'https://pay.casjoe.com', icon: CreditCard, color: 'bg-teal-500/10 text-teal-400 border-teal-500/20 hover:border-teal-400', desc: 'Payment Gateway & Billing' },
  { name: 'Casjoe Academy', url: 'https://academy.casjoe.com', icon: GraduationCap, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-400', desc: 'AI Learning & Skills' },
  { name: 'Casjoe Links', url: 'https://links.casjoe.com', icon: Link2, color: 'bg-pink-500/10 text-pink-400 border-pink-500/20 hover:border-pink-400', desc: 'Smart Link Management' },
  { name: 'Casjoe Me', url: 'https://me.casjoe.com', icon: User, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:border-indigo-400', desc: 'Personal Digital Portal' }
];

export default function AgentBrowserView() {
  const [tabs, setTabs] = useState([
    { id: 'tab-1', title: 'New Tab', url: 'casjoe:newtab' }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [omnibarText, setOmnibarText] = useState('casjoe:newtab');
  const [isAutomating, setIsAutomating] = useState(false);
  const [automationLogs, setAutomationLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [hasInstalledCookies, setHasInstalledCookies] = useState(() => {
    return localStorage.getItem('casjoe_cookies_installed') === 'true';
  });
  const webviewRef = useRef(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const isNewTabPage = !activeTab.url || activeTab.url === 'casjoe:newtab' || activeTab.url === 'about:blank';

  const [showAuthBanner, setShowAuthBanner] = useState(false);
  const [authBannerUrl, setAuthBannerUrl]   = useState('');

  useEffect(() => {
    const inElectron = Boolean(window.require || navigator.userAgent.toLowerCase().includes('electron'));
    setIsElectron(inElectron);

    // Listen for Google/OAuth sign-in interceptions from main process
    if (inElectron && ipc) {
      const handler = (_, { url }) => {
        setAuthBannerUrl(url);
        setShowAuthBanner(true);
        setTimeout(() => setShowAuthBanner(false), 8000);
      };
      ipc.on('browser:auth-intercepted', handler);
      return () => ipc.removeListener('browser:auth-intercepted', handler);
    }
  }, []);

  useEffect(() => {
    if (activeTab) {
      setOmnibarText(activeTab.url === 'casjoe:newtab' ? '' : activeTab.url);
    }
  }, [activeTabId]);

  const addLog = (message, type = 'info') => {
    setAutomationLogs(prev => [
      ...prev,
      { id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString(), message, type }
    ]);
  };

  const handleNavigate = (urlToLoad) => {
    const target = urlToLoad || omnibarText;
    if (!target.trim()) return;

    let formatted = target;
    if (!target.startsWith('http://') && !target.startsWith('https://') && target !== 'casjoe:newtab') {
      formatted = `https://${target}`;
    }

    setTabs(prev => prev.map(t => t.id === activeTabId ? {
      ...t,
      url: formatted,
      title: formatted === 'casjoe:newtab' ? 'New Tab' : formatted.replace('https://', '').replace('http://', '').split('/')[0]
    } : t));

    setOmnibarText(formatted === 'casjoe:newtab' ? '' : formatted);
  };

  const handleNewTab = (defaultUrl = 'casjoe:newtab') => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: defaultUrl === 'casjoe:newtab' ? 'New Tab' : defaultUrl.replace('https://', '').split('/')[0],
      url: defaultUrl
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    setOmnibarText(defaultUrl === 'casjoe:newtab' ? '' : defaultUrl);
  };

  const handleCloseTab = (tabIdToClose, e) => {
    e.stopPropagation();
    if (tabs.length <= 1) {
      // If closing last tab, reset to New Tab page
      setTabs([{ id: 'tab-1', title: 'New Tab', url: 'casjoe:newtab' }]);
      setActiveTabId('tab-1');
      setOmnibarText('');
      return;
    }
    const nextTabs = tabs.filter(t => t.id !== tabIdToClose);
    setTabs(nextTabs);
    if (activeTabId === tabIdToClose) {
      const fallbackTab = nextTabs[nextTabs.length - 1];
      setActiveTabId(fallbackTab.id);
      setOmnibarText(fallbackTab.url === 'casjoe:newtab' ? '' : fallbackTab.url);
    }
  };

  const [currentAiAction, setCurrentAiAction] = useState(null);
  const [pageTitle, setPageTitle]   = useState('');
  const [canGoBack, setCanGoBack]   = useState(false);
  const [canGoFwd, setCanGoFwd]     = useState(false);
  const [isLoading, setIsLoading]   = useState(false);

  // Derive security state from current URL
  const getSecurityInfo = (url) => {
    if (!url || url === 'casjoe:newtab' || url === 'about:blank') return { icon: '🌐', label: '', color: 'text-slate-500' };
    if (url.startsWith('https://')) return { icon: '🔒', label: 'Secure', color: 'text-emerald-400' };
    if (url.startsWith('http://'))  return { icon: '⚠️', label: 'Not Secure', color: 'text-red-400' };
    return { icon: '🌐', label: '', color: 'text-slate-400' };
  };
  const secInfo = getSecurityInfo(activeTab?.url);

  // Wire up webview navigation events
  useEffect(() => {
    const wv = webviewRef.current;
    if (!wv) return;

    const onStart   = ()  => setIsLoading(true);
    const onStop    = ()  => setIsLoading(false);
    const onNav     = (e) => {
      const newUrl = e.url || e.validatedURL;
      if (!newUrl) return;
      setOmnibarText(newUrl);
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: newUrl } : t));
      setCanGoBack(wv.canGoBack?.() ?? false);
      setCanGoFwd(wv.canGoForward?.() ?? false);
    };
    const onTitle = (e) => {
      setPageTitle(e.title);
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, title: e.title || t.title } : t));
    };

    wv.addEventListener('did-start-loading',     onStart);
    wv.addEventListener('did-stop-loading',      onStop);
    wv.addEventListener('did-navigate',          onNav);
    wv.addEventListener('did-navigate-in-page',  onNav);
    wv.addEventListener('page-title-updated',    onTitle);

    return () => {
      wv.removeEventListener('did-start-loading',    onStart);
      wv.removeEventListener('did-stop-loading',     onStop);
      wv.removeEventListener('did-navigate',         onNav);
      wv.removeEventListener('did-navigate-in-page', onNav);
      wv.removeEventListener('page-title-updated',   onTitle);
    };
  }, [activeTabId, webviewRef.current]);

  const handleBack    = () => webviewRef.current?.goBack?.();
  const handleForward = () => webviewRef.current?.goForward?.();
  const handleReload  = () => {
    if (isNewTabPage) return;
    webviewRef.current?.reload?.() || handleNavigate(activeTab.url);
  };


  const handleOmnibarSubmit = async () => {
    if (!omnibarText.trim() || isAutomating) return;

    // Check if input is a direct URL
    if (omnibarText.startsWith('http') || omnibarText.includes('.com') || omnibarText.includes('.org') || omnibarText.includes('.php') || omnibarText.includes('.net')) {
      handleNavigate(omnibarText);
      return;
    }

    const commandText = omnibarText;
    setIsAutomating(true);
    setShowLogs(true);
    setCurrentAiAction({ step: 1, total: 3, message: '🤖 AI Agent initializing live takeover...' });
    addLog(`🤖 Live AI Takeover Command: "${commandText}" on [${activeTab.title}]`, 'goal');

    try {
      let targetUrl = activeTab.url;
      const lowerCmd = commandText.toLowerCase();

      // Auto-navigate to target site if currently on New Tab or another portal
      if (isNewTabPage || lowerCmd.includes('facebook') || lowerCmd.includes('whatsapp') || lowerCmd.includes('linkedin')) {
        if (lowerCmd.includes('facebook')) targetUrl = 'https://www.facebook.com';
        else if (lowerCmd.includes('whatsapp')) targetUrl = 'https://web.whatsapp.com';
        else if (lowerCmd.includes('linkedin')) targetUrl = 'https://www.linkedin.com';
        else if (isNewTabPage) targetUrl = 'https://www.google.com';

        if (activeTab.url !== targetUrl) {
          addLog(`Navigating live browser to ${targetUrl}...`, 'info');
          handleNavigate(targetUrl);
          // Wait for webview DOM to load
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      addLog(`Executing live AI cursor automation on ${targetUrl}...`, 'info');

      // Fast 2.5-second timeout on model planning to avoid indefinite spinning
      const systemPrompt = `You are Comet/Manus style AI Browser Agent. Respond ONLY with JSON: { "actions": [{ "type": "scroll"|"click"|"type", "target": "selector", "value": "text" }] }`;
      const planPromise = executeModelRequest({
        systemPrompt,
        messages: [{ role: 'user', content: commandText }]
      });

      const timeoutPromise = new Promise(r => setTimeout(() => r({ content: 'timeout' }), 2500));
      const res = await Promise.race([planPromise, timeoutPromise]);

      let plan;
      try {
        const match = res.content.match(/\{[\s\S]*\}/);
        plan = JSON.parse(match ? match[0] : res.content);
      } catch {
        // Site-specific instant default action plan
        if (targetUrl.includes('facebook')) {
          plan = {
            actions: [
              { type: 'scroll', target: 'window' },
              { type: 'click', target: 'div[role="button"], textarea, input[type="text"]' },
              { type: 'type', value: commandText }
            ]
          };
        } else if (targetUrl.includes('whatsapp')) {
          plan = {
            actions: [
              { type: 'click', target: 'div[contenteditable="true"]' },
              { type: 'scroll', target: 'window' }
            ]
          };
        } else {
          plan = {
            actions: [
              { type: 'scroll', target: 'window' },
              { type: 'click', target: 'button, a, input' }
            ]
          };
        }
      }

      const actions = plan.actions || [{ type: 'scroll', target: 'window' }];
      const totalSteps = actions.length;

      let stepIdx = 0;
      for (const act of actions) {
        stepIdx++;
        const stepText = `Step ${stepIdx}/${totalSteps}: ${act.type.toUpperCase()} on ${act.target || 'web page'}`;
        setCurrentAiAction({ step: stepIdx, total: totalSteps, message: stepText });
        addLog(stepText, 'action');

        // Inject Glowing Cyan AI Pointer & Highlight Ring into the Webview DOM
        if (webviewRef.current && webviewRef.current.executeJavaScript) {
          try {
            await webviewRef.current.executeJavaScript(`
              (function() {
                let cursor = document.getElementById('casjoe-ai-cursor');
                if (!cursor) {
                  cursor = document.createElement('div');
                  cursor.id = 'casjoe-ai-cursor';
                  cursor.style.position = 'fixed';
                  cursor.style.zIndex = '9999999';
                  cursor.style.width = '32px';
                  cursor.style.height = '32px';
                  cursor.style.borderRadius = '50%';
                  cursor.style.background = 'rgba(6, 182, 212, 0.6)';
                  cursor.style.border = '3px solid #00f2fe';
                  cursor.style.boxShadow = '0 0 25px #00f2fe, inset 0 0 15px #00f2fe';
                  cursor.style.pointerEvents = 'none';
                  cursor.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

                  const label = document.createElement('div');
                  label.id = 'casjoe-ai-label';
                  label.style.position = 'absolute';
                  label.style.top = '36px';
                  label.style.left = '-20px';
                  label.style.background = '#0B1222';
                  label.style.color = '#00f2fe';
                  label.style.border = '1px solid #00f2fe';
                  label.style.padding = '3px 8px';
                  label.style.borderRadius = '8px';
                  label.style.fontSize = '11px';
                  label.style.fontWeight = 'bold';
                  label.style.whiteSpace = 'nowrap';
                  label.innerText = '🤖 Casjoe AI Pointer';
                  cursor.appendChild(label);
                  document.body.appendChild(cursor);
                }

                const targetEl = document.querySelector('${act.target || "button, a, textarea, [role=\'button\']"}') || document.body;
                const rect = targetEl.getBoundingClientRect();
                cursor.style.top = (rect.top + rect.height/2 - 16) + 'px';
                cursor.style.left = (rect.left + rect.width/2 - 16) + 'px';

                if (targetEl !== document.body) {
                  targetEl.style.outline = '3px solid #00f2fe';
                  targetEl.style.outlineOffset = '2px';
                }
              })();
            `);
          } catch {
            // Ignore DOM errors
          }

          if (act.type === 'scroll') {
            await webviewRef.current.executeJavaScript(`window.scrollBy({ top: 400, behavior: "smooth" });`);
          } else if (act.type === 'click') {
            await webviewRef.current.executeJavaScript(`
              const el = document.querySelector('${act.target || "button, a, [role=\'button\']"}');
              if (el) el.click();
            `);
          } else if (act.type === 'type') {
            await webviewRef.current.executeJavaScript(`
              const el = document.querySelector('textarea, [contenteditable="true"], input[type="text"]');
              if (el) {
                el.focus();
                if (el.value !== undefined) el.value = "${act.value || commandText}";
                else if (el.innerText !== undefined) el.innerText = "${act.value || commandText}";
              }
            `);
          }
        }

        await new Promise(r => setTimeout(r, 1800));
      }

      addLog(`🎉 Live AI Browser Takeover Completed!`, 'success');

    } catch (err) {
      addLog(`Error: ${err.message}`, 'error');
    } finally {
      setIsAutomating(false);
      setCurrentAiAction(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#070B15] text-slate-100 p-4 space-y-2">
      {/* Top Browser Multi-Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-xs font-semibold cursor-pointer transition border-t border-x ${
                isActive
                  ? 'bg-[#0B1222] border-slate-700 text-cyan-400 font-bold shadow'
                  : 'bg-[#050811] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="truncate max-w-[130px]">{tab.title}</span>
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="p-0.5 hover:bg-slate-800 text-slate-500 hover:text-white rounded-md transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Plus (+) New Tab Button */}
        <button
          onClick={() => handleNewTab('casjoe:newtab')}
          className="p-1.5 text-slate-400 hover:text-white bg-[#050811] hover:bg-slate-800 rounded-lg border border-slate-800 transition"
          title="Open New Tab (Casjoe Launchpad)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Unified Minimalist Omnibar Header */}
      <div className="bg-[#0B1222] border border-slate-800/80 p-2.5 rounded-2xl flex items-center gap-3 shadow-lg shrink-0">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleNavigate('casjoe:newtab')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
            title="Go to New Tab Dashboard"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => handleNavigate(activeTab.url)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Single Smart Omnibar (URL or Prompt) */}
        <div className="flex-1 flex items-center gap-2 bg-[#050811] px-3.5 py-2 rounded-xl border border-slate-800 focus-within:border-cyan-500/80 transition">
          <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={omnibarText}
            onChange={(e) => setOmnibarText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleOmnibarSubmit()}
            placeholder="Search, enter URL, or AI Browser Command (e.g. 'Open WhatsApp Web and check leads')..."
            className="bg-transparent text-xs text-slate-200 w-full focus:outline-none placeholder-slate-500 font-mono"
          />
          <button
            onClick={handleOmnibarSubmit}
            disabled={isAutomating}
            className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition shrink-0"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isAutomating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Bookmark Quick Icons & Cookie Import */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
          {hasInstalledCookies ? (
            <button
              onClick={() => setShowCookieModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 rounded-xl text-[11px] font-semibold transition hover:bg-emerald-900/40"
              title="Cookies installed. Click to update Chrome cookies."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Cookies Active</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCookieModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-xl text-[11px] font-semibold transition"
              title="Import Cookies from Chrome"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Install Cookies</span>
            </button>
          )}
        </div>
      </div>

      <CookieImportModal
        isOpen={showCookieModal}
        onClose={() => setShowCookieModal(false)}
        onCookiesImported={(count) => {
          setHasInstalledCookies(true);
          localStorage.setItem('casjoe_cookies_installed', 'true');
          addLog(`Installed ${count} Chrome cookies! Session authenticated. Reloading active tab...`, 'success');
          if (webviewRef.current && webviewRef.current.reload) {
            webviewRef.current.reload();
          }
        }}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 bg-[#050811] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
        {isNewTabPage ? (
          /* Plain Dark Background New Tab Launchpad */
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center space-y-8 animate-in fade-in">
            {/* Branding Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl mb-2 shadow-xl shadow-cyan-500/10">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Casjoe Agent OS Launchpad</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Launch your business web applications, social media portals, and Casjoe Suite tools directly with local AI support.
              </p>
            </div>

            {/* Apps & Suite Launchpad Grid */}
            <div className="max-w-4xl w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CASJOE_SUITE.map((app) => {
                const Icon = app.icon;
                return (
                  <div
                    key={app.name}
                    onClick={() => handleNavigate(app.url)}
                    className={`group p-4 bg-[#0B1222] border ${app.color} rounded-2xl cursor-pointer transition-all duration-200 transform hover:-translate-y-1 shadow-lg space-y-2 flex flex-col items-center text-center`}
                  >
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 group-hover:scale-110 transition">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">{app.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{app.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Live Embedded Webview Viewport */
          <>
            {isAutomating && (
              <div className="bg-cyan-950/90 border-b border-cyan-500/50 text-cyan-300 text-xs px-4 py-2 flex items-center justify-between shadow-lg shadow-cyan-500/10 shrink-0 animate-pulse">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="font-bold text-white uppercase tracking-wider">🤖 AI TAKEOVER ACTIVE:</span>
                  <span>{currentAiAction?.message || 'Executing automated browser actions live...'}</span>
                </div>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                  Step {currentAiAction?.step || 1} of {currentAiAction?.total || 1}
                </span>
              </div>
            )}

            {!isElectron && (
              <div className="bg-amber-950/40 border-b border-amber-800/60 text-amber-300 text-[11px] px-4 py-2 flex items-center justify-between shrink-0">
                <span>⚠️ <strong>Web Mode Active:</strong> WhatsApp Web &amp; LinkedIn block standard web iframes. Open native <strong>Casjoe Desktop App</strong> window to bypass frame security!</span>
                <a href={activeTab.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-cyan-400">
                  <ExternalLink className="w-3 h-3" /> Open Directly
                </a>
              </div>
            )}

            {/* Auth interception banner — shown when Google/OAuth login is redirected to real browser */}
            {showAuthBanner && (
              <div className="bg-blue-950/80 border-b border-blue-500/40 text-blue-200 text-[11px] px-4 py-2.5 flex items-center justify-between shrink-0 animate-in slide-in-from-top">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    <strong className="text-white">Sign-in opened in your default browser.</strong>{' '}
                    Google blocks login inside embedded apps for your security — so we redirected it automatically.
                    Log in there, then come back to continue.
                  </span>
                </div>
                <button onClick={() => setShowAuthBanner(false)} className="ml-3 text-blue-400 hover:text-white shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex-1 relative">
              {isElectron ? (
                <webview
                  ref={webviewRef}
                  key={activeTab.id}
                  src={activeTab.url}
                  partition="persist:casjoe_agent_browser"
                  useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
                  style={{ width: '100%', height: '100%' }}
                  allowpopups="true"
                />
              ) : (
                <iframe
                  ref={webviewRef}
                  key={activeTab.id}
                  src={activeTab.url}
                  title="Casjoe AI Agent Browser"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              )}
            </div>
          </>
        )}

        {/* Minimalist Floating Status Bar / Log Drawer */}
        {automationLogs.length > 0 && (
          <div className="bg-[#0B1222]/95 border-t border-slate-800 p-2.5 px-4 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 font-mono text-[11px] truncate">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-slate-300 truncate">{automationLogs[automationLogs.length - 1]?.message}</span>
            </div>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] shrink-0"
            >
              {showLogs ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              {showLogs ? 'Hide Logs' : 'Logs'}
            </button>
          </div>
        )}

        {showLogs && (
          <div className="bg-[#050811] border-t border-slate-800 p-3 max-h-36 overflow-y-auto font-mono text-[11px] space-y-1 shrink-0">
            {automationLogs.map(l => (
              <div key={l.id} className="flex items-center gap-2">
                <span className="text-slate-500">{l.timestamp}</span>
                <span className={l.type === 'error' ? 'text-red-400' : l.type === 'success' ? 'text-emerald-400' : 'text-cyan-300'}>
                  {l.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
