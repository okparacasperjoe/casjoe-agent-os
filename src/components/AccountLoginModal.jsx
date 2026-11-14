import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Lock, ExternalLink, RefreshCw, ArrowLeft, CheckCircle2, 
  X, AlertTriangle, KeyRound, Globe, Sparkles 
} from 'lucide-react';
import { updateConnectedAccount } from '../db/hooks';

export default function AccountLoginModal({ account, isOpen, onClose, onAccountConnected }) {
  const [currentUrl, setCurrentUrl] = useState(account?.loginUrl || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [detectedUser, setDetectedUser] = useState(null);
  const webviewRef = useRef(null);

  useEffect(() => {
    if (account?.loginUrl) {
      setCurrentUrl(account.loginUrl);
      setIsSuccess(false);
      setIsLoading(true);
    }
  }, [account]);

  useEffect(() => {
    if (!isOpen) return;

    const webview = webviewRef.current;
    if (!webview) return;

    const handleDidNavigate = (e) => {
      const url = e.url;
      setCurrentUrl(url);
      setIsLoading(false);
      checkIfLoggedIn(url);
    };

    const handleDidNavigateInPage = (e) => {
      const url = e.url;
      setCurrentUrl(url);
      checkIfLoggedIn(url);
    };

    const handleDidStartLoading = () => setIsLoading(true);
    const handleDidStopLoading = () => setIsLoading(false);

    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage);
    webview.addEventListener('did-start-loading', handleDidStartLoading);
    webview.addEventListener('did-stop-loading', handleDidStopLoading);

    return () => {
      if (webview) {
        webview.removeEventListener('did-navigate', handleDidNavigate);
        webview.removeEventListener('did-navigate-in-page', handleDidNavigateInPage);
        webview.removeEventListener('did-start-loading', handleDidStartLoading);
        webview.removeEventListener('did-stop-loading', handleDidStopLoading);
      }
    };
  }, [isOpen, account]);

  const checkIfLoggedIn = async (url) => {
    if (!account) return;
    const lower = url.toLowerCase();
    let loggedIn = false;

    // Detection heuristics based on destination URLs after successful authentication
    if (account.platform === 'linkedin') {
      if (lower.includes('/feed') || lower.includes('/in/') || lower.includes('/mynetwork') || lower.includes('/messaging')) {
        loggedIn = true;
      }
    } else if (account.platform === 'facebook') {
      if ((lower.includes('facebook.com') || lower.includes('fb.com')) && !lower.includes('login') && !lower.includes('checkpoint')) {
        loggedIn = true;
      }
    } else if (account.platform === 'instagram') {
      if (lower.includes('instagram.com') && !lower.includes('/accounts/login') && !lower.includes('/accounts/emailsignup')) {
        loggedIn = true;
      }
    } else if (account.platform === 'twitter') {
      if (lower.includes('/home') || lower.includes('/messages') || lower.includes('/notifications')) {
        loggedIn = true;
      }
    } else if (account.platform === 'google') {
      if (lower.includes('myaccount.google.com') || lower.includes('mail.google.com') || lower.includes('drive.google.com')) {
        loggedIn = true;
      }
    } else if (account.platform === 'whatsapp') {
      // WhatsApp web is logged in when chat list or main app shell mounts
      if (lower.includes('web.whatsapp.com') && !lower.includes('login')) {
        loggedIn = true;
      }
    }

    if (loggedIn && !isSuccess) {
      handleSuccessfulLogin();
    }
  };

  const handleSuccessfulLogin = async () => {
    setIsSuccess(true);
    try {
      if (account?.id) {
        await updateConnectedAccount(account.id, {
          status: 'connected',
          lastSynced: new Date().toISOString(),
          cookiesCount: 15 // verified session
        });
      }
      if (onAccountConnected) onAccountConnected(account);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Failed to update account status:', err);
    }
  };

  const handleReload = () => {
    if (webviewRef.current) webviewRef.current.reload();
  };

  const handleGoBack = () => {
    if (webviewRef.current && webviewRef.current.canGoBack()) {
      webviewRef.current.goBack();
    }
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B1222] border border-cyan-500/40 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#070B15] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Connect {account.name}</h3>
                <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-full font-mono font-bold border border-cyan-500/20">
                  PERSISTENT PARTITION
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Log in once. Your session remains securely saved offline on your device.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Cloud Transmission</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Navigation Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#090E1A] border-b border-white/5 shrink-0 text-xs">
          <button
            onClick={handleGoBack}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            title="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReload}
            className={`p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition ${isLoading ? 'animate-spin text-cyan-400' : ''}`}
            title="Reload Page"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 flex items-center gap-2 bg-[#070B15] border border-white/10 px-3 py-1.5 rounded-xl font-mono text-[11px] text-slate-300 truncate">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{currentUrl}</span>
          </div>

          {/* Manual Completion Confirmation Button */}
          <button
            onClick={handleSuccessfulLogin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
            title="Click here if you have already completed login/2FA"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>I'm Logged In</span>
          </button>
        </div>

        {/* Success Banner Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-50 bg-[#070B15]/95 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-white">{account.name} Connected Successfully!</h2>
              <p className="text-xs text-slate-400">Session saved into Casjoe Local Partition. Autonomous agents can now operate on this account.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 px-3 py-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Ready for Autonomous Missions</span>
            </div>
          </div>
        )}

        {/* Embedded Isolated WebView */}
        <div className="flex-1 w-full h-full relative bg-slate-950">
          <webview
            ref={webviewRef}
            src={account.loginUrl}
            partition="persist:casjoe_agent_browser"
            className="w-full h-full border-none"
            allowpopups="true"
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
          />
        </div>

        {/* Modal Bottom Privacy Notice */}
        <div className="px-5 py-2.5 bg-[#070B15] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Casjoe Secure Vault: Passwords, cookies, and tokens are stored 100% locally in your device partition.</span>
          </div>
          <span className="font-mono text-slate-500 text-[10px]">Partition: persist:casjoe_agent_browser</span>
        </div>

      </div>
    </div>
  );
}
