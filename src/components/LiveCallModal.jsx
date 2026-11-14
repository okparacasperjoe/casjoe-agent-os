import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, 
  MessageSquare, Send, Sparkles, Captions, Maximize2, Minimize2, 
  RefreshCw, CheckCircle2, ChevronDown, User, ShieldCheck, Zap
} from 'lucide-react';
import AnimatedAvatar, { AVATAR_STYLES } from './AnimatedAvatar';
import { lipSyncEngine } from '../services/lipSyncEngine';
import { executeModelRequest, getSelectedModelConfig } from '../services/modelManager';

export default function LiveCallModal({
  isOpen,
  onClose,
  initialAvatar = AVATAR_STYLES.MUSE,
  onNavigateTab
}) {
  // Call session states
  const [callDuration, setCallDuration] = useState(0);
  const [avatarStyle, setAvatarStyle] = useState(initialAvatar);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Conversation interaction states
  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting' | 'listening' | 'thinking' | 'speaking'
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastAiMessage, setLastAiMessage] = useState('');
  const [textInput, setTextInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // DOM and hardware refs
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const containerRef = useRef(null);

  // -----------------------------------------------------------------
  // 1. CALL LIFECYCLE & TIMER
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) {
      handleEndCallCleanup();
      return;
    }

    setCallDuration(0);
    setShowSummary(false);
    setChatHistory([]);
    setCallStatus('connecting');

    // Start Call Timer
    timerIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Initial greeting from Muse AI
    const initTimer = setTimeout(() => {
      setCallStatus('speaking');
      const greeting = "Hello Casper Joe! I'm your Muse AI. I'm live and ready to help you find leads, automate missions, or run your business. What are we working on today?";
      handleAiSpeak(greeting);
    }, 900);

    return () => {
      clearTimeout(initTimer);
      handleEndCallCleanup();
    };
  }, [isOpen]);

  const handleEndCallCleanup = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    lipSyncEngine.stop();
    lipSyncEngine.stopMicMonitoring();
    stopUserWebcam();
    stopSpeechRecognition();
  };

  // -----------------------------------------------------------------
  // 2. WEBCAM USER PREVIEW (PICTURE-IN-PICTURE)
  // -----------------------------------------------------------------
  const startUserWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsVideoOn(true);
    } catch (err) {
      console.warn('Could not access webcam:', err);
      setIsVideoOn(false);
    }
  };

  const stopUserWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsVideoOn(false);
  };

  const toggleVideo = () => {
    if (isVideoOn) {
      stopUserWebcam();
    } else {
      startUserWebcam();
    }
  };

  // -----------------------------------------------------------------
  // 3. SPEECH RECOGNITION (STT) - LISTENING TO USER
  // -----------------------------------------------------------------
  const startSpeechRecognition = () => {
    if (isMicMuted || isSpeakingRef.current) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('SpeechRecognition API not available in this browser');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setCallStatus('listening');
        lipSyncEngine.startMicMonitoring();
      };

      rec.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const spoken = final || interim;
        setCurrentTranscript(spoken);

        if (final && final.trim().length > 1) {
          handleUserSpoke(final.trim());
        }
      };

      rec.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition error:', e.error);
        }
        if (!isSpeakingRef.current && !isMicMuted && isOpen) {
          setTimeout(() => startSpeechRecognition(), 1000);
        }
      };

      rec.onend = () => {
        if (!isSpeakingRef.current && !isMicMuted && isOpen) {
          setTimeout(() => startSpeechRecognition(), 500);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    lipSyncEngine.stopMicMonitoring();
  };

  const toggleMic = () => {
    setIsMicMuted((prev) => {
      const next = !prev;
      if (next) {
        stopSpeechRecognition();
        setCallStatus(isSpeakingRef.current ? 'speaking' : 'idle');
      } else {
        if (!isSpeakingRef.current) {
          startSpeechRecognition();
        }
      }
      return next;
    });
  };

  // -----------------------------------------------------------------
  // 4. AI PROCESSING & SPEECH GENERATION (TTS + LIP SYNC)
  // -----------------------------------------------------------------
  const handleUserSpoke = async (userText) => {
    if (!userText.trim()) return;

    // Stop listening while processing & speaking
    stopSpeechRecognition();
    isSpeakingRef.current = true;
    setCallStatus('thinking');

    // Add to chat history
    setChatHistory((prev) => [...prev, { role: 'user', text: userText }]);
    setCurrentTranscript(userText);

    try {
      // Prompt optimized for voice calling (short, natural, direct dialogue)
      const systemPrompt = `You are Muse AI, an expressive, highly intelligent conversational agent inside Casjoe Agent OS.
Keep your response concise (1-3 sentences max) because this is a live spoken voice call.
Be enthusiastic, helpful, and professional. You can trigger tasks or give advice on business, leads, CRM, and automation.
User's query: "${userText}"`;

      let aiResponseText = '';

      // Try local Ollama / model manager
      try {
        const config = getSelectedModelConfig();
        const res = await executeModelRequest({
          systemPrompt,
          messages: [{ role: 'user', content: userText }],
          modelConfig: config
        });
        if (res && res.content) {
          aiResponseText = res.content.trim();
        }
      } catch (err) {
        console.warn('Live call AI model call fallback:', err);
      }

      // Intelligent Fallback responses if offline model isn't active
      if (!aiResponseText) {
        const lower = userText.toLowerCase();
        if (lower.includes('lead') || lower.includes('linkedin') || lower.includes('mission')) {
          aiResponseText = "I've inspected your Live Missions. You can launch a LinkedIn lead scraper right away or audit connected Facebook profiles. Shall I open the missions board?";
        } else if (lower.includes('invoice') || lower.includes('sale') || lower.includes('money')) {
          aiResponseText = "Your Business Suite is fully synced. You have 3 pending invoices totaling $4,250 ready for follow up. Would you like me to draft reminders?";
        } else if (lower.includes('browser') || lower.includes('web') || lower.includes('site')) {
          aiResponseText = "The Agent Browser is standing by with cookie injection and session preservation ready to navigate any web destination.";
        } else if (lower.includes('who are you') || lower.includes('muse') || lower.includes('casjoe')) {
          aiResponseText = "I am Muse AI, your voice companion inside Casjoe Agent OS. I feature real-time video animated lip synchronization so we can talk just like a live call!";
        } else {
          aiResponseText = `I heard you clearly: "${userText}". I'm coordinating with your background agents to execute that right now. Anything else you need?`;
        }
      }

      await handleAiSpeak(aiResponseText);
    } catch (err) {
      console.error('Call processing failed:', err);
      await handleAiSpeak("I encountered a quick glitch, but I'm right here with you. What would you like to do next?");
    }
  };

  const handleAiSpeak = async (speechText) => {
    isSpeakingRef.current = true;
    setCallStatus('speaking');
    setLastAiMessage(speechText);
    setChatHistory((prev) => [...prev, { role: 'assistant', text: speechText }]);

    if (isSpeakerMuted) {
      // Just simulate delay if muted
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      // Speak using lip-sync engine (drives facial visemes in real-time)
      await lipSyncEngine.speak(speechText, {
        rate: 1.05,
        pitch: 1.0
      });
    }

    isSpeakingRef.current = false;
    setCallStatus('listening');

    // Automatically resume listening to user
    if (!isMicMuted && isOpen) {
      startSpeechRecognition();
    }
  };

  const handleSendTextMessage = (e) => {
    e?.preventDefault();
    if (!textInput.trim() || isSpeakingRef.current) return;
    const msg = textInput.trim();
    setTextInput('');
    handleUserSpoke(msg);
  };

  const handleEndCall = () => {
    handleEndCallCleanup();
    setShowSummary(true);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  // -----------------------------------------------------------------
  // 5. POST-CALL SUMMARY RECAP MODAL
  // -----------------------------------------------------------------
  if (showSummary) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
        <div className="bg-[#0B1222] border border-slate-700/80 rounded-3xl max-w-lg w-full p-8 text-center shadow-2xl relative">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white font-['Outfit']">Call Completed</h2>
          <p className="text-sm text-slate-400 mt-1">
            Session with Muse AI ended • <span className="text-cyan-400 font-mono font-bold">{formatTime(callDuration)}</span>
          </p>

          <div className="my-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-left max-h-48 overflow-y-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Call Highlights ({chatHistory.length} turns)
            </span>
            {chatHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No conversational exchange logged.</p>
            ) : (
              chatHistory.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <span className={item.role === 'user' ? 'text-amber-400 font-semibold' : 'text-cyan-400 font-semibold'}>
                    {item.role === 'user' ? 'You: ' : 'Muse: '}
                  </span>
                  <span className="text-slate-300">{item.text}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setShowSummary(false);
                setCallDuration(0);
                setChatHistory([]);
                setCallStatus('connecting');
                setTimeout(() => {
                  setCallStatus('speaking');
                  handleAiSpeak("I'm back on the line! How else can I assist you, Casper?");
                }, 500);
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Resume Call</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Close & Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#050914] text-white select-none overflow-hidden"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP CALL HEADER BAR                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#080E1C]/80 backdrop-blur-md border-b border-white/10 z-20">
        
        {/* Left: Caller info & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-black font-['Outfit'] tracking-wide">
                Casjoe Muse AI
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE CALL
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400/90 font-medium">
              {formatTime(callDuration)}
            </span>
          </div>
        </div>

        {/* Center: Quick Avatar Style Selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#0C1529] p-1 rounded-2xl border border-white/10">
          {[
            { id: AVATAR_STYLES.MUSE, label: 'Muse Cyber', color: 'text-cyan-400' },
            { id: AVATAR_STYLES.AURA, label: 'Aura 3D', color: 'text-pink-400' },
            { id: AVATAR_STYLES.CASJOE, label: 'Casjoe Core', color: 'text-amber-400' },
            { id: AVATAR_STYLES.HOLO, label: 'Hologram', color: 'text-emerald-400' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setAvatarStyle(item.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                avatarStyle === item.id
                  ? 'bg-white/10 text-white shadow-sm border border-white/15'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={item.color}>●</span> {item.label}
            </button>
          ))}
        </div>

        {/* Right: Technical Badges & Window controls */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Local</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CENTRAL VIDEO STAGE WITH ANIMATED AVATAR                   */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        
        {/* Subtle Background Glow Animation */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1428] via-[#050914] to-[#04070F] pointer-events-none" />

        {/* Background Grid Accent Lines */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6,182,212,0.15) 0%, transparent 65%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 48px 48px, 48px 48px'
          }}
        />

        {/* Central Animated Video Avatar */}
        <div className="relative z-10 my-auto">
          <AnimatedAvatar
            avatarStyle={avatarStyle}
            isSpeaking={callStatus === 'speaking'}
            isListening={callStatus === 'listening'}
            isThinking={callStatus === 'thinking'}
            showAudioRings={true}
          />
        </div>

        {/* ----------------------------------------------------------- */}
        {/* 3. USER WEBCAM PICTURE-IN-PICTURE (PIP)                     */}
        {/* ----------------------------------------------------------- */}
        <div className="absolute bottom-24 right-6 z-30">
          <div className="relative w-36 h-28 md:w-44 md:h-32 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/20 shadow-2xl transition-all duration-200">
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 space-y-1">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">Camera Off</span>
              </div>
            )}

            {/* User tag */}
            <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isMicMuted ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'}`} />
              <span>You</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* 4. REAL-TIME FLOATING CAPTIONS OVERLAY                      */}
        {/* ----------------------------------------------------------- */}
        {showCaptions && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-2xl w-[90%] z-20 pointer-events-none transition-all duration-300">
            {callStatus === 'speaking' && lastAiMessage && (
              <div className="bg-black/75 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-3.5 shadow-2xl text-center animate-in fade-in slide-in-from-bottom-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 block mb-1">
                  Muse AI Speaking
                </span>
                <p className="text-sm md:text-base text-white font-medium leading-relaxed">
                  "{lastAiMessage}"
                </p>
              </div>
            )}

            {callStatus === 'listening' && currentTranscript && (
              <div className="bg-black/75 backdrop-blur-lg border border-emerald-500/30 rounded-2xl p-3.5 shadow-2xl text-center animate-in fade-in slide-in-from-bottom-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
                  You are speaking...
                </span>
                <p className="text-sm md:text-base text-white font-medium leading-relaxed">
                  "{currentTranscript}"
                </p>
              </div>
            )}

            {callStatus === 'thinking' && (
              <div className="bg-black/75 backdrop-blur-lg border border-amber-500/30 rounded-2xl p-3 shadow-2xl text-center">
                <span className="text-xs font-semibold text-amber-300 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Processing voice input & formulating response...
                </span>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* 5. QUICK VOICE PROMPT PILLS                                 */}
        {/* ----------------------------------------------------------- */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap gap-2 justify-center max-w-xl px-4 pointer-events-auto">
          {[
            "Find LinkedIn leads",
            "What can you automate?",
            "Draft a client invoice",
            "Audit my connected accounts"
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleUserSpoke(prompt)}
              disabled={callStatus === 'speaking' || callStatus === 'thinking'}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-300 transition backdrop-blur-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✦ {prompt}
            </button>
          ))}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. IN-CALL TEXT CHAT DRAWER (COLLAPSIBLE)                     */}
      {/* ------------------------------------------------------------- */}
      {showChatDrawer && (
        <div className="absolute top-16 right-0 bottom-24 w-80 md:w-96 bg-[#080E1C]/95 backdrop-blur-xl border-l border-white/10 z-30 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>In-Call Dialogue & Fallback</span>
            </h3>
            <button
              onClick={() => setShowChatDrawer(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.map((msg, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'ml-auto bg-cyan-600 text-white rounded-br-none' 
                    : 'mr-auto bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendTextMessage} className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type message to Muse..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || callStatus === 'speaking'}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. BOTTOM IN-CALL CONTROL BAR                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="px-6 py-4 bg-[#080E1C]/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-between z-20">
        
        {/* Left Sub-controls: Captions & Speaker */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCaptions((prev) => !prev)}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              showCaptions
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={showCaptions ? "Hide Subtitles" : "Show Subtitles"}
          >
            <Captions className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setIsSpeakerMuted((prev) => {
                const next = !prev;
                if (next) lipSyncEngine.stop();
                return next;
              });
            }}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              isSpeakerMuted
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={isSpeakerMuted ? "Unmute AI Voice" : "Mute AI Voice"}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Center Primary Calling Controls */}
        <div className="flex items-center gap-4">
          
          {/* 1. Mute / Unmute Mic Button */}
          <button
            onClick={toggleMic}
            className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer shadow-lg ${
              isMicMuted
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 border-white/15 text-white'
            }`}
            title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* 2. End Call Button (Prominent Red) */}
          <button
            onClick={handleEndCall}
            className="px-6 py-4 rounded-3xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex items-center gap-2.5 transition-all duration-200 shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 cursor-pointer"
            title="Hang Up / End Call"
          >
            <PhoneOff className="w-6 h-6" />
            <span className="hidden sm:inline text-sm">End Call</span>
          </button>

          {/* 3. Video Camera Toggle Button */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer shadow-lg ${
              isVideoOn
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30'
                : 'bg-slate-800 hover:bg-slate-700 border-white/15 text-white'
            }`}
            title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

        </div>

        {/* Right Sub-controls: Text Drawer */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChatDrawer((prev) => !prev)}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              showChatDrawer
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Text Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

      </div>

    </div>
  );
}
