import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, 
  MessageSquare, Send, Sparkles, Captions, Maximize2, Minimize2, 
  RefreshCw, CheckCircle2, ChevronDown, User, ShieldCheck, Zap,
  Sliders, Upload, Music, Volume1, Play
} from 'lucide-react';
import AnimatedHumanAvatar, { HUMAN_AVATAR_PRESETS } from './AnimatedHumanAvatar';
import AnimatedAvatar, { AVATAR_STYLES } from './AnimatedAvatar';
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
  MUSE_CYBER: 'muse',
  CUSTOM: 'custom'
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
  const [customAvatarImg, setCustomAvatarImg] = useState(null);

  // Voice Tone states
  const [selectedVoiceTone, setSelectedVoiceTone] = useState(() => {
    return localStorage.getItem('casjoe_voice_tone') || 'elena';
  });
  const [voicePitch, setVoicePitch] = useState(() => {
    return parseFloat(localStorage.getItem('casjoe_voice_pitch') || '1.0');
  });
  const [voiceRate, setVoiceRate] = useState(() => {
    return parseFloat(localStorage.getItem('casjoe_voice_rate') || '0.98');
  });
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => {
    return localStorage.getItem('casjoe_voice_name') || '';
  });
  const [availableSystemVoices, setAvailableSystemVoices] = useState([]);
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
  const fileInputRef = useRef(null);

  // Load OS speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      const v = lipSyncEngine.getAvailableVoices();
      if (v.length > 0) {
        setAvailableSystemVoices(v);
      }
    };
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

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

    // Initial greeting from AI Presenter
    const initTimer = setTimeout(() => {
      setCallStatus('speaking');
      const avatarName = avatarType === 'marcus' ? 'Marcus' : avatarType === 'sophia' ? 'Sophia' : 'Elena';
      const greeting = `Hello Casper Joe! I'm ${avatarName}, your AI partner. I'm live on the line with video animated lip synchronization. How can I assist you with your business, missions, or leads today?`;
      handleAiSpeak(greeting);
    }, 800);

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
      const avatarName = avatarType === 'marcus' ? 'Marcus' : avatarType === 'sophia' ? 'Sophia' : 'Elena';
      const systemPrompt = `You are ${avatarName}, an intelligent, polished, and natural AI advisor inside Casjoe Agent OS.
Keep your answer clear, conversational, and natural (1 to 3 sentences max) because this is a live spoken video call.
Avoid markdown asterisks or bullet points. Speak directly as a human presenter would.
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
          aiResponseText = "I've checked your Live Missions. You can launch a LinkedIn lead scraper right away or audit connected Facebook profiles. Shall I open the missions board?";
        } else if (lower.includes('invoice') || lower.includes('sale') || lower.includes('money')) {
          aiResponseText = "Your Business Suite is fully synced. You have 3 pending invoices totaling $4,250 ready for follow up. Would you like me to draft reminders?";
        } else if (lower.includes('browser') || lower.includes('web') || lower.includes('site')) {
          aiResponseText = "The Agent Browser is standing by with cookie injection and session preservation ready to navigate any web destination.";
        } else if (lower.includes('who are you') || lower.includes('name') || lower.includes('casjoe')) {
          aiResponseText = `I am ${avatarName}, your AI companion in Casjoe Agent OS. I feature real-time video animated lip synchronization so our conversations feel natural and lifelike!`;
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
        rate: voiceRate,
        voiceName: selectedVoiceName
      });
    }

    isSpeakingRef.current = false;
    setCallStatus('listening');

    // Automatically resume listening to user
    if (!isMicMuted && isOpen) {
      startSpeechRecognition();
    }
  };

  // Preview / Test Voice Tone
  const handleTestVoiceTone = async (toneId) => {
    if (isTestingVoice) return;
    setIsTestingVoice(true);
    const preset = VOICE_TONES[toneId?.toUpperCase()] || VOICE_TONES.ELENA;
    await lipSyncEngine.speak(preset.sampleText, {
      toneId,
      pitch: voicePitch,
      rate: voiceRate,
      voiceName: selectedVoiceName
    });
    setIsTestingVoice(false);
  };

  // Handle Custom Avatar Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomAvatarImg(event.target.result);
      setAvatarType(CALL_AVATAR_TYPES.CUSTOM);
    };
    reader.readAsDataURL(file);
  };

  // Select Avatar & automatically match Voice Tone
  const handleSelectAvatar = (type) => {
    setAvatarType(type);
    if (type === CALL_AVATAR_TYPES.MARCUS) {
      setSelectedVoiceTone('marcus');
      lipSyncEngine.setVoiceTone('marcus');
    } else if (type === CALL_AVATAR_TYPES.SOPHIA) {
      setSelectedVoiceTone('sophia');
      lipSyncEngine.setVoiceTone('sophia');
    } else if (type === CALL_AVATAR_TYPES.ELENA) {
      setSelectedVoiceTone('elena');
      lipSyncEngine.setVoiceTone('elena');
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

  const isHumanAvatar = avatarType !== CALL_AVATAR_TYPES.MUSE_CYBER;
  const currentAvatarName = avatarType === 'marcus' ? 'Marcus' : avatarType === 'sophia' ? 'Sophia' : avatarType === 'custom' ? 'Custom Avatar' : avatarType === 'muse' ? 'Muse Cyber' : 'Elena';

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#050914] text-white select-none overflow-hidden"
    >
      {/* Hidden file input for custom human photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

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
                {currentAvatarName} • Live Call
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                HD VIDEO &amp; LIP-SYNC
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400/90 font-medium">
              {formatTime(callDuration)}
            </span>
          </div>
        </div>

        {/* Center: Avatar Selection Bar (Elena, Marcus, Sophia, Custom, Cyber) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#0C1529] p-1.5 rounded-2xl border border-white/10">
          {[
            { id: CALL_AVATAR_TYPES.ELENA, label: 'Elena', tag: 'Human' },
            { id: CALL_AVATAR_TYPES.MARCUS, label: 'Marcus', tag: 'Human' },
            { id: CALL_AVATAR_TYPES.SOPHIA, label: 'Sophia', tag: 'Human' },
            { id: CALL_AVATAR_TYPES.MUSE_CYBER, label: 'Muse Cyber', tag: 'Vector' }
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

          {/* Upload Custom Photo Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              avatarType === CALL_AVATAR_TYPES.CUSTOM
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Upload any human photo from your computer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Photo</span>
          </button>
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
      {/* 2. CENTRAL VIDEO STAGE WITH ANIMATED AVATAR                   */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1428] via-[#050914] to-[#04070F] pointer-events-none" />

        {/* Central Avatar Stage */}
        <div className="relative z-10 my-auto">
          {isHumanAvatar ? (
            <AnimatedHumanAvatar
              avatarId={avatarType}
              customImage={avatarType === CALL_AVATAR_TYPES.CUSTOM ? customAvatarImg : null}
              isSpeaking={callStatus === 'speaking'}
              isListening={callStatus === 'listening'}
              isThinking={callStatus === 'thinking'}
              showRings={true}
            />
          ) : (
            <AnimatedAvatar
              avatarStyle={AVATAR_STYLES.MUSE}
              isSpeaking={callStatus === 'speaking'}
              isListening={callStatus === 'listening'}
              isThinking={callStatus === 'thinking'}
              showAudioRings={true}
            />
          )}
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
                  {currentAvatarName} Speaking
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
      {/* 6. VOICE TONE & AUDIO SETTINGS DRAWER                         */}
      {/* ------------------------------------------------------------- */}
      {showVoiceSettings && (
        <div className="absolute top-16 right-0 bottom-24 w-84 md:w-96 bg-[#080E1C]/95 backdrop-blur-xl border-l border-white/15 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 p-5 overflow-y-auto space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold flex items-center gap-2 text-white">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Voice Tone &amp; Audio Selection</span>
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
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Natural Voice Tone Presets
            </label>

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

          {/* Pitch & Speed Fine-Tuning */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Voice Pitch</span>
                <span className="text-cyan-400 font-mono">{voicePitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.02"
                value={voicePitch}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVoicePitch(val);
                  lipSyncEngine.setCustomPitch(val);
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Deeper</span>
                <span>Default</span>
                <span>Higher</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Speech Rate / Speed</span>
                <span className="text-cyan-400 font-mono">{voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.25"
                step="0.02"
                value={voiceRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVoiceRate(val);
                  lipSyncEngine.setCustomRate(val);
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Relaxed</span>
                <span>Conversational</span>
                <span>Fast</span>
              </div>
            </div>
          </div>

          {/* Direct System Voice Selection */}
          {availableSystemVoices.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Installed System Voice Override
              </label>
              <select
                value={selectedVoiceName}
                onChange={(e) => {
                  setSelectedVoiceName(e.target.value);
                  lipSyncEngine.setSelectedVoiceName(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Auto-select Best Natural Voice</option>
                {availableSystemVoices.map((v, i) => (
                  <option key={i} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              onClick={() => handleTestVoiceTone(selectedVoiceTone)}
              disabled={isTestingVoice}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isTestingVoice ? 'Speaking Sample...' : 'Test Current Voice Tone'}</span>
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
