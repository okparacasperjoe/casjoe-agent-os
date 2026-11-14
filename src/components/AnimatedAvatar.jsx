import React, { useState, useEffect, useRef } from 'react';
import { lipSyncEngine, VISEMES } from '../services/lipSyncEngine';
import { Sparkles, Bot, Eye } from 'lucide-react';

export const AVATAR_STYLES = {
  MUSE: 'muse',       // Modern Cyberpunk / Meta Muse Neon AI
  AURA: 'aura',       // Stylized 3D Realistic Companion
  CASJOE: 'casjoe',   // Executive Charcoal & Gold Agent
  HOLO: 'holo'        // Digital Holographic Entity
};

export default function AnimatedAvatar({
  avatarStyle = AVATAR_STYLES.MUSE,
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  customStatus = null,
  showAudioRings = true,
  className = ''
}) {
  // Live viseme & physics state from engine
  const [viseme, setViseme] = useState({
    open: 0.02,
    width: 1.0,
    round: 0.05,
    teeth: false,
    tongue: false,
    audioLevel: 0,
    micLevel: 0,
    visemeName: 'REST'
  });

  // Natural blinking state
  const [isBlinking, setIsBlinking] = useState(false);
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0, rotate: 0 });
  const [eyeGaze, setEyeGaze] = useState({ x: 0, y: 0 });

  const blinkTimerRef = useRef(null);
  const headTimerRef = useRef(null);

  // Subscribe to real-time lip sync engine updates
  useEffect(() => {
    const unsubscribe = lipSyncEngine.subscribe((state) => {
      setViseme(state);
    });
    return () => unsubscribe();
  }, []);

  // Natural blinking cycle (blinks every 3-5 seconds)
  useEffect(() => {
    let active = true;
    const scheduleNextBlink = () => {
      const delay = 2500 + Math.random() * 3000;
      blinkTimerRef.current = setTimeout(() => {
        if (!active) return;
        setIsBlinking(true);
        setTimeout(() => {
          if (!active) return;
          setIsBlinking(false);
          scheduleNextBlink();
        }, 140);
      }, delay);
    };

    scheduleNextBlink();
    return () => {
      active = false;
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Organic micro-head motion & subtle eye gaze shift
  useEffect(() => {
    let active = true;
    const interval = setInterval(() => {
      if (!active) return;

      if (isThinking) {
        // Thinking: look up and slightly to side
        setHeadTilt({ x: 2, y: -4, rotate: 1.8 });
        setEyeGaze({ x: 3, y: -2 });
      } else if (isListening) {
        // Listening: attentive forward tilt
        setHeadTilt({ x: 0, y: 2, rotate: -0.8 });
        setEyeGaze({ x: 0, y: 1 });
      } else if (isSpeaking) {
        // Speaking: rhythmic subtle nods
        const nod = Math.sin(Date.now() / 180) * 2.5;
        const sway = Math.cos(Date.now() / 320) * 1.5;
        setHeadTilt({ x: sway, y: nod, rotate: sway * 0.4 });
        setEyeGaze({ x: sway * 0.6, y: nod * 0.4 });
      } else {
        // Idle: gentle ambient float
        const t = Date.now() / 1500;
        setHeadTilt({ x: Math.cos(t) * 1.5, y: Math.sin(t) * 2, rotate: Math.sin(t * 0.5) * 0.8 });
        setEyeGaze({ x: 0, y: 0 });
      }
    }, 80);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isSpeaking, isListening, isThinking]);

  // Derived mouth coordinates calculated from viseme physics
  const openHeight = Math.max(0, Math.min(26, viseme.open * 26)); // Mouth open vertical height (0 to 26px)
  const mouthWidthScale = Math.max(0.6, Math.min(1.4, viseme.width)); // Horizontal lip width (0.6 to 1.4)
  const roundness = Math.max(0, Math.min(1, viseme.round)); // Rounding factor for O/U

  // Corner mouth points (center is X=100, Y=128)
  const halfWidth = 24 * mouthWidthScale;
  const leftX = 100 - halfWidth;
  const rightX = 100 + halfWidth;

  const mouthBaseY = 126;
  const upperLipControlY = mouthBaseY - (roundness * 3);
  const lowerLipY = mouthBaseY + openHeight;
  const lowerLipControlY = lowerLipY + (openHeight > 4 ? 4 + roundness * 2 : 0);

  // SVG Paths
  // Upper Lip Path
  const upperLipPath = `M ${leftX} ${mouthBaseY} Q 100 ${upperLipControlY} ${rightX} ${mouthBaseY}`;

  // Inner Mouth Cavity (open space)
  const innerCavityPath = openHeight > 2
    ? `M ${leftX} ${mouthBaseY} Q 100 ${mouthBaseY - 2} ${rightX} ${mouthBaseY} Q 100 ${lowerLipControlY} ${leftX} ${mouthBaseY} Z`
    : '';

  // Teeth Path (visible inside open mouth)
  const teethHeight = Math.min(openHeight * 0.45, 6);
  const teethPath = (viseme.teeth && openHeight > 3)
    ? `M ${leftX + 6} ${mouthBaseY + 1} Q 100 ${mouthBaseY + 2} ${rightX - 6} ${mouthBaseY + 1} L ${rightX - 8} ${mouthBaseY + teethHeight} Q 100 ${mouthBaseY + teethHeight + 1} ${leftX + 8} ${mouthBaseY + teethHeight} Z`
    : '';

  // Tongue Path
  const tonguePath = (viseme.tongue || openHeight > 14)
    ? `M ${100 - halfWidth * 0.5} ${lowerLipY - 1} Q 100 ${lowerLipY - 6} ${100 + halfWidth * 0.5} ${lowerLipY - 1} Z`
    : '';

  // Outer Lip Outline
  const lowerLipOutlinePath = `M ${leftX} ${mouthBaseY} Q 100 ${lowerLipControlY + 3} ${rightX} ${mouthBaseY}`;

  // Eyes coordinates & squint
  const eyeSquint = isThinking ? 0.35 : (viseme.open > 0.6 ? 0.15 : 0);
  const leftEyeCenter = { x: 78 + eyeGaze.x, y: 78 + eyeGaze.y };
  const rightEyeCenter = { x: 122 + eyeGaze.x, y: 78 + eyeGaze.y };

  // Eyebrow lift
  const eyebrowLift = isListening ? -4 : (isThinking ? -2 : (isSpeaking ? Math.sin(Date.now() / 200) * 2 - 1 : 0));

  // Audio level amplification for visual rings
  const activeLevel = isSpeaking ? (viseme.audioLevel || 0.6) : (isListening ? (viseme.micLevel || 0) : 0);

  // Style Color Profiles
  const styleProfiles = {
    [AVATAR_STYLES.MUSE]: {
      skinGradient: ['#141D38', '#0B1124'],
      glowColor: '#06B6D4', // Cyan
      secondaryGlow: '#8B5CF6', // Purple
      eyeColor: '#22D3EE',
      irisRing: '#06B6D4',
      lipColor: '#F472B6',
      accentColor: '#38BDF8',
      haloClasses: 'from-cyan-500/20 via-purple-500/10 to-transparent',
      borderColor: 'border-cyan-500/30'
    },
    [AVATAR_STYLES.AURA]: {
      skinGradient: ['#2A1D38', '#1A1226'],
      glowColor: '#EC4899', // Pink / Rose
      secondaryGlow: '#F59E0B',
      eyeColor: '#F472B6',
      irisRing: '#FB7185',
      lipColor: '#FB7185',
      accentColor: '#F43F5E',
      haloClasses: 'from-pink-500/20 via-rose-500/10 to-transparent',
      borderColor: 'border-pink-500/30'
    },
    [AVATAR_STYLES.CASJOE]: {
      skinGradient: ['#1C1E26', '#0C0D12'],
      glowColor: '#F59E0B', // Amber / Gold
      secondaryGlow: '#D97706',
      eyeColor: '#FBBF24',
      irisRing: '#F59E0B',
      lipColor: '#E2E8F0',
      accentColor: '#F59E0B',
      haloClasses: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'border-amber-500/30'
    },
    [AVATAR_STYLES.HOLO]: {
      skinGradient: ['#0A2540', '#031124'],
      glowColor: '#10B981', // Emerald
      secondaryGlow: '#06B6D4',
      eyeColor: '#34D399',
      irisRing: '#10B981',
      lipColor: '#34D399',
      accentColor: '#10B981',
      haloClasses: 'from-emerald-500/20 via-cyan-500/10 to-transparent',
      borderColor: 'border-emerald-500/30'
    }
  };

  const currentTheme = styleProfiles[avatarStyle] || styleProfiles[AVATAR_STYLES.MUSE];

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      
      {/* ------------------------------------------------------------- */}
      {/* 1. AMBIENT AUDIO AURA & CONCENTRIC RESONANCE RINGS             */}
      {/* ------------------------------------------------------------- */}
      {showAudioRings && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Ring 1 - Immediate aura */}
          <div 
            className="w-72 h-72 rounded-full transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${1 + activeLevel * 0.45})`,
              background: `radial-gradient(circle, ${currentTheme.glowColor}25 0%, transparent 70%)`,
              filter: 'blur(20px)'
            }}
          />

          {/* Ring 2 - Outer pulsed wave */}
          <div 
            className="w-88 h-88 rounded-full border border-dashed transition-all duration-150 ease-out"
            style={{
              borderColor: `${currentTheme.glowColor}${Math.floor((0.15 + activeLevel * 0.35) * 255).toString(16).padStart(2, '0')}`,
              transform: `scale(${1 + activeLevel * 0.3}) rotate(${activeLevel * 45}deg)`,
              opacity: isSpeaking || isListening ? 0.9 : 0.2
            }}
          />

          {/* Ring 3 - Secondary harmonic circle */}
          <div 
            className="w-104 h-104 rounded-full border transition-all duration-200 ease-out"
            style={{
              borderColor: `${currentTheme.secondaryGlow}${Math.floor((0.08 + activeLevel * 0.25) * 255).toString(16).padStart(2, '0')}`,
              transform: `scale(${1 + activeLevel * 0.2})`,
              opacity: isSpeaking ? 0.8 : 0.15
            }}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. THE VECTOR AVATAR CANVAS & ANIMATED SVG FACE               */}
      {/* ------------------------------------------------------------- */}
      <div 
        className="relative z-10 w-64 h-64 md:w-80 md:h-80 flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${headTilt.x}px, ${headTilt.y}px) rotate(${headTilt.rotate}deg)`
        }}
      >
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Ambient Head Gradient */}
            <radialGradient id="headGradient" cx="45%" cy="40%" r="65%">
              <stop offset="0%" stopColor={currentTheme.skinGradient[0]} />
              <stop offset="100%" stopColor={currentTheme.skinGradient[1]} />
            </radialGradient>

            {/* Glowing Eye Gradient */}
            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={currentTheme.eyeColor} />
              <stop offset="80%" stopColor={currentTheme.irisRing} />
              <stop offset="100%" stopColor="#050B14" />
            </radialGradient>

            {/* Neon Rim Light Gradient */}
            <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentTheme.glowColor} stopOpacity="0.8" />
              <stop offset="50%" stopColor="transparent" stopOpacity="0" />
              <stop offset="100%" stopColor={currentTheme.secondaryGlow} stopOpacity="0.7" />
            </linearGradient>

            {/* Mouth Cavity Gradient */}
            <linearGradient id="mouthCavity" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E0B14" />
              <stop offset="50%" stopColor="#3B081E" />
              <stop offset="100%" stopColor="#12050B" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* --- A. Futuristic Collar / Neck Support --- */}
          <path 
            d="M 65 170 C 65 150 135 150 135 170 L 145 200 L 55 200 Z" 
            fill="#080E1C" 
            stroke="#1E293B" 
            strokeWidth="2" 
          />
          <path 
            d="M 80 178 L 120 178" 
            stroke={currentTheme.glowColor} 
            strokeWidth="2" 
            strokeLinecap="round"
            filter="url(#neonBlur)"
            opacity="0.85"
          />

          {/* --- B. Head Base & Cyber Contours --- */}
          {/* Main Stylized Head Shape */}
          <ellipse 
            cx="100" 
            cy="95" 
            rx="52" 
            ry="62" 
            fill="url(#headGradient)" 
            stroke="url(#rimLight)" 
            strokeWidth="2.5" 
          />

          {/* Subtle Cyber Accents / Temple Markings */}
          <path 
            d="M 52 82 L 48 94 L 54 98" 
            stroke={currentTheme.glowColor} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.6" 
          />
          <path 
            d="M 148 82 L 152 94 L 146 98" 
            stroke={currentTheme.glowColor} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.6" 
          />

          {/* --- C. Eyebrows (Dynamic Angle & Lift) --- */}
          {/* Left Eyebrow */}
          <path 
            d={`M 66 ${62 + eyebrowLift} Q 78 ${58 + eyebrowLift} 90 ${64 + eyebrowLift}`} 
            stroke="#94A3B8" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            fill="none" 
          />
          {/* Right Eyebrow */}
          <path 
            d={`M 110 ${64 + eyebrowLift} Q 122 ${58 + eyebrowLift} 134 ${62 + eyebrowLift}`} 
            stroke="#94A3B8" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            fill="none" 
          />

          {/* --- D. Eyes (Animated Gaze, Blinking & Glow) --- */}
          {/* Left Eye Sockets */}
          <g transform={`translate(${leftEyeCenter.x}, ${leftEyeCenter.y})`}>
            {/* Eye Sclera / Base */}
            <ellipse 
              cx="0" 
              cy="0" 
              rx="12" 
              ry={isBlinking ? 1 : (10 * (1 - eyeSquint))} 
              fill="#060C18" 
              stroke="#334155" 
              strokeWidth="1.2" 
            />
            {/* Glowing Iris */}
            {!isBlinking && (
              <>
                <circle cx="0" cy="0" r="6" fill="url(#eyeGlow)" />
                <circle cx="0" cy="0" r="3" fill="#020617" />
                {/* Catchlight */}
                <circle cx="-2" cy="-2.5" r="1.5" fill="#FFFFFF" opacity="0.9" />
              </>
            )}
          </g>

          {/* Right Eye Sockets */}
          <g transform={`translate(${rightEyeCenter.x}, ${rightEyeCenter.y})`}>
            {/* Eye Sclera / Base */}
            <ellipse 
              cx="0" 
              cy="0" 
              rx="12" 
              ry={isBlinking ? 1 : (10 * (1 - eyeSquint))} 
              fill="#060C18" 
              stroke="#334155" 
              strokeWidth="1.2" 
            />
            {/* Glowing Iris */}
            {!isBlinking && (
              <>
                <circle cx="0" cy="0" r="6" fill="url(#eyeGlow)" />
                <circle cx="0" cy="0" r="3" fill="#020617" />
                {/* Catchlight */}
                <circle cx="-2" cy="-2.5" r="1.5" fill="#FFFFFF" opacity="0.9" />
              </>
            )}
          </g>

          {/* --- E. Stylized Nose Bridge --- */}
          <path 
            d="M 100 88 L 98 106 L 104 107" 
            stroke="#475569" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
            opacity="0.6"
          />

          {/* --- F. DYNAMIC LIP-SYNCHRONIZED MOUTH ENGINE --- */}
          <g>
            {/* 1. Inner Mouth Cavity (Rendered when mouth is open) */}
            {openHeight > 2 && (
              <path 
                d={innerCavityPath} 
                fill="url(#mouthCavity)" 
                stroke="#4C0519" 
                strokeWidth="1" 
              />
            )}

            {/* 2. Tongue (Visible during wide vowels) */}
            {tonguePath && (
              <path 
                d={tonguePath} 
                fill="#BE123C" 
                opacity="0.85" 
              />
            )}

            {/* 3. Upper Teeth (Visible during A, E, S, F phonemes) */}
            {teethPath && (
              <path 
                d={teethPath} 
                fill="#F8FAFC" 
                stroke="#CBD5E1" 
                strokeWidth="0.5" 
              />
            )}

            {/* 4. Upper Lip Line / Bow */}
            <path 
              d={upperLipPath} 
              stroke={openHeight > 3 ? '#FDA4AF' : currentTheme.lipColor} 
              strokeWidth={openHeight > 3 ? '2.5' : '3'} 
              strokeLinecap="round" 
              fill="none" 
            />

            {/* 5. Lower Lip / Jaw Line (moves dynamically with speech volume) */}
            <path 
              d={lowerLipOutlinePath} 
              stroke={currentTheme.lipColor} 
              strokeWidth={openHeight > 3 ? '2.5' : '3'} 
              strokeLinecap="round" 
              fill="none" 
            />
          </g>

          {/* Subtle Cheek Shimmer / Blush on speech */}
          {openHeight > 5 && (
            <>
              <circle cx="64" cy="112" r="8" fill="#F43F5E" opacity="0.12" filter="url(#neonBlur)" />
              <circle cx="136" cy="112" r="8" fill="#F43F5E" opacity="0.12" filter="url(#neonBlur)" />
            </>
          )}
        </svg>

        {/* Live Audio Ripple Bars directly beneath chin during speech */}
        {isSpeaking && (
          <div className="absolute -bottom-2 flex items-center justify-center gap-1">
            {[0.4, 0.8, 1.0, 0.7, 0.5].map((scale, i) => (
              <div
                key={i}
                className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(4, (viseme.open * 22 * scale))}px`,
                  opacity: 0.7 + (viseme.open * 0.3)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. REAL-TIME INTERACTION STATUS PILL                          */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
          isSpeaking 
            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' 
            : isListening 
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
              : isThinking 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
        }`}>
          {/* Status Dot */}
          <span className={`w-2 h-2 rounded-full ${
            isSpeaking 
              ? 'bg-cyan-400 animate-ping' 
              : isListening 
                ? 'bg-emerald-400 animate-pulse' 
                : isThinking 
                  ? 'bg-amber-400 animate-bounce' 
                  : 'bg-slate-500'
          }`} />

          <span>
            {customStatus || (
              isSpeaking 
                ? 'Muse Speaking...' 
                : isListening 
                  ? 'Listening to you...' 
                  : isThinking 
                    ? 'Thinking...' 
                    : 'Muse Ready'
            )}
          </span>

          {/* Subtitle / Phoneme indicator if speaking */}
          {isSpeaking && viseme.visemeName !== 'REST' && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              {viseme.visemeName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
