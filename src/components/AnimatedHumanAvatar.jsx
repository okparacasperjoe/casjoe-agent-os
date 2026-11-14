import React, { useState, useEffect, useRef } from 'react';
import { lipSyncEngine, VISEMES } from '../services/lipSyncEngine';
import elenaImg from '../assets/avatars/elena.jpg';
import marcusImg from '../assets/avatars/marcus.jpg';
import sophiaImg from '../assets/avatars/sophia.jpg';
import { User, Sparkles, Volume2 } from 'lucide-react';

export const HUMAN_AVATAR_PRESETS = {
  ELENA: {
    id: 'elena',
    name: 'Elena',
    title: 'Executive Advisor',
    image: elenaImg,
    voiceTone: 'elena',
    // Landmarks on the portrait (% of container)
    mouth: { top: '58.8%', left: '50%', width: '15.5%' },
    eyes: { top: '40.5%', leftLeft: '44%', rightLeft: '56%' },
    lipColor: '#C45757',
    skinTone: '#E4A48D',
    borderGlow: 'rgba(236, 72, 153, 0.4)'
  },
  MARCUS: {
    id: 'marcus',
    name: 'Marcus',
    title: 'Enterprise Strategist',
    image: marcusImg,
    voiceTone: 'marcus',
    mouth: { top: '56.0%', left: '50.2%', width: '16.2%' },
    eyes: { top: '39.0%', leftLeft: '43.5%', rightLeft: '56.5%' },
    lipColor: '#A85348',
    skinTone: '#BD8062',
    borderGlow: 'rgba(59, 130, 246, 0.4)'
  },
  SOPHIA: {
    id: 'sophia',
    name: 'Sophia',
    title: 'Growth & Automation Lead',
    image: sophiaImg,
    voiceTone: 'sophia',
    mouth: { top: '56.5%', left: '50.0%', width: '15.2%' },
    eyes: { top: '39.8%', leftLeft: '44.0%', rightLeft: '56.0%' },
    lipColor: '#C95C60',
    skinTone: '#EAC0A6',
    borderGlow: 'rgba(16, 185, 129, 0.4)'
  }
};

