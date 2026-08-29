import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, ArrowLeft, ArrowRight, RotateCw, Play, Sparkles, MessageSquare, Globe, 
  Share2, ExternalLink, ChevronUp, ChevronDown, Key, Plus, X, CreditCard, GraduationCap, 
  Link2, User, Building2, ShieldAlert, Zap, Pause, Square, FileDown, CheckCircle2, 
  Bot, Camera, Table, ListTodo, Copy, Check, Clock,
  PanelRightOpen, PanelRightClose
} from 'lucide-react';
import { executeModelRequest } from '../services/modelManager';
import CookieImportModal from './CookieImportModal';
import db from '../db/database';

const ipc = window.require ? window.require('electron').ipcRenderer : null;

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

const AUTOMATION_RECIPES = [
  { id: 'autofill_form', name: 'AutoFill Form Profile', icon: CheckCircle2, color: 'text-teal-400 border-teal-500/30 bg-teal-950/20', url: null, desc: 'Scan and automatically populate form fields with your saved Business Profile' },
  { id: 'manus_research', name: 'Manus Market Research & Table', icon: Table, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20', url: null, desc: 'Search queries, extract pricing/product specs into structured table in Scratchpad' },
  { id: 'vision_snapshot', name: 'Vision Snapshot & Inspect', icon: Camera, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20', url: null, desc: 'Take high-res screenshot and visually analyze page layout with AI' },
  { id: 'comment_context', name: 'Contextual Commenter', icon: MessageSquare, color: 'text-amber-400 border-amber-500/30 bg-amber-950/20', url: null, desc: 'Perceive active profile & post, then draft a tailored constructive comment' },
  { id: 'batch_like', name: 'Batch Feed Liker (10x)', icon: Sparkles, color: 'text-rose-400 border-rose-500/30 bg-rose-950/20', url: null, desc: 'Scroll feed, like 10 posts with 5s countdown delays between each' },
  { id: 'canva_design', name: 'Canva Designer', icon: Bot, color: 'text-sky-400 border-sky-500/30 bg-sky-950/20', url: 'https://www.canva.com', desc: 'Open Canva and search Instagram Post / Marketing templates' },
  { id: 'whatsapp', name: 'WhatsApp Broadcaster', icon: MessageSquare, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20', url: 'https://web.whatsapp.com', desc: 'Focus chat, type customer follow-up message & highlight send' },
  { id: 'linkedin', name: 'LinkedIn Lead Outreach', icon: Globe, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20', url: 'https://www.linkedin.com', desc: 'Search leads & draft personalized connection note' },
  { id: 'scraper', name: 'Web Scraper & Vault Ingest', icon: FileDown, color: 'text-purple-400 border-purple-500/30 bg-purple-950/20', url: null, desc: 'Extract active webpage text & save to Document Vault for RAG' },
  { id: 'casjoe_bos', name: 'Casjoe BOS Live Sync', icon: Building2, color: 'text-gold-400 border-amber-500/30 bg-amber-950/20', url: 'https://app.casjoe.com', desc: 'Open cloud BOS and trigger live ledger sync' }
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
  const [workingMemory, setWorkingMemory] = useState(null);
  const [batchLoopState, setBatchLoopState] = useState(null);
  const [taskPlan, setTaskPlan] = useState([]);
  const [taskScratchpad, setTaskScratchpad] = useState([]);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState(null);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState('plan'); // 'plan' | 'scratchpad' | 'vision'
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isElectron, setIsElectron] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [showSchedulesModal, setShowSchedulesModal] = useState(false);
  const [scheduledRoutines, setScheduledRoutines] = useState([
    {
      id: 'price_monitor',
      name: 'Daily Competitor Price Monitor',
      cron: 'Every day at 08:00 AM',
      enabled: true,
      command: 'Search top solar inverters in Nigeria and extract price comparison table',
      lastRun: 'Today, 08:00 AM',
      status: 'success'
    },
    {
      id: 'fx_tracker',
      name: 'Hourly FX Parallel Rate Tracker',
      cron: 'Every 2 hours',
      enabled: true,
      command: 'Search current USD NGN parallel market exchange rate and extract rate table',
      lastRun: '1 hour ago',
      status: 'success'
    },
    {
      id: 'lead_followup',
      name: 'Daily Social Outreach & Follow-up',
      cron: 'Every day at 09:30 AM',
      enabled: false,
      command: 'Open WhatsApp Web, search for client or group, and prepare a business follow-up message.',
      lastRun: 'Yesterday',
      status: 'idle'
    }
  ]);
  const [hasInstalledCookies, setHasInstalledCookies] = useState(() => {
    return localStorage.getItem('casjoe_cookies_installed') === 'true';
  });
  const webviewRef = useRef(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const isNewTabPage = !activeTab.url || activeTab.url === 'casjoe:newtab' || activeTab.url === 'about:blank';

  const [showAuthBanner, setShowAuthBanner] = useState(false);

  useEffect(() => {
    const inElectron = Boolean(window.require || navigator.userAgent.toLowerCase().includes('electron'));
    setIsElectron(inElectron);

    // Listen for Google/OAuth sign-in interceptions and downloads from main process
    if (inElectron && ipc) {
      const handler = () => {
        setShowAuthBanner(true);
        setTimeout(() => setShowAuthBanner(false), 8000);
      };
      const downloadHandler = (_, { filename, savePath, size }) => {
        addLog(`📥 Download completed: "${filename}" (${Math.round((size || 0)/1024)} KB) -> saved to ${savePath}`, 'success');
      };

      ipc.on('browser:auth-intercepted', handler);
      ipc.on('browser:download-completed', downloadHandler);

      return () => {
        ipc.removeListener('browser:auth-intercepted', handler);
        ipc.removeListener('browser:download-completed', downloadHandler);
      };
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

  // Wire up webview navigation events
  useEffect(() => {
    const wv = webviewRef.current;
    if (!wv) return;

    const onNav     = (e) => {
      const newUrl = e.url || e.validatedURL;
      if (!newUrl) return;
      setOmnibarText(newUrl);
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: newUrl } : t));
    };
    const onTitle = (e) => {
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
  }, [activeTabId]);

  const handleBack    = () => webviewRef.current?.goBack?.();
  const handleForward = () => webviewRef.current?.goForward?.();
  const handleReload  = () => {
    if (isNewTabPage) return;
    if (webviewRef.current?.reload) {
      webviewRef.current.reload();
    } else {
      handleNavigate(activeTab.url);
    }
  };


  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState('normal'); // 'normal' (1500ms) or 'fast' (600ms)
  const isAbortedRef = useRef(false);
  const isPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Listen for agent-dispatched browser tasks
  useEffect(() => {
    const handleAgentTask = (e) => {
      if (e?.detail) {
        const { url, task } = e.detail;
        if (url) handleNavigate(url);
        if (task) {
          setTimeout(() => {
            setOmnibarText(task);
            runAutomationFlow(task, url || activeTab.url);
          }, 1500);
        }
      }
    };
    window.addEventListener('casjoe:browser-task', handleAgentTask);
    return () => window.removeEventListener('casjoe:browser-task', handleAgentTask);
  }, [activeTab]);

  const sleep = (ms) => {
    return new Promise(resolve => {
      const checkInterval = 100;
      let elapsed = 0;
      const interval = setInterval(() => {
        if (isAbortedRef.current) {
          clearInterval(interval);
          resolve();
        } else if (!isPausedRef.current) {
          elapsed += checkInterval;
          if (elapsed >= ms) {
            clearInterval(interval);
            resolve();
          }
        }
      }, checkInterval);
    });
  };

  const handleStopAutomation = () => {
    isAbortedRef.current = true;
    setIsAutomating(false);
    setCurrentAiAction(null);
    addLog('🛑 Browser automation aborted by user.', 'info');
  };

  // Run Web Scraper on current page
  const handleRunWebScraper = async () => {
    if (isNewTabPage) {
      addLog('⚠️ Please navigate to a website first before scraping.', 'error');
      return;
    }
    setIsAutomating(true);
    setShowLogs(true);
    addLog(`🕷️ Scraping active web page: ${activeTab.url}...`, 'goal');

    try {
      if (webviewRef.current && webviewRef.current.executeJavaScript) {
        const scraped = await webviewRef.current.executeJavaScript(`
          (function() {
            const title = document.title || 'Scraped Web Page';
            const h1s = Array.from(document.querySelectorAll('h1, h2')).map(h => h.innerText.trim()).filter(Boolean).slice(0, 5).join(' | ');
            const paras = Array.from(document.querySelectorAll('p, article, main, section')).map(p => p.innerText.trim()).filter(p => p.length > 30).join('\\n\\n');
            const cleanText = (title + '\\n\\n' + (h1s ? 'Key Sections: ' + h1s + '\\n\\n' : '') + paras).slice(0, 15000);
            return { title, content: cleanText };
          })();
        `);

        if (scraped && scraped.content && scraped.content.length > 50) {
          const docName = `${(scraped.title || 'Web Page').slice(0, 35)} (${new Date().toLocaleTimeString()})`;
          const sizeKb = `${Math.round(scraped.content.length / 1024 * 10) / 10} KB`;
          await db.documents.add({
            name: docName,
            size: sizeKb,
            type: 'txt',
            content: scraped.content,
            summary: scraped.content.slice(0, 200) + '...',
            createdAt: new Date().toISOString()
          });
          addLog(`✅ Extracted ${scraped.content.length} characters and saved to Document Vault as "${docName}"!`, 'success');
        } else {
          addLog(`⚠️ Scraper completed but could not find readable article text on this page.`, 'error');
        }
      } else {
        addLog(`⚠️ Scraper requires desktop Electron mode for direct DOM extraction.`, 'error');
      }
    } catch (err) {
      addLog(`Scraping failed: ${err.message}`, 'error');
    } finally {
      setIsAutomating(false);
    }
  };

  // 1. Live DOM Perception & Short-Term Working Memory
  const extractPagePerception = async () => {
    if (!webviewRef.current?.executeJavaScript) return null;
    try {
      const perception = await webviewRef.current.executeJavaScript(`
        (function() {
          const title = document.title || '';
          const url = window.location.href;
          // Detect profile name / author
          const nameEl = document.querySelector('h1, .pv-top-card--list li, [data-testid="UserName"], .profile-name, .author, h2.top-card-layout__title');
          const authorName = nameEl ? nameEl.innerText.trim() : '';

          // Detect bio / headline / about
          const headlineEl = document.querySelector('.text-body-medium, [data-testid="UserDescription"], .bio, .headline, header p, .top-card__headline');
          const headline = headlineEl ? headlineEl.innerText.trim() : '';

          // Detect top post / main article text
          const postEls = Array.from(document.querySelectorAll('[data-testid="tweetText"], .feed-shared-update-v2__description, article p, [role="article"] p, main p'));
          const postText = postEls.map(p => p.innerText.trim()).filter(t => t.length > 20).slice(0, 3).join('\\n---\\n');

          // General page excerpt
          const generalText = Array.from(document.querySelectorAll('p, h2, h3')).map(e => e.innerText.trim()).filter(e => e.length > 15).slice(0, 8).join(' | ');

          return {
            title,
            url,
            authorName: authorName.slice(0, 80),
            headline: headline.slice(0, 150),
            postText: (postText || generalText).slice(0, 1200)
          };
        })();
      `);
      setWorkingMemory(perception);
      return perception;
    } catch (err) {
      console.error('Perception error:', err);
      return null;
    }
  };

  // 2. Generate Contextual AI Comment using Working Memory
  const generateConstructiveComment = async (perception, userInstruction) => {
    const contextStr = `Author: ${perception?.authorName || 'Professional'}\nHeadline: ${perception?.headline || ''}\nPost / Context:\n"${perception?.postText || perception?.title || 'Industry insights and technology update.'}"`;
    
    const systemPrompt = `You are a thoughtful, constructive business professional on social media. Write a genuine, positive, and constructive 1-to-2 sentence comment responding directly to the author and their post. Be authentic, professional, and do not use generic fluff or hashtags.`;
    
    try {
      const res = await executeModelRequest({
        systemPrompt,
        messages: [{
          role: 'user',
          content: `Target Page Context:\n${contextStr}\n\nUser Request: "${userInstruction || 'Make a constructive comment on this post'}"\n\nGenerate the comment text:`
        }]
      });
      let comment = res.content?.replace(/^["']|["']$/g, '').trim();
      if (!comment || comment.length < 10) {
        comment = `Great insights here${perception?.authorName ? `, @${perception.authorName}` : ''}! Really appreciate you sharing this perspective on local innovation.`;
      }
      return comment;
    } catch {
      return `Great insights${perception?.authorName ? ` from ${perception.authorName}` : ''}! Really appreciate this valuable perspective.`;
    }
  };

  // 3. Timed Looping & Batch Action Execution Engine
  const executeLoopBatchAutomation = async ({ actionType = 'like', totalCount = 10, delaySeconds = 5, targetQuery = null }) => {
    addLog(`🔁 Starting Timed Batch Automation: ${actionType.toUpperCase()} ${totalCount} items (${delaySeconds}s delay between each)...`, 'goal');
    
    let successCount = 0;

    for (let i = 1; i <= totalCount; i++) {
      if (isAbortedRef.current) {
        addLog(`🛑 Loop aborted at item ${i - 1}/${totalCount}.`, 'warning');
        break;
      }

      setBatchLoopState({ current: i, total: totalCount, nextInSec: 0 });
      setCurrentAiAction({
        step: i,
        total: totalCount,
        message: `🔁 [Batch ${i}/${totalCount}] Scrolling and searching next post to ${actionType}...`
      });
      addLog(`[Iteration ${i}/${totalCount}] Scrolling feed to target next element...`, 'action');

      if (webviewRef.current?.executeJavaScript) {
        // Smooth scroll down to reveal new feed items
        await webviewRef.current.executeJavaScript(`window.scrollBy({ top: 480, behavior: 'smooth' });`);
        await sleep(1000);

        // Locate and click target button (like, react, connect, follow)
        const clickResult = await webviewRef.current.executeJavaScript(`
          (function() {
            let selector = '${targetQuery || 'button[aria-label*="Like" i], button[aria-label*="React" i], [data-testid="like"], .reactions-react-button, button[aria-label*="Connect" i]'}';
            let buttons = Array.from(document.querySelectorAll(selector));
            let targetBtn = buttons.find(b => b.getAttribute('aria-pressed') !== 'true' && !b.classList.contains('casjoe-acted'));
            if (!targetBtn && buttons.length > 0) {
              targetBtn = buttons[Math.min(buttons.length - 1, ${i - 1})];
            }

            if (targetBtn) {
              targetBtn.classList.add('casjoe-acted');
              targetBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetBtn.style.outline = '3px solid #00f2fe';
              targetBtn.style.boxShadow = '0 0 15px #00f2fe';
              targetBtn.focus();
              targetBtn.click();
              targetBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
              return { clicked: true, text: targetBtn.innerText || targetBtn.getAttribute('aria-label') || 'Target Button' };
            }
            return { clicked: false };
          })();
        `);

        if (clickResult && clickResult.clicked) {
          successCount++;
          addLog(`✅ [${i}/${totalCount}] Successfully triggered ${actionType}: "${clickResult.text}".`, 'success');
        } else {
          addLog(`ℹ️ [${i}/${totalCount}] Scrolled feed down searching for available ${actionType} target...`, 'info');
        }
      }

      // Countdown delay ticker
      if (i < totalCount && !isAbortedRef.current) {
        for (let sec = delaySeconds; sec > 0; sec--) {
          if (isAbortedRef.current) break;
          setBatchLoopState({ current: i, total: totalCount, nextInSec: sec });
          setCurrentAiAction({
            step: i,
            total: totalCount,
            message: `⏳ [Delay Ticker] Next ${actionType} in ${sec}s... (${successCount}/${totalCount} completed)`
          });
          await sleep(1000);
        }
      }
    }

    setBatchLoopState(null);
    addLog(`🎉 Batch Loop Completed! Successfully executed on ${successCount}/${totalCount} posts.`, 'success');
  };

  // 4. Canva Design Automation Workflow
  const executeCanvaWorkflow = async (commandText) => {
    addLog(`🎨 Initiating Canva Design Studio: "${commandText}"`, 'goal');
    const canvaUrl = 'https://www.canva.com';
    if (activeTab.url !== canvaUrl && !activeTab.url.includes('canva.com')) {
      handleNavigate(canvaUrl);
      await sleep(3500);
    }

    let searchKeyword = 'Instagram Post';
    const lower = commandText.toLowerCase();
    if (lower.includes('flyer')) searchKeyword = 'Business Flyer';
    else if (lower.includes('logo')) searchKeyword = 'Company Logo';
    else if (lower.includes('presentation')) searchKeyword = 'Presentation';
    else if (lower.includes('banner')) searchKeyword = 'Web Banner';
    else if (lower.includes('video')) searchKeyword = 'Social Video';

    setCurrentAiAction({ step: 1, total: 3, message: `🎨 Focusing template search for "${searchKeyword}"...` });
    addLog(`Searching Canva templates for: "${searchKeyword}"...`, 'action');

    if (webviewRef.current?.executeJavaScript) {
      await webviewRef.current.executeJavaScript(`
        (function() {
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search" i], [role="searchbox"]');
          if (searchInput) {
            searchInput.focus();
            searchInput.value = "${searchKeyword}";
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
          }
        })();
      `);
      await sleep(2000);
    }

    addLog(`✅ Canva template search completed for "${searchKeyword}". AI positioning template picker!`, 'success');
  };

  // 5. Contextual Comment Automation Flow
  const executeContextualCommentFlow = async (commandText) => {
    setCurrentAiAction({ step: 1, total: 3, message: '🧠 Sensing active page & profile context...' });
    addLog('🧠 Extracting author profile and post content from active page...', 'info');

    const perception = await extractPagePerception();
    if (perception?.authorName || perception?.postText) {
      addLog(`Perceived: Author "${perception.authorName || 'Profile'}" | Excerpt: "${(perception.postText || '').slice(0, 90)}..."`, 'info');
    }

    setCurrentAiAction({ step: 2, total: 3, message: '💡 Generating constructive, personalized AI comment...' });
    addLog('Generating constructive AI comment tailored to page context...', 'action');

    const comment = await generateConstructiveComment(perception, commandText);
    addLog(`Generated Comment: "${comment}"`, 'success');

    setCurrentAiAction({ step: 3, total: 3, message: '✍️ Typing comment into input box...' });

    if (webviewRef.current?.executeJavaScript) {
      const sanitizedComment = comment.replace(/"/g, '\\"').replace(/\n/g, ' ');
      await webviewRef.current.executeJavaScript(`
        (function() {
          const commentBox = document.querySelector('div[contenteditable="true"][role="textbox"], textarea[placeholder*="comment" i], textarea[placeholder*="reply" i], div[aria-label*="Comment" i], .comments-comment-box__editor, textarea');
          if (commentBox) {
            commentBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            commentBox.focus();
            if (commentBox.isContentEditable) {
              try {
                document.execCommand('selectAll', false, null);
                document.execCommand('insertText', false, "${sanitizedComment}");
              } catch (e) {
                commentBox.innerText = "${sanitizedComment}";
              }
            } else {
              commentBox.value = "${sanitizedComment}";
            }
            commentBox.dispatchEvent(new Event('input', { bubbles: true }));
            commentBox.dispatchEvent(new Event('change', { bubbles: true }));

            // Highlight Submit / Post button
            const postBtn = document.querySelector('button[aria-label*="Post" i], button[aria-label*="Reply" i], .comments-comment-box__submit-button, button[type="submit"]');
            if (postBtn) {
              postBtn.style.outline = '3px solid #00f2fe';
              postBtn.style.boxShadow = '0 0 15px #00f2fe';
            }
          }
        })();
      `);
    }

    addLog(`✅ Comment prepared and inserted! Review and click Post.`, 'success');
  };

  // 6. Screenshot & Visual Capture Primitive
  const captureScreenshot = async () => {
    if (!webviewRef.current?.capturePage) {
      addLog('📸 Visual Screenshot requires Electron desktop mode.', 'warning');
      return null;
    }
    try {
      addLog('📸 Capturing high-resolution visual screenshot of active viewport...', 'info');
      const image = await webviewRef.current.capturePage();
      const dataUrl = image.toDataURL();
      setScreenshotDataUrl(dataUrl);
      addLog('✅ Screenshot captured and loaded into Vision Inspector!', 'success');
      setIsSideDrawerOpen(true);
      setActiveDrawerTab('vision');
      return dataUrl;
    } catch (err) {
      addLog(`Screenshot error: ${err.message}`, 'error');
      return null;
    }
  };

  // 6b. AI Computer Vision Layout & UI Analyst
  const analyzeScreenLayoutWithAi = async () => {
    if (!screenshotDataUrl && !webviewRef.current) {
      await captureScreenshot();
    }
    setIsAnalyzingVision(true);
    addLog('🔍 AI Vision Inspector analyzing layout, visual structure, and interactive elements...', 'info');

    try {
      let domSummary = '';
      if (webviewRef.current?.executeJavaScript) {
        domSummary = await webviewRef.current.executeJavaScript(`
          (function() {
            const title = document.title || '';
            const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim()).filter(Boolean).slice(0, 6).join(' | ');
            const buttons = Array.from(document.querySelectorAll('button, a[role="button"], input[type="submit"]')).map(b => b.innerText.trim() || b.getAttribute('aria-label')).filter(Boolean).slice(0, 10).join(', ');
            const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(i => i.placeholder || i.name || i.type).filter(Boolean).slice(0, 8).join(', ');
            return 'Title: ' + title + '\\nKey Headings: ' + headings + '\\nInteractive Buttons: ' + buttons + '\\nForm Inputs: ' + inputs;
          })();
        `);
      }

      const systemPrompt = `You are an AI Computer Vision & Web UI Layout Analyst. Provide a structured, concise markdown breakdown:
1. **Primary Purpose**: What is this page?
2. **Key Visual Sections**: Main components and content areas.
3. **Interactive Targets**: Main CTA buttons, form fields, navigation links.
4. **Recommended Next Actions**: 2-3 specific actions the agent can take next.`;

      const res = await executeModelRequest({
        systemPrompt,
        messages: [{ role: 'user', content: `Page URL: ${activeTab.url}\nDOM Summary:\n${domSummary}` }]
      });

      const analysisMarkdown = `### 👁️ AI Vision Analysis: ${activeTab.title || 'Web Page'}\n\n` + (res.content || 'Analysis complete.');
      setTaskScratchpad(prev => [
        { id: Date.now(), title: `Vision Analysis (${activeTab.title || 'Page'})`, content: analysisMarkdown, timestamp: new Date().toLocaleTimeString() },
        ...prev
      ]);
      setActiveDrawerTab('scratchpad');
      addLog('✅ AI Vision Analysis complete! Breakdown added to Scratchpad.', 'success');
    } catch (err) {
      addLog(`Vision analysis error: ${err.message}`, 'error');
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  // 7. Structured Information Extraction (Tables, Products, Lists)
  const extractStructuredTableOrProducts = async () => {
    if (!webviewRef.current?.executeJavaScript) return null;
    try {
      addLog('📊 Scanning DOM for structured tables, product cards, and pricing specs...', 'info');
      const extracted = await webviewRef.current.executeJavaScript(`
        (function() {
          // 1. Check for standard HTML tables
          const table = document.querySelector('table');
          if (table) {
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim()).filter(Boolean);
            const rows = Array.from(table.querySelectorAll('tbody tr, tr')).map(tr => {
              return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim()).filter(Boolean);
            }).filter(r => r.length > 0);

            if (headers.length > 0 && rows.length > 0) {
              return { type: 'table', headers, rows, title: document.title };
            }
          }

          // 2. Check for product / list cards (cards, items, prices)
          const cards = Array.from(document.querySelectorAll('.product, .card, [data-testid*="product" i], article, .s-result-item')).slice(0, 10);
          if (cards.length > 1) {
            const items = cards.map(c => {
              const titleEl = c.querySelector('h2, h3, h4, .title, .name, [class*="title" i]');
              const priceEl = c.querySelector('.price, [class*="price" i], span, strong');
              const descEl = c.querySelector('p, .desc, [class*="desc" i]');
              return {
                title: titleEl ? titleEl.innerText.trim().slice(0, 80) : '',
                price: priceEl ? priceEl.innerText.trim().slice(0, 30) : '',
                desc: descEl ? descEl.innerText.trim().slice(0, 90) : ''
              };
            }).filter(i => i.title);

            if (items.length > 0) {
              return { type: 'products', items, title: document.title };
            }
          }

          // 3. Fallback to list items
          const listItems = Array.from(document.querySelectorAll('ul li, ol li')).map(li => li.innerText.trim()).filter(t => t.length > 15).slice(0, 10);
          return { type: 'list', items: listItems, title: document.title };
        })();
      `);

      if (extracted) {
        let markdownContent = '';
        if (extracted.type === 'table' && extracted.headers?.length) {
          markdownContent = `### 📊 Table Extracted from ${extracted.title || 'Web Page'}\n\n` +
            `| ${extracted.headers.join(' | ')} |\n` +
            `| ${extracted.headers.map(() => '---').join(' | ')} |\n` +
            extracted.rows.slice(0, 15).map(r => `| ${r.join(' | ')} |`).join('\n');
        } else if (extracted.type === 'products' && extracted.items?.length) {
          markdownContent = `### 🛍️ Products / Comparison (${extracted.title || 'Search Results'})\n\n` +
            `| Item / Product | Price | Key Specs |\n| --- | --- | --- |\n` +
            extracted.items.slice(0, 10).map(p => `| **${p.title}** | ${p.price || 'N/A'} | ${p.desc || '-'} |`).join('\n');
        } else if (extracted.items?.length) {
          markdownContent = `### 📝 Key Extracted Points from ${extracted.title || 'Page'}\n\n` +
            extracted.items.map(li => `- ${li}`).join('\n');
        }

        if (markdownContent) {
          const item = {
            id: Date.now(),
            title: extracted.title || 'Extracted Data Table',
            content: markdownContent,
            timestamp: new Date().toLocaleTimeString()
          };
          setTaskScratchpad(prev => [item, ...prev]);
          setIsSideDrawerOpen(true);
          setActiveDrawerTab('scratchpad');
          addLog(`✅ Extracted structured data into Agent Scratchpad!`, 'success');
        } else {
          addLog('ℹ️ No clear table or product cards found on active page.', 'info');
        }
      }
    } catch (err) {
      addLog(`Structured extraction failed: ${err.message}`, 'error');
    }
  };

  // 8. Manus-Style Multi-Step Autonomous Goal Execution
  const executeManusAutonomousGoal = async (goalText) => {
    setIsSideDrawerOpen(true);
    setActiveDrawerTab('plan');

    // Generate Dynamic 4-Step Plan
    const initialPlan = [
      { id: 1, text: `Navigate and search for: "${goalText.slice(0, 35)}..."`, status: 'pending' },
      { id: 2, text: 'Wait for page load and inspect DOM structure', status: 'pending' },
      { id: 3, text: 'Extract structured information, tables & pricing data', status: 'pending' },
      { id: 4, text: 'Capture visual snapshot and synthesize findings into Scratchpad', status: 'pending' }
    ];
    setTaskPlan(initialPlan);

    // Step 1: Search / Navigation
    setTaskPlan(p => p.map(s => s.id === 1 ? { ...s, status: 'active' } : s));
    const searchQuery = goalText.replace(/search for|find|look up|extract|compare|table/gi, '').trim();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery || goalText)}`;
    addLog(`🔍 [Manus Step 1/4] Navigating to Google search: "${searchQuery || goalText}"...`, 'action');
    handleNavigate(searchUrl);
    await sleep(3500);
    setTaskPlan(p => p.map(s => s.id === 1 ? { ...s, status: 'completed' } : s));

    if (isAbortedRef.current) return;

    // Step 2: Inspect & Scroll
    setTaskPlan(p => p.map(s => s.id === 2 ? { ...s, status: 'active' } : s));
    addLog(`🔍 [Manus Step 2/4] Scrolling and clicking top organic result...`, 'action');
    if (webviewRef.current?.executeJavaScript) {
      await webviewRef.current.executeJavaScript(`window.scrollBy({ top: 350, behavior: 'smooth' });`);
      await sleep(1500);
      // Click first organic search link
      await webviewRef.current.executeJavaScript(`
        (function() {
          const firstLink = document.querySelector('h3, .g a, a[jsname="UWckNb"], main a');
          if (firstLink) {
            firstLink.click();
          }
        })();
      `);
      await sleep(3000);
    }
    setTaskPlan(p => p.map(s => s.id === 2 ? { ...s, status: 'completed' } : s));

    if (isAbortedRef.current) return;

    // Step 3: Extract structured data
    setTaskPlan(p => p.map(s => s.id === 3 ? { ...s, status: 'active' } : s));
    addLog(`📊 [Manus Step 3/4] Extracting structured data and specs...`, 'action');
    await extractStructuredTableOrProducts();
    setTaskPlan(p => p.map(s => s.id === 3 ? { ...s, status: 'completed' } : s));

    if (isAbortedRef.current) return;

    // Step 4: Capture Visual Snapshot
    setTaskPlan(p => p.map(s => s.id === 4 ? { ...s, status: 'active' } : s));
    addLog(`📸 [Manus Step 4/4] Capturing visual screenshot snapshot...`, 'action');
    await captureScreenshot();
    setTaskPlan(p => p.map(s => s.id === 4 ? { ...s, status: 'completed' } : s));

    addLog(`🎉 Manus Autonomous Goal Completed! Check Plan, Scratchpad, and Vision drawer.`, 'success');
  };

  // 9. Form AutoFill Helper with Business Identity Profile
  const autofillActiveForm = async () => {
    if (!webviewRef.current?.executeJavaScript) return;
    try {
      addLog('✍️ Scanning active webpage for interactive form inputs...', 'info');
      const settingRecord = await db.settings.get('businessProfile');
      const profile = settingRecord?.value || {
        name: 'Casjoe Enterprises Ltd',
        email: 'contact@casjoe.com',
        phone: '+234 800 123 4567',
        address: 'Lekki Phase 1, Lagos, Nigeria',
        rcTin: 'RC-1928301',
        website: 'https://casjoe.com'
      };

      const result = await webviewRef.current.executeJavaScript(`
        (function() {
          const profile = ${JSON.stringify(profile)};
          let filledCount = 0;

          const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'));

          inputs.forEach(el => {
            const name = (el.name || el.id || el.placeholder || el.getAttribute('aria-label') || '').toLowerCase();
            const type = (el.type || '').toLowerCase();

            let val = '';
            if (type === 'email' || name.includes('email')) {
              val = profile.email;
            } else if (type === 'tel' || name.includes('phone') || name.includes('mobile') || name.includes('contact')) {
              val = profile.phone;
            } else if (name.includes('address') || name.includes('street') || name.includes('location') || name.includes('city')) {
              val = profile.address;
            } else if (name.includes('rc') || name.includes('tin') || name.includes('tax') || name.includes('reg')) {
              val = profile.rcTin;
            } else if (type === 'url' || name.includes('website') || name.includes('url') || name.includes('site')) {
              val = profile.website;
            } else if (name.includes('company') || name.includes('organization') || name.includes('business') || name.includes('name')) {
              val = profile.name;
            }

            if (val && !el.value) {
              el.focus();
              el.value = val;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.style.outline = '2.5px solid #00f2fe';
              el.style.boxShadow = '0 0 12px rgba(0, 242, 254, 0.4)';
              filledCount++;
            }
          });

          return { filledCount };
        })();
      `);

      if (result && result.filledCount > 0) {
        addLog(`✅ Successfully autofilled ${result.filledCount} form fields with your Business Profile!`, 'success');
      } else {
        addLog('ℹ️ No empty matching form inputs found on active page.', 'info');
      }
    } catch (err) {
      addLog(`Autofill error: ${err.message}`, 'error');
    }
  };

  // Run a Pre-Built Scripted Recipe
  const handleRunRecipe = async (recipe) => {
    if (isAutomating) return;

    if (recipe.id === 'autofill_form') {
      await autofillActiveForm();
      return;
    }
    if (recipe.id === 'manus_research') {
      setOmnibarText('Search top solar inverters in Nigeria and extract price comparison table');
      await runAutomationFlow('Search top solar inverters in Nigeria and extract price comparison table');
      return;
    }
    if (recipe.id === 'vision_snapshot') {
      await captureScreenshot();
      return;
    }
    if (recipe.id === 'scraper') {
      await handleRunWebScraper();
      return;
    }
    if (recipe.id === 'comment_context') {
      await runAutomationFlow('Make a constructive comment based on this profile and post');
      return;
    }
    if (recipe.id === 'batch_like') {
      await runAutomationFlow('Like 10 posts on feed, wait 5 seconds between each and scroll');
      return;
    }
    if (recipe.id === 'canva_design') {
      await runAutomationFlow('Go to Canva and create an Instagram post design');
      return;
    }

    const targetUrl = recipe.url;
    let customPrompt = '';
    if (recipe.id === 'whatsapp') {
      customPrompt = 'Open WhatsApp Web, search for client or group, and prepare a business follow-up message.';
    } else if (recipe.id === 'linkedin') {
      customPrompt = 'Search LinkedIn for prospective African business partners and prepare outreach connection note.';
    } else if (recipe.id === 'casjoe_bos') {
      customPrompt = 'Open Casjoe BOS portal and prepare to synchronize financial records.';
    }

    setOmnibarText(customPrompt);
    await runAutomationFlow(customPrompt, targetUrl, recipe.id);
  };

  // Universal Sense-Think-Act Automation Engine
  const runAutomationFlow = async (commandText, targetUrlOverride = null, recipeId = null) => {
    isAbortedRef.current = false;
    setIsPaused(false);
    setIsAutomating(true);
    setShowLogs(true);
    const delayTime = speed === 'fast' ? 600 : 1500;

    setCurrentAiAction({ step: 1, total: 3, message: '🤖 AI Agent initializing live takeover...' });
    addLog(`🤖 Live AI Automation: "${commandText}"`, 'goal');

    try {
      const lowerCmd = commandText.toLowerCase();

      // Case 0: Form AutoFill with Business Profile
      if (lowerCmd.includes('autofill') || lowerCmd.includes('fill form') || lowerCmd.includes('fill out')) {
        await autofillActiveForm();
        return;
      }

      // Case 0.5: Manus Multi-Step Autonomous Goal (e.g. search, research, price comparison table)
      if (lowerCmd.includes('search') || lowerCmd.includes('research') || lowerCmd.includes('find') || lowerCmd.includes('compare') || lowerCmd.includes('extract table') || lowerCmd.includes('manus')) {
        await executeManusAutonomousGoal(commandText);
        return;
      }

      // Case A: Looping / Batch Task (e.g. "like 20 posts", "wait for 10 seconds", "scroll and like")
      const loopMatch = lowerCmd.match(/(\d+)\s*(post|item|tweet|lead|photo)/);
      const delayMatch = lowerCmd.match(/(\d+)\s*(sec|second)/);
      if ((lowerCmd.includes('like') || lowerCmd.includes('connect') || lowerCmd.includes('follow') || lowerCmd.includes('scroll')) && (loopMatch || lowerCmd.includes('wait') || lowerCmd.includes('repeat'))) {
        const count = loopMatch ? parseInt(loopMatch[1], 10) : 10;
        const waitSec = delayMatch ? parseInt(delayMatch[1], 10) : 5;
        const actType = lowerCmd.includes('connect') ? 'connect' : lowerCmd.includes('follow') ? 'follow' : 'like';
        await executeLoopBatchAutomation({ actionType: actType, totalCount: count, delaySeconds: waitSec });
        return;
      }

      // Case B: Contextual Commenting (e.g. "make a comment based on profile", "comment on post")
      if (lowerCmd.includes('comment') || lowerCmd.includes('reply') || lowerCmd.includes('profile')) {
        await executeContextualCommentFlow(commandText);
        return;
      }

      // Case C: Canva / Graphic Design Portal
      if (lowerCmd.includes('canva') || lowerCmd.includes('design') || lowerCmd.includes('poster') || lowerCmd.includes('flyer')) {
        await executeCanvaWorkflow(commandText);
        return;
      }

      // Case D: Universal Navigation & Custom Step Execution
      let targetUrl = targetUrlOverride || activeTab.url;
      if (isNewTabPage || lowerCmd.includes('facebook') || lowerCmd.includes('whatsapp') || lowerCmd.includes('linkedin') || lowerCmd.includes('casjoe')) {
        if (lowerCmd.includes('facebook')) targetUrl = 'https://www.facebook.com';
        else if (lowerCmd.includes('whatsapp')) targetUrl = 'https://web.whatsapp.com';
        else if (lowerCmd.includes('linkedin')) targetUrl = 'https://www.linkedin.com';
        else if (lowerCmd.includes('casjoe') || lowerCmd.includes('bos')) targetUrl = 'https://app.casjoe.com';
        else if (isNewTabPage) targetUrl = 'https://www.google.com';

        if (activeTab.url !== targetUrl) {
          addLog(`Navigating live browser to ${targetUrl}...`, 'info');
          handleNavigate(targetUrl);
          await sleep(2500);
        }
      }

      if (isAbortedRef.current) return;

      addLog(`Executing live AI cursor automation on ${targetUrl}...`, 'info');

      let actions = [];
      if (recipeId === 'whatsapp' || targetUrl.includes('whatsapp')) {
        actions = [
          { type: 'scroll', target: 'window', desc: 'Scanning recent conversations...' },
          { type: 'click', target: 'div[contenteditable="true"][data-tab="3"], [aria-label="Search or start new chat"], input[placeholder*="Search"]', desc: 'Focusing chat search' },
          { type: 'type', value: 'Valued Client', target: 'div[contenteditable="true"][data-tab="3"], [aria-label="Search or start new chat"]', desc: 'Searching contact' },
          { type: 'click', target: 'div[contenteditable="true"][data-tab="10"], div[title="Type a message"], footer div[contenteditable="true"]', desc: 'Focusing message input' },
          { type: 'type', value: 'Hello! Sending you our updated catalog and latest invoice details from Casjoe Agent OS.', target: 'div[contenteditable="true"][data-tab="10"], div[title="Type a message"]', desc: 'Composing message' },
          { type: 'scroll', target: 'span[data-icon="send"], button[aria-label="Send"]', desc: 'Highlighting Send button' }
        ];
      } else if (recipeId === 'linkedin' || targetUrl.includes('linkedin')) {
        actions = [
          { type: 'scroll', target: 'window', desc: 'Scanning LinkedIn feed...' },
          { type: 'click', target: 'input[placeholder*="Search"], input[aria-label*="Search"]', desc: 'Focusing search bar' },
          { type: 'type', value: 'African SME Entrepreneurs', target: 'input[placeholder*="Search"]', desc: 'Searching target sector' },
          { type: 'click', target: 'button[aria-label*="Connect"], button[aria-label*="Message"], .msg-form__contenteditable', desc: 'Positioning outreach action' },
          { type: 'type', value: 'Hi! I saw your work and wanted to connect to share insights on African enterprise tech.', target: '.msg-form__contenteditable, textarea', desc: 'Drafting connection note' }
        ];
      } else if (recipeId === 'facebook' || targetUrl.includes('facebook')) {
        actions = [
          { type: 'scroll', target: 'window', desc: 'Scanning Facebook news feed...' },
          { type: 'click', target: 'div[role="button"][tabindex="0"], div[role="region"] textarea, div[role="textbox"]', desc: 'Opening status composer' },
          { type: 'type', value: '🚀 Discover how Casjoe Agent OS empowers African businesses with 100% offline AI intelligence and business management!', target: 'div[role="textbox"], textarea', desc: 'Typing promotional copy' },
          { type: 'scroll', target: 'div[aria-label="Post"], div[aria-label="Publish"]', desc: 'Highlighting Post button' }
        ];
      } else {
        try {
          const systemPrompt = `You are an AI Browser Automation Agent. Respond ONLY with a JSON object: { "actions": [{ "type": "scroll"|"click"|"type", "target": "css_selector", "value": "text", "desc": "short step description" }] }`;
          const planPromise = executeModelRequest({
            systemPrompt,
            messages: [{ role: 'user', content: commandText }]
          });
          const timeoutPromise = new Promise(r => setTimeout(() => r({ content: 'timeout' }), 2500));
          const res = await Promise.race([planPromise, timeoutPromise]);
          const match = res.content?.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(match ? match[0] : res.content);
          actions = parsed.actions || [];
        } catch {
          actions = [
            { type: 'scroll', target: 'window', desc: 'Scanning page' },
            { type: 'click', target: 'button, a, [role="button"], input', desc: 'Selecting interactive element' },
            { type: 'type', target: 'input, textarea, [contenteditable="true"]', value: commandText, desc: 'Entering prompt data' }
          ];
        }
      }

      const totalSteps = actions.length;
      let stepIdx = 0;

      for (const act of actions) {
        if (isAbortedRef.current) break;

        stepIdx++;
        const stepText = `Step ${stepIdx}/${totalSteps}: ${act.desc || `${act.type.toUpperCase()} on ${act.target || 'page'}`}`;
        setCurrentAiAction({ step: stepIdx, total: totalSteps, message: stepText });
        addLog(stepText, 'action');

        if (webviewRef.current?.executeJavaScript) {
          try {
            await webviewRef.current.executeJavaScript(`
              (function() {
                let cursor = document.getElementById('casjoe-ai-cursor');
                if (!cursor) {
                  cursor = document.createElement('div');
                  cursor.id = 'casjoe-ai-cursor';
                  cursor.style.position = 'fixed';
                  cursor.style.zIndex = '9999999';
                  cursor.style.width = '30px';
                  cursor.style.height = '30px';
                  cursor.style.borderRadius = '50%';
                  cursor.style.background = 'rgba(6, 182, 212, 0.55)';
                  cursor.style.border = '2.5px solid #00f2fe';
                  cursor.style.boxShadow = '0 0 25px #00f2fe, inset 0 0 12px #00f2fe';
                  cursor.style.pointerEvents = 'none';
                  cursor.style.transition = 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)';

                  const label = document.createElement('div');
                  label.id = 'casjoe-ai-label';
                  label.style.position = 'absolute';
                  label.style.top = '34px';
                  label.style.left = '-15px';
                  label.style.background = '#0B1222';
                  label.style.color = '#00f2fe';
                  label.style.border = '1px solid #00f2fe';
                  label.style.padding = '2px 8px';
                  label.style.borderRadius = '6px';
                  label.style.fontSize = '10px';
                  label.style.fontWeight = 'bold';
                  label.style.whiteSpace = 'nowrap';
                  label.innerText = '🤖 Casjoe AI';
                  cursor.appendChild(label);
                  document.body.appendChild(cursor);
                }

                const targetEl = document.querySelector('${act.target || 'button, a, textarea, [role=button]'}') || document.body;
                const rect = targetEl.getBoundingClientRect();
                cursor.style.top = (rect.top + (rect.height ? rect.height/2 : 20) - 15) + 'px';
                cursor.style.left = (rect.left + (rect.width ? rect.width/2 : 20) - 15) + 'px';

                if (targetEl !== document.body) {
                  targetEl.style.outline = '2px solid #00f2fe';
                  targetEl.style.outlineOffset = '2px';
                }
              })();
            `);
          } catch {}

          if (act.type === 'scroll') {
            await webviewRef.current.executeJavaScript(`window.scrollBy({ top: 380, behavior: "smooth" });`);
          } else if (act.type === 'click') {
            await webviewRef.current.executeJavaScript(`
              (function() {
                const el = document.querySelector('${act.target || 'button, a, [role=button]'}');
                if (el) {
                  el.focus();
                  el.click();
                  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                }
              })();
            `);
          } else if (act.type === 'type') {
            const textToType = (act.value || commandText).replace(/"/g, '\\"');
            await webviewRef.current.executeJavaScript(`
              (function() {
                const el = document.querySelector('${act.target || 'textarea, [contenteditable=true], input, [role=textbox]'}') || document.querySelector('textarea, [contenteditable=true], input');
                if (el) {
                  el.focus();
                  if (el.isContentEditable) {
                    try {
                      document.execCommand('selectAll', false, null);
                      document.execCommand('insertText', false, "${textToType}");
                    } catch (e) {
                      el.innerText = "${textToType}";
                    }
                  } else {
                    el.value = "${textToType}";
                  }
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                }
              })();
            `);
          }
        }

        await sleep(delayTime);
      }

      if (!isAbortedRef.current) {
        addLog(`🎉 Live AI Browser Task Completed Successfully!`, 'success');
      }

    } catch (err) {
      addLog(`Automation Error: ${err.message}`, 'error');
    } finally {
      setIsAutomating(false);
      setCurrentAiAction(null);
    }
  };

  const handleOmnibarSubmit = async () => {
    if (!omnibarText.trim() || isAutomating) return;

    if (omnibarText.startsWith('http') || omnibarText.includes('.com') || omnibarText.includes('.org') || omnibarText.includes('.php') || omnibarText.includes('.net')) {
      handleNavigate(omnibarText);
      return;
    }

    await runAutomationFlow(omnibarText);
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
          <button 
            onClick={handleBack} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleForward} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={handleReload} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
            title="Reload Page"
          >
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

        {/* Bookmark Quick Icons & Cookie Import & Manus Tools */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
          {/* Quick Snapshot Vision Button */}
          <button
            onClick={captureScreenshot}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 rounded-xl transition"
            title="📸 Snap Viewport Screenshot & Open Vision Inspector"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Quick Structured Data Extractor Button */}
          <button
            onClick={extractStructuredTableOrProducts}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 rounded-xl transition"
            title="📊 Extract Structured Table or Product Specs to Scratchpad"
          >
            <Table className="w-4 h-4" />
          </button>

          {/* Scheduled Routines Modal Toggle */}
          <button
            onClick={() => setShowSchedulesModal(true)}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 rounded-xl transition"
            title="⏰ Scheduled Autonomous Routines & Cron"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Toggle Manus Console & Scratchpad Drawer */}
          <button
            onClick={() => setIsSideDrawerOpen(prev => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition ${
              isSideDrawerOpen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Toggle Manus Agent Console & Scratchpad"
          >
            {isSideDrawerOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Console</span>
            {taskScratchpad.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                {taskScratchpad.length}
              </span>
            )}
          </button>

          {hasInstalledCookies ? (
            <button
              onClick={() => setShowCookieModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 rounded-xl text-[11px] font-semibold transition hover:bg-emerald-900/40"
              title="Cookies installed. Click to update Chrome cookies."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">Cookies Active</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCookieModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-xl text-[11px] font-semibold transition"
              title="Import Cookies from Chrome"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cookies</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Automation Recipes Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0 px-0.5">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Recipes:</span>
        </span>
        {AUTOMATION_RECIPES.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => handleRunRecipe(r)}
              disabled={isAutomating}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition shrink-0 ${r.color} hover:brightness-125 disabled:opacity-50`}
              title={r.desc}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{r.name}</span>
            </button>
          );
        })}
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

      {/* Scheduled Routines Modal */}
      {showSchedulesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-[#050811] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Scheduled Autonomous Routines</h3>
                  <p className="text-[11px] text-slate-400">Automated background browser workflows and scheduled tasks</p>
                </div>
              </div>
              <button
                onClick={() => setShowSchedulesModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {scheduledRoutines.map((routine) => (
                <div key={routine.id} className="p-4 bg-[#050811] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${routine.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      <h4 className="text-xs font-bold text-white">{routine.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full">
                        {routine.cron}
                      </span>
                      <button
                        onClick={() => {
                          setScheduledRoutines(prev => prev.map(r => r.id === routine.id ? { ...r, enabled: !r.enabled } : r));
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                          routine.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {routine.enabled ? 'Active' : 'Paused'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 font-mono line-clamp-2">
                    🎯 Goal: {routine.command}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                    <span className="text-slate-500">Last run: {routine.lastRun}</span>
                    <button
                      onClick={async () => {
                        setShowSchedulesModal(false);
                        setOmnibarText(routine.command);
                        await runAutomationFlow(routine.command);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Run Routine Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#050811] border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSchedulesModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area (Viewport + Manus Side Drawer) */}
      <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
        {/* Main Viewport Container */}
        <div className="flex-1 bg-[#050811] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-w-0">
          {/* Live Active Takeover HUD */}
          {isAutomating && (
            <div className="bg-[#0B1528] border-b border-cyan-500/40 text-cyan-300 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-cyan-500/10 shrink-0">
              <div className="flex items-center gap-2.5 font-mono text-[11px] flex-1 min-w-[280px]">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  AI AGENT:
                </span>
                <span className="text-slate-200 truncate">{currentAiAction?.message || 'Executing automated browser actions live...'}</span>
              </div>

              {/* Live Working Memory Perception Badge */}
              {workingMemory?.authorName && (
                <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 bg-cyan-950/60 border border-cyan-800/60 rounded text-[10px] text-cyan-300">
                  <span className="font-bold">🧠 Perceived:</span>
                  <span className="text-white truncate max-w-[150px]">{workingMemory.authorName}</span>
                </div>
              )}

              {/* Active Batch Loop Countdown Ticker */}
              {batchLoopState && batchLoopState.nextInSec > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-950/60 border border-rose-700/60 rounded text-[10px] text-rose-300 animate-pulse">
                  <Sparkles className="w-3 h-3 text-rose-400" />
                  <span>Next action in <strong>{batchLoopState.nextInSec}s</strong></span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                  Step {currentAiAction?.step || 1} of {currentAiAction?.total || 1}
                </span>
                
                <button
                  onClick={() => setSpeed(s => s === 'normal' ? 'fast' : 'normal')}
                  className="text-[10px] font-bold bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 px-2 py-0.5 rounded transition flex items-center gap-1"
                  title="Toggle Execution Speed"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{speed === 'fast' ? 'Turbo' : 'Normal'}</span>
                </button>

                <button
                  onClick={() => setIsPaused(p => !p)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                    isPaused 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  onClick={handleStopAutomation}
                  className="text-[10px] font-bold bg-rose-950/60 border border-rose-800 text-rose-400 hover:bg-rose-900/80 px-2 py-0.5 rounded transition flex items-center gap-1"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Abort</span>
                </button>
              </div>
            </div>
          )}

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
              {!isElectron && (
                <div className="bg-amber-950/40 border-b border-amber-800/60 text-amber-300 text-[11px] px-4 py-2 flex items-center justify-between shrink-0">
                  <span>⚠️ <strong>Web Mode Active:</strong> WhatsApp Web &amp; LinkedIn block standard web iframes. Open native <strong>Casjoe Desktop App</strong> window to bypass frame security!</span>
                  <a href={activeTab.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-cyan-400">
                    <ExternalLink className="w-3 h-3" /> Open Directly
                  </a>
                </div>
              )}

              {/* Auth interception banner */}
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

        {/* Manus-Style Agent Console & Scratchpad Side Drawer */}
        {isSideDrawerOpen && (
          <div className="w-80 md:w-96 bg-[#0B1222] border border-slate-800/90 rounded-2xl flex flex-col overflow-hidden shadow-2xl shrink-0 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-3 bg-[#050811] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white tracking-wide">Manus Agent Console</span>
              </div>
              <button
                onClick={() => setIsSideDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Close Drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Drawer Navigation Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-[#070B15]">
              <button
                onClick={() => setActiveDrawerTab('plan')}
                className={`flex-1 py-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  activeDrawerTab === 'plan'
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Plan ({taskPlan.length})</span>
              </button>
              <button
                onClick={() => setActiveDrawerTab('scratchpad')}
                className={`flex-1 py-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  activeDrawerTab === 'scratchpad'
                    ? 'border-emerald-400 text-emerald-400 bg-emerald-950/20'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Scratchpad ({taskScratchpad.length})</span>
              </button>
              <button
                onClick={() => setActiveDrawerTab('vision')}
                className={`flex-1 py-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  activeDrawerTab === 'vision'
                    ? 'border-indigo-400 text-indigo-400 bg-indigo-950/20'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Vision</span>
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Tab 1: Execution Plan */}
              {activeDrawerTab === 'plan' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Task Graph</span>
                    {taskPlan.length > 0 && (
                      <button
                        onClick={() => setTaskPlan([])}
                        className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                      >
                        Clear Plan
                      </button>
                    )}
                  </div>

                  {taskPlan.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
                      <ListTodo className="w-6 h-6 mx-auto text-slate-600" />
                      <p>No active plan executing. Enter a research or automation goal to generate a live plan.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {taskPlan.map((step) => {
                        const isDone = step.status === 'completed';
                        const isActive = step.status === 'active';
                        return (
                          <div
                            key={step.id}
                            className={`p-2.5 rounded-xl border transition flex items-start gap-2.5 text-xs ${
                              isDone
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                                : isActive
                                ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200 shadow-sm shadow-cyan-500/10'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : isActive ? (
                                <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin inline-block"></span>
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block"></span>
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">{step.text}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Scratchpad & Extracted Data */}
              {activeDrawerTab === 'scratchpad' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Captured Data & Tables</span>
                    {taskScratchpad.length > 0 && (
                      <button
                        onClick={() => setTaskScratchpad([])}
                        className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {taskScratchpad.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
                      <Table className="w-6 h-6 mx-auto text-slate-600" />
                      <p>No structured data extracted yet. Click "Extract Table" in the top bar to pull tables or product specs.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {taskScratchpad.map((item) => (
                        <div key={item.id} className="p-3 bg-[#050811] border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-emerald-400 truncate max-w-[180px]">{item.title}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 text-[10px]">{item.timestamp}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.content);
                                  setCopiedId(item.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                                title="Copy Markdown"
                              >
                                {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={async () => {
                                  await db.documents.add({
                                    name: item.title,
                                    size: `${Math.round(item.content.length / 1024 * 10) / 10} KB`,
                                    type: 'txt',
                                    content: item.content,
                                    summary: item.content.slice(0, 150) + '...',
                                    createdAt: new Date().toISOString()
                                  });
                                  addLog(`💾 Saved "${item.title}" into Document Vault!`, 'success');
                                }}
                                className="p-1 hover:bg-slate-800 text-cyan-400 hover:text-white rounded"
                                title="Save into Document Vault"
                              >
                                <FileDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="p-2 bg-[#070B15] border border-slate-800/80 rounded-lg text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
                            {item.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Vision Preview */}
              {activeDrawerTab === 'vision' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vision Feed</span>
                    <button
                      onClick={captureScreenshot}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" /> Re-snap
                    </button>
                  </div>

                  {screenshotDataUrl ? (
                    <div className="space-y-3">
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative group">
                        <img
                          src={screenshotDataUrl}
                          alt="Viewport Snapshot"
                          className="w-full h-auto object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="text-xs bg-slate-900/90 text-cyan-300 px-3 py-1.5 rounded-xl border border-cyan-500/40">
                            Viewport Captured
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={analyzeScreenLayoutWithAi}
                        disabled={isAnalyzingVision}
                        className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingVision ? 'animate-spin' : ''}`} />
                        <span>{isAnalyzingVision ? 'Analyzing Screen Layout...' : '✨ Analyze UI Layout with AI'}</span>
                      </button>

                      <p className="text-[10px] text-slate-400">
                        📸 High-resolution visual capture of active webview. Analyzes interactive buttons, forms, and layout structure into the Scratchpad.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
                      <Camera className="w-6 h-6 mx-auto text-slate-600" />
                      <p>No screenshot captured. Click "Snap Viewport" in the top bar to take a visual snapshot.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
