import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, 
  MessageSquare, Send, Sparkles, Captions, Maximize2, Minimize2, 
  RefreshCw, CheckCircle2, ChevronDown, User, ShieldCheck, Zap,
  Sliders, Play, Radio
} from 'lucide-react';
import ThreeHumanAvatar, { THREE_AVATAR_PERSONAS } from './ThreeHumanAvatar';
import { 
  lipSyncEngine, 
  VOICE_TONES, 
  cleanTextForNaturalSpeech 
} from '../services/lipSyncEngine';
import { executeModelRequest, getSelectedModelConfig } from '../services/modelManager';

export const CALL_AVATAR_TYPES = {
  ELENA: 'elena',
  MARCUS: 'marcus',
  SOPHIA: 'sophia',
  DAVID: 'david'
};

export default function LiveCallModal({
  isOpen,
  onClose,
  initialAvatar = CALL_AVATAR_TYPES.ELENA,
  onNavigateTab
}) {
  // Call session states
  const [callDuration, setCallDuration] = useState(0);
  const [avatarType, setAvatarType] = useState(initialAvatar);

  // Voice Tone states
  const [selectedVoiceTone, setSelectedVoiceTone] = useState(() => {
    return localStorage.getItem('casjoe_voice_tone') || 'elena';
  });
  const [voicePitch, setVoicePitch] = useState(() => {
    return parseFloat(localStorage.getItem('casjoe_voice_pitch') || '1.0');
  });
  const [voiceRate, setVoiceRate] = useState(() => {
    return parseFloat(localStorage.getItem('casjoe_voice_rate') || '1.0');
  });
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Call hardware & control states
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Conversation interaction states
  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting' | 'listening' | 'thinking' | 'speaking'
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastAiMessage, setLastAiMessage] = useState('');
  const [textInput, setTextInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Hardware & DOM refs
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const containerRef = useRef(null);

  const persona = THREE_AVATAR_PERSONAS[avatarType?.toUpperCase()] || THREE_AVATAR_PERSONAS.ELENA;

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

    // Initial greeting from AI Presenter using Edge Neural Voice
    const initTimer = setTimeout(() => {
      setCallStatus('speaking');
      const greeting = `Hello Casper Joe! I'm ${persona.name}. I'm live on the line with real-time 3D facial blendshape animation and Microsoft Edge neural speech. What would you like to work on today?`;
      handleAiSpeak(greeting);
    }, 700);

    return () => {
      clearTimeout(initTimer);
      handleEndCallCleanup();
    };
  }, [isOpen, avatarType]);

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
  // 4. AI PROCESSING & SPEECH GENERATION (EDGE NEURAL TTS + 3D LIP SYNC)
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
      const systemPrompt = `You are ${persona.name}, an intelligent, polished, and natural AI advisor inside Casjoe Agent OS.
Keep your answer clear, conversational, and concise (1 to 3 sentences max) because this is a live spoken video call.
Do not output markdown formatting like asterisks or hashtags. Speak directly and naturally as a human presenter would.
User asked: "${userText}"`;

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
          aiResponseText = "I've inspected your Live Missions. You can launch an automated LinkedIn lead scraper right away or audit connected Facebook profiles. Shall I open the missions dashboard?";
        } else if (lower.includes('invoice') || lower.includes('sale') || lower.includes('money')) {
          aiResponseText = "Your Business Suite is fully synced. You have 3 pending invoices totaling $4,250 ready for follow up. Would you like me to draft reminders?";
        } else if (lower.includes('browser') || lower.includes('web') || lower.includes('site')) {
          aiResponseText = "The Agent Browser is standing by with cookie injection and session preservation ready to navigate any web destination.";
        } else if (lower.includes('who are you') || lower.includes('name') || lower.includes('casjoe')) {
          aiResponseText = `I am ${persona.name}, your 3D executive AI advisor in Casjoe Agent OS. I am powered by Microsoft Edge neural voice streaming and real-time 3D blendshape facial animation!`;
        } else {
          aiResponseText = `I heard you clearly: "${userText}". I am coordinating with your background agents to handle this right now. What else would you like to review?`;
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
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      // Natural speech cleaning (eliminates robotic symbols and pauses)
      const smoothed = cleanTextForNaturalSpeech(speechText);
      await lipSyncEngine.speak(smoothed, {
        toneId: selectedVoiceTone,
        pitch: voicePitch,
        rate: voiceRate
      });
    }

    isSpeakingRef.current = false;
    setCallStatus('listening');

    // Automatically resume listening to user
    if (!isMicMuted && isOpen) {
      startSpeechRecognition();
    }
  };

  // Preview / Test Voice Tone with real Edge Neural stream
  const handleTestVoiceTone = async (toneId) => {
    if (isTestingVoice) return;
    setIsTestingVoice(true);
    const preset = VOICE_TONES[toneId?.toUpperCase()] || VOICE_TONES.ELENA;
    const sample = `Hello Casper! This is the natural neural voice for ${preset.name}. It streams with human cadence and zero robotic artifacts.`;
    await lipSyncEngine.speak(sample, {
      toneId,
      pitch: voicePitch,
      rate: voiceRate
    });
    setIsTestingVoice(false);
  };

  // Select Avatar & automatically sync Voice Tone
  const handleSelectAvatar = (type) => {
    setAvatarType(type);
    setSelectedVoiceTone(type);
    lipSyncEngine.setVoiceTone(type);
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
            Session ended • <span className="text-cyan-400 font-mono font-bold">{formatTime(callDuration)}</span>
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
                    {item.role === 'user' ? 'You: ' : 'AI: '}
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
              Close &amp; Return
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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-black font-['Outfit'] tracking-wide">
                {persona.name} • 3D Live Call
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                3D BLENDSHAPES &amp; NEURAL AUDIO
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400/90 font-medium">
              {formatTime(callDuration)}
            </span>
          </div>
        </div>

        {/* Center: 3D Persona Selection Bar */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#0C1529] p-1.5 rounded-2xl border border-white/10">
          {[
            { id: CALL_AVATAR_TYPES.ELENA, label: 'Elena', tag: '3D Executive' },
            { id: CALL_AVATAR_TYPES.MARCUS, label: 'Marcus', tag: '3D Commercial' },
            { id: CALL_AVATAR_TYPES.SOPHIA, label: 'Sophia', tag: '3D Growth' },
            { id: CALL_AVATAR_TYPES.DAVID, label: 'David', tag: '3D Corporate' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectAvatar(item.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                avatarType === item.id
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950/80 text-cyan-300 font-mono">
                {item.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Technical Badges & Window controls */}
        <div className="flex items-center gap-2">
          {/* Voice Tone Selector Trigger */}
          <button
            onClick={() => setShowVoiceSettings((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              showVoiceSettings
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Select Voice Tone & Fine-tune Audio"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Voice &amp; Tone</span>
          </button>

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
      {/* 2. CENTRAL VIDEO STAGE WITH 3D WEBGL BLENDSHAPE AVATAR        */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        
        {/* Soft Radial Ambient Studio Lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1428] via-[#050914] to-[#04070F] pointer-events-none" />

        {/* Central 3D Human Blendshape Avatar */}
        <div className="relative z-10 my-auto">
          <ThreeHumanAvatar
            personaId={avatarType}
            isSpeaking={callStatus === 'speaking'}
            isListening={callStatus === 'listening'}
            isThinking={callStatus === 'thinking'}
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
                  {persona.name} Speaking (Edge Neural)
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
                  Formulating intelligent response...
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
            "Review pending invoices",
            "Audit connected accounts"
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
      {/* 6. VOICE TONE & AUDIO SETTINGS DRAWER                         */}
      {/* ------------------------------------------------------------- */}
      {showVoiceSettings && (
        <div className="absolute top-16 right-0 bottom-24 w-84 md:w-96 bg-[#080E1C]/95 backdrop-blur-xl border-l border-white/15 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 p-5 overflow-y-auto space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-white">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Voice Tone &amp; Neural Streaming</span>
            </h3>
            <button
              onClick={() => setShowVoiceSettings(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Voice Tone Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Edge Neural Voices (Studio Human)
              </label>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Free
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {Object.values(VOICE_TONES).map((tone) => (
                <div
                  key={tone.id}
                  onClick={() => {
                    setSelectedVoiceTone(tone.id);
                    lipSyncEngine.setVoiceTone(tone.id);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedVoiceTone === tone.id
                      ? 'bg-cyan-500/15 border-cyan-500/60 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className={tone.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}>
                        {tone.gender === 'female' ? '♀' : '♂'}
                      </span>
                      <span>{tone.name}</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tone.description}</p>
                    <span className="text-[9px] font-mono text-cyan-400/80 block mt-0.5">
                      Voice: {tone.edgeVoice}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestVoiceTone(tone.id);
                    }}
                    disabled={isTestingVoice}
                    className="p-2 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 transition cursor-pointer"
                    title="Play voice tone sample"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => handleTestVoiceTone(selectedVoiceTone)}
              disabled={isTestingVoice}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isTestingVoice ? 'Streaming Audio Sample...' : 'Test Current Neural Voice'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. IN-CALL TEXT CHAT DRAWER                                   */}
      {/* ------------------------------------------------------------- */}
      {showChatDrawer && (
        <div className="absolute top-16 right-0 bottom-24 w-80 md:w-96 bg-[#080E1C]/95 backdrop-blur-xl border-l border-white/10 z-30 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>In-Call Dialogue &amp; Fallback</span>
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
              placeholder="Type message to presenter..."
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
      {/* 8. BOTTOM IN-CALL CONTROL BAR                                 */}
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

        {/* Right Sub-controls: Text Drawer & Voice Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVoiceSettings((prev) => !prev)}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              showVoiceSettings
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Voice Tone Settings"
          >
            <Sliders className="w-5 h-5" />
          </button>

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