export default function AnimatedHumanAvatar({
  avatarId = 'elena',
  customImage = null,
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  showRings = true,
  className = ''
}) {
  const avatar = HUMAN_AVATAR_PRESETS[avatarId?.toUpperCase()] || HUMAN_AVATAR_PRESETS.ELENA;
  const imageSource = customImage || avatar.image;

  // Real-time viseme physics from lipSyncEngine
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

  // Natural human micro-movements
  const [isBlinking, setIsBlinking] = useState(false);
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0, rotate: 0 });
  const blinkTimerRef = useRef(null);

  // Subscribe to real-time audio viseme engine
  useEffect(() => {
    const unsub = lipSyncEngine.subscribe((state) => {
      setViseme(state);
    });
    return () => unsub();
  }, []);

  // Natural human blinking cycle (every 3.5 to 5.5 seconds)
  useEffect(() => {
    let active = true;
    const scheduleNextBlink = () => {
      const delay = 3200 + Math.random() * 2600;
      blinkTimerRef.current = setTimeout(() => {
        if (!active) return;
        setIsBlinking(true);
        setTimeout(() => {
          if (!active) return;
          setIsBlinking(false);
          scheduleNextBlink();
        }, 130);
      }, delay);
    };

    scheduleNextBlink();
    return () => {
      active = false;
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Natural breathing oscillation and speech nodding
  useEffect(() => {
    let active = true;
    const interval = setInterval(() => {
      if (!active) return;

      if (isSpeaking) {
        // Natural speech nodding & micro-gestures
        const nod = Math.sin(Date.now() / 190) * 2.2;
        const sway = Math.cos(Date.now() / 340) * 1.2;
        setHeadTilt({ x: sway, y: nod, rotate: sway * 0.28 });
      } else if (isListening) {
        // Engaging forward focus
        setHeadTilt({ x: 0, y: 1.5, rotate: -0.4 });
      } else if (isThinking) {
        // Thoughtful upward gaze
        setHeadTilt({ x: 1.5, y: -2.5, rotate: 1.2 });
      } else {
        // Gentle organic breathing float
        const t = Date.now() / 1600;
        setHeadTilt({
          x: Math.cos(t) * 1.0,
          y: Math.sin(t) * 1.8,
          rotate: Math.sin(t * 0.5) * 0.4
        });
      }
    }, 70);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isSpeaking, isListening, isThinking]);

  // Derived mouth kinematics
  const openHeightPx = Math.max(0, Math.min(22, viseme.open * 22)); // Max 22px open
  const widthScale = Math.max(0.75, Math.min(1.35, viseme.width));
  const roundScale = Math.max(0, Math.min(1, viseme.round));
  const chinDisplacement = openHeightPx * 0.22; // Natural human jaw drop

  const activeLevel = isSpeaking ? (viseme.audioLevel || 0.6) : (isListening ? (viseme.micLevel || 0) : 0);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      
      {/* ------------------------------------------------------------- */}
      {/* 1. AMBIENT STUDIO AURA & SOUNDWAVE RINGS                      */}
      {/* ------------------------------------------------------------- */}
      {showRings && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Subtle audio glow */}
          <div 
            className="w-80 h-80 rounded-full transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${1 + activeLevel * 0.35})`,
              background: `radial-gradient(circle, ${avatar.borderGlow} 0%, transparent 70%)`,
              filter: 'blur(28px)'
            }}
          />

          {/* Outer pulsed ring */}
          <div 
            className="w-96 h-96 rounded-full border border-dashed transition-all duration-150 ease-out"
            style={{
              borderColor: `${avatar.borderGlow}`,
              transform: `scale(${1 + activeLevel * 0.2}) rotate(${activeLevel * 30}deg)`,
              opacity: isSpeaking || isListening ? 0.7 : 0.15
            }}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. THE PHOTOREALISTIC HUMAN PORTRAIT STAGE                   */}
      {/* ------------------------------------------------------------- */}
      <div 
        className="relative z-10 w-72 h-88 sm:w-80 sm:h-96 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 bg-slate-950 transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${headTilt.x}px, ${headTilt.y}px) rotate(${headTilt.rotate}deg)`
        }}
      >
        {/* Base Human Portrait Photo */}
        <img
          src={imageSource}
          alt={avatar.name}
          className="w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Soft Vignette & Studio Lighting Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* ----------------------------------------------------------- */}
        {/* 3. DYNAMIC PHOTOREALISTIC LIP-SYNCHRONIZING MOUTH MESH       */}
        {/* ----------------------------------------------------------- */}
        <div
          className="absolute pointer-events-none transition-transform duration-75"
          style={{
            top: avatar.mouth.top,
            left: avatar.mouth.left,
            width: avatar.mouth.width,
            transform: `translate(-50%, -50%) translateY(${chinDisplacement}px)`
          }}
        >
          {/* Feathered Lip-Sync SVG Compositor */}
          <svg
            viewBox="0 0 100 60"
            className="w-full h-auto overflow-visible"
            style={{
              // Feather edges so it blends seamlessly into the human skin
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))'
            }}
          >
            <defs>
              {/* Inner oral cavity shadow */}
              <radialGradient id="humanOralCavity" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#1E050B" />
                <stop offset="60%" stopColor="#380918" />
                <stop offset="100%" stopColor="#0F0206" />
              </radialGradient>

              {/* Upper dental translucency */}
              <linearGradient id="humanTeeth" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#F1F5F9" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>

              {/* Lip Skin Texture & Specular Highlight */}
              <linearGradient id="humanLipShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={avatar.lipColor} stopOpacity="0.95" />
                <stop offset="50%" stopColor="#FDA4AF" stopOpacity="0.4" />
                <stop offset="100%" stopColor={avatar.lipColor} stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* A. Inner Mouth Cavity (Revealed when speaking) */}
            {openHeightPx > 1.5 && (
              <ellipse
                cx="50"
                cy="30"
                rx={Math.max(14, 26 * widthScale * (1 - roundScale * 0.3))}
                ry={Math.max(2, openHeightPx * 0.9)}
                fill="url(#humanOralCavity)"
              />
            )}

            {/* B. Natural Upper Teeth Arch */}
            {(viseme.teeth || openHeightPx > 3) && (
              <path
                d={`M ${50 - 18 * widthScale} 29 Q 50 ${29 - openHeightPx * 0.15} ${50 + 18 * widthScale} 29 L ${50 + 15 * widthScale} ${29 + Math.min(openHeightPx * 0.45, 6)} Q 50 ${29 + Math.min(openHeightPx * 0.45, 6) + 1} ${50 - 15 * widthScale} ${29 + Math.min(openHeightPx * 0.45, 6)} Z`}
                fill="url(#humanTeeth)"
                opacity="0.92"
              />
            )}

            {/* C. Tongue Contour during wide vowels */}
            {(viseme.tongue || openHeightPx > 11) && (
              <path
                d={`M ${50 - 14 * widthScale} ${30 + openHeightPx * 0.6} Q 50 ${30 + openHeightPx * 0.15} ${50 + 14 * widthScale} ${30 + openHeightPx * 0.6} Z`}
                fill="#BE123C"
                opacity="0.85"
              />
            )}

            {/* D. Upper Lip Vermilion Border & Cupid's Bow */}
            <path
              d={`M ${50 - 28 * widthScale} 30 Q ${50 - 12} ${26 - roundScale * 2} 50 ${28 - openHeightPx * 0.15} Q ${50 + 12} ${26 - roundScale * 2} ${50 + 28 * widthScale} 30`}
              stroke={avatar.lipColor}
              strokeWidth={openHeightPx > 3 ? '3.5' : '4'}
              strokeLinecap="round"
              fill="none"
              opacity="0.95"
            />

            {/* E. Lower Lip Vermilion (moves dynamically down with jaw) */}
            <path
              d={`M ${50 - 28 * widthScale} 30 Q 50 ${32 + openHeightPx * 0.95} ${50 + 28 * widthScale} 30`}
              stroke="url(#humanLipShine)"
              strokeWidth={openHeightPx > 3 ? '4.5' : '4'}
              strokeLinecap="round"
              fill="none"
              opacity="0.95"
            />
          </svg>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* 4. REALISTIC EYE BLINK OVERLAY                              */}
        {/* ----------------------------------------------------------- */}
        {isBlinking && (
          <div 
            className="absolute pointer-events-none inset-x-0 h-4 bg-gradient-to-b from-black/20 via-black/40 to-transparent"
            style={{
              top: avatar.eyes.top,
              backdropFilter: 'blur(3px)'
            }}
          />
        )}

        {/* ----------------------------------------------------------- */}
        {/* 5. PRESENTER INFO OVERLAY (SUBTLE HUD)                      */}
        {/* ----------------------------------------------------------- */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white shadow-lg">
          <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
          <span>{avatar.name}</span>
          <span className="text-slate-400 text-[9px] font-normal">• {avatar.title}</span>
        </div>

        {/* Live Audio Visualizer Bars at the bottom of the portrait */}
        {isSpeaking && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1 pointer-events-none">
            {[0.3, 0.7, 1.0, 0.8, 0.4].map((scale, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-cyan-400 to-emerald-400 rounded-full transition-all duration-75 shadow-sm"
                style={{
                  height: `${Math.max(4, viseme.open * 20 * scale)}px`,
                  opacity: 0.75 + (viseme.open * 0.25)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. STATUS PILL WITH LIVE VISEME PHONEME BADGE                 */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-3.5 flex items-center gap-2">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-md ${
          isSpeaking 
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
            : isListening 
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' 
              : isThinking 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isSpeaking ? 'bg-emerald-400 animate-ping' : isListening ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'
          }`} />

          <span>
            {isSpeaking 
              ? `${avatar.name} Speaking...` 
              : isListening 
                ? 'Listening to you...' 
                : isThinking 
                  ? 'Thinking...' 
                  : `${avatar.name} Ready`}
          </span>

          {isSpeaking && viseme.visemeName !== 'REST' && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              {viseme.visemeName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
