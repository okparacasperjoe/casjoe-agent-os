/**
 * Casjoe Agent OS - Enhanced Lip Sync & Natural Voice Tone Engine
 * Real-time speech audio analysis, photorealistic human viseme kinematics,
 * natural voice tone presets, neural voice auto-selection, and speech text smoothing.
 */

// Voice Tone Presets for Human Avatars
export const VOICE_TONES = {
  ELENA: {
    id: 'elena',
    name: 'Elena (Warm & Conversational)',
    gender: 'female',
    pitch: 1.02,
    rate: 0.98,
    avatarId: 'elena',
    keywords: ['Jenny', 'Aria', 'Michelle', 'Google US English', 'Samantha', 'Zira', 'Natural', 'Female'],
    sampleText: "Hello Casper! I'm Elena, your warm and natural AI companion. How can I help you today?",
    description: 'Empathetic, clear, and natural human conversational cadence'
  },
  MARCUS: {
    id: 'marcus',
    name: 'Marcus (Executive & Confident)',
    gender: 'male',
    pitch: 0.88,
    rate: 0.95,
    avatarId: 'marcus',
    keywords: ['Guy', 'Christopher', 'Eric', 'David', 'Google US English Male', 'Mark', 'Natural', 'Male'],
    sampleText: "Good day Casper. Marcus here. Ready to review your missions, leads, and business operations.",
    description: 'Deep, resonant, authoritative corporate executive tone'
  },
  SOPHIA: {
    id: 'sophia',
    name: 'Sophia (Bright & Friendly)',
    gender: 'female',
    pitch: 1.08,
    rate: 1.02,
    avatarId: 'sophia',
    keywords: ['Aria', 'Jenny', 'Google UK English Female', 'Victoria', 'Samantha'],
    sampleText: "Hi there! I'm Sophia. Excited to automate your workflows and find high-quality leads!",
    description: 'Energetic, modern, engaging conversational advisor'
  },
  DAVID: {
    id: 'david',
    name: 'David (Calm & Articulate)',
    gender: 'male',
    pitch: 0.94,
    rate: 0.97,
    avatarId: 'david',
    keywords: ['Steffan', 'Guy', 'Roger', 'David', 'Google US English'],
    sampleText: "Hello. David speaking. Standing by with accurate analysis and smooth task orchestration.",
    description: 'Balanced, articulate, and thoughtful executive advisor'
  },
  VICTORIA: {
    id: 'victoria',
    name: 'Victoria (British RP Refined)',
    gender: 'female',
    pitch: 1.00,
    rate: 0.97,
    avatarId: 'elena',
    keywords: ['Sonia', 'Libby', 'Maisie', 'Google UK English Female', 'Hazel', 'Susan', 'UK English'],
    sampleText: "Greetings Casper. Victoria here, ready to assist with your executive affairs with utmost precision.",
    description: 'Refined British accent with articulate pacing'
  }
};

// Standard Viseme targets
export const VISEMES = {
  REST: { open: 0.02, width: 1.0, round: 0.05, teeth: false, tongue: false, name: 'REST' },
  A_AH: { open: 0.85, width: 1.05, round: 0.35, teeth: true, tongue: false, name: 'A_AH' },
  E_EE: { open: 0.35, width: 1.35, round: 0.05, teeth: true, tongue: false, name: 'E_EE' },
  I_IH: { open: 0.45, width: 1.20, round: 0.10, teeth: true, tongue: false, name: 'I_IH' },
  O_OH: { open: 0.70, width: 0.70, round: 0.85, teeth: false, tongue: false, name: 'O_OH' },
  U_OO: { open: 0.35, width: 0.50, round: 1.00, teeth: false, tongue: false, name: 'U_OO' },
  M_B_P: { open: 0.00, width: 0.95, round: 0.00, teeth: false, tongue: false, name: 'M_B_P' },
  F_V: { open: 0.15, width: 1.10, round: 0.10, teeth: true, tongue: false, name: 'F_V' },
  TH_L: { open: 0.30, width: 1.05, round: 0.10, teeth: true, tongue: true, name: 'TH_L' },
  S_Z: { open: 0.15, width: 1.15, round: 0.05, teeth: true, tongue: false, name: 'S_Z' },
  SMILE: { open: 0.10, width: 1.25, round: 0.00, teeth: true, tongue: false, name: 'SMILE' }
};

// Map letters / phonemes to viseme targets
export function charToViseme(char) {
  const c = char.toLowerCase();
  if ('ae'.includes(c)) return VISEMES.A_AH;
  if ('iy'.includes(c)) return VISEMES.E_EE;
  if ('o'.includes(c)) return VISEMES.O_OH;
  if ('uüw'.includes(c)) return VISEMES.U_OO;
  if ('mbp'.includes(c)) return VISEMES.M_B_P;
  if ('fv'.includes(c)) return VISEMES.F_V;
  if ('tl'.includes(c)) return VISEMES.TH_L;
  if ('szcx'.includes(c)) return VISEMES.S_Z;
  if (' ,.!?'.includes(c)) return VISEMES.REST;
  return VISEMES.I_IH;
}

/**
 * Pre-processes LLM text into natural, smooth human conversational speech:
 * - Strips markdown symbols, code, brackets, and raw URLs
 * - Expands currency ($100 -> "100 dollars") and percentages
 * - Expands tech/business shorthand (e.g. -> "for example")
 * - Adds natural breathing pauses at punctuation marks
 */
export function cleanTextForNaturalSpeech(text) {
  if (!text) return '';
  let s = String(text);

  // 1. Strip Markdown links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // 2. Strip code blocks and inline code
  s = s.replace(/```[\s\S]*?```/g, '');
  s = s.replace(/`([^`]+)`/g, '$1');
  // 3. Strip headers, bullets, markdown asterisks, bold/italics
  s = s.replace(/^[#*>-]+\s+/gm, '');
  s = s.replace(/[*_~#]/g, '');
  // 4. Strip raw URLs
  s = s.replace(/https?:\/\/\S+/gi, 'the link');
  // 5. Replace currencies with natural spoken words
  s = s.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)/g, '$1 dollars');
  s = s.replace(/€(\d+(?:,\d+)*(?:\.\d+)?)/g, '$1 euros');
  s = s.replace(/£(\d+(?:,\d+)*(?:\.\d+)?)/g, '$1 pounds');
  s = s.replace(/\b(\d+)%/g, '$1 percent');
  // 6. Replace symbols
  s = s.replace(/&/g, ' and ');
  s = s.replace(/\+/g, ' plus ');
  s = s.replace(/@/g, ' at ');
  // 7. Expand common conversational abbreviations
  s = s.replace(/\be\.g\.,?\b/gi, 'for example, ');
  s = s.replace(/\bi\.e\.,?\b/gi, 'that is, ');
  s = s.replace(/\bvs\.?\b/gi, 'versus');
  s = s.replace(/\betc\.?\b/gi, 'and so on');
  s = s.replace(/\bapprox\.?\b/gi, 'approximately');
  s = s.replace(/\bw\/\b/gi, 'with');
  // 8. Natural cadence pacing: add micro-spaces around sentence stops
  s = s.replace(/([.!?])\s+/g, '$1  ');
  s = s.replace(/([,;:])\s+/g, '$1 ');

  return s.trim();
}

export class LipSyncEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.micAnalyser = null;
    this.micStream = null;
    this.dataArray = null;
    this.micDataArray = null;
    
    this.isSpeaking = false;
    this.isListening = false;
    this.speechUtterance = null;
    
    // Voice preferences
    this.selectedToneId = localStorage.getItem('casjoe_voice_tone') || 'elena';
    this.customPitch = parseFloat(localStorage.getItem('casjoe_voice_pitch') || '1.0');
    this.customRate = parseFloat(localStorage.getItem('casjoe_voice_rate') || '1.0');
    this.selectedVoiceName = localStorage.getItem('casjoe_voice_name') || '';

    // Current interpolated state
    this.current = {
      open: 0.02,
      width: 1.0,
      round: 0.05,
      teeth: false,
      tongue: false,
      audioLevel: 0,
      micLevel: 0,
      visemeName: 'REST'
    };
    
    // Target state driven by speech / audio
    this.target = { ...VISEMES.REST, audioLevel: 0 };
    
    this.listeners = new Set();
    this.animFrameId = null;
    this.syllableTimer = null;
    this.carrierOsc = null;
    this.carrierGain = null;
    
    this.startAnimationLoop();
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.5;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  // Connect microphone for live user audio meter
  async startMicMonitoring() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micStream = stream;
      const source = ctx.createMediaStreamSource(stream);
      this.micAnalyser = ctx.createAnalyser();
      this.micAnalyser.fftSize = 128;
      this.micAnalyser.smoothingTimeConstant = 0.4;
      this.micDataArray = new Uint8Array(this.micAnalyser.frequencyBinCount);
      source.connect(this.micAnalyser);
      this.isListening = true;
    } catch (err) {
      console.warn('Microphone monitoring could not start:', err);
    }
  }

  stopMicMonitoring() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    this.micAnalyser = null;
    this.isListening = false;
  }

  // Interpolation loop running at 60fps
  startAnimationLoop() {
    const loop = () => {
      this.updatePhysics();
      this.notifyListeners();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  updatePhysics() {
    // 1. Read Mic Level if monitoring
    if (this.micAnalyser && this.micDataArray) {
      this.micAnalyser.getByteFrequencyData(this.micDataArray);
      let sum = 0;
      for (let i = 0; i < this.micDataArray.length; i++) {
        sum += this.micDataArray[i];
      }
      const avg = sum / this.micDataArray.length;
      this.current.micLevel = avg / 128; // 0.0 to 1.0+
    } else {
      this.current.micLevel = 0;
    }

    // 2. Smoothly interpolate mouth physics towards target
    const ease = this.isSpeaking ? 0.32 : 0.16; // Organic speech articulation

    this.current.open += (this.target.open - this.current.open) * ease;
    this.current.width += (this.target.width - this.current.width) * ease;
    this.current.round += (this.target.round - this.current.round) * ease;
    this.current.audioLevel += (this.target.audioLevel - this.current.audioLevel) * 0.25;

    this.current.teeth = this.target.teeth;
    this.current.tongue = this.target.tongue;
    this.current.visemeName = this.target.name || 'REST';
    this.current.isSpeaking = this.isSpeaking;
  }

  notifyListeners() {
    for (const cb of this.listeners) {
      cb({ ...this.current });
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Generate real-time synthetic carrier tone for visualizer FFT
  startAudioCarrier() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx || !this.analyser) return;

      this.stopAudioCarrier();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.analyser);
      osc.start();

      this.carrierOsc = osc;
      this.carrierGain = gain;
    } catch {}
  }

  stopAudioCarrier() {
    if (this.carrierOsc) {
      try {
        this.carrierOsc.stop();
        this.carrierOsc.disconnect();
      } catch {}
      this.carrierOsc = null;
    }
    if (this.carrierGain) {
      try {
        this.carrierGain.disconnect();
      } catch {}
      this.carrierGain = null;
    }
  }

  /**
   * Retrieves all available speech synthesis voices, prioritized by Natural/Neural quality
   */
  getAvailableVoices() {
    if (!window.speechSynthesis) return [];
    const voices = window.speechSynthesis.getVoices() || [];
    
    // Categorize and sort: Natural/Online/Neural first, then Google, then Apple/SAPI
    return [...voices].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aScore = (aName.includes('natural') || aName.includes('neural') || aName.includes('online')) ? 3 :
                     (aName.includes('google')) ? 2 : 1;
      const bScore = (bName.includes('natural') || bName.includes('neural') || bName.includes('online')) ? 3 :
                     (bName.includes('google')) ? 2 : 1;
      return bScore - aScore;
    });
  }

  /**
   * Intelligently selects the best sounding voice for a given Voice Tone preset
   */
  findBestVoiceForTone(toneId, overrideVoiceName = null) {
    const voices = this.getAvailableVoices();
    if (voices.length === 0) return null;

    // 1. Explicit user override
    if (overrideVoiceName) {
      const matched = voices.find(v => v.name.toLowerCase() === overrideVoiceName.toLowerCase());
      if (matched) return matched;
    }

    const preset = VOICE_TONES[toneId?.toUpperCase()] || VOICE_TONES.ELENA;
    const keywords = preset.keywords || [];

    // 2. Look for Natural/Neural voices matching keywords first
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      const naturalMatch = voices.find(v => {
        const n = v.name.toLowerCase();
        return n.includes(kwLower) && (n.includes('natural') || n.includes('neural') || n.includes('online'));
      });
      if (naturalMatch) return naturalMatch;
    }

    // 3. Look for standard voices matching keywords
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      const match = voices.find(v => v.name.toLowerCase().includes(kwLower));
      if (match) return match;
    }

    // 4. Look for any English Natural voice
    const englishNatural = voices.find(v => {
      const n = v.name.toLowerCase();
      return (v.lang.startsWith('en') && (n.includes('natural') || n.includes('neural') || n.includes('online')));
    });
    if (englishNatural) return englishNatural;

    // 5. Fallback to any English voice
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  /**
   * Set and persist active voice tone
   */
  setVoiceTone(toneId) {
    this.selectedToneId = toneId;
    localStorage.setItem('casjoe_voice_tone', toneId);
  }

  setCustomPitch(pitch) {
    this.customPitch = pitch;
    localStorage.setItem('casjoe_voice_pitch', String(pitch));
  }

  setCustomRate(rate) {
    this.customRate = rate;
    localStorage.setItem('casjoe_voice_rate', String(rate));
  }

  setSelectedVoiceName(voiceName) {
    this.selectedVoiceName = voiceName;
    localStorage.setItem('casjoe_voice_name', voiceName);
  }

  /**
   * Speaks the provided text using SpeechSynthesis with synchronized lip visemes
   * @param {string} text - Spoken dialogue
   * @param {object} options - { toneId, rate, pitch, voiceName, onStart, onEnd }
   * @returns {Promise<void>}
   */
  async speak(text, options = {}) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        console.warn('SpeechSynthesis not supported');
        resolve();
        return;
      }

      this.stop(); // Stop ongoing speech

      const cleanText = cleanTextForNaturalSpeech(text);
      if (!cleanText) {
        resolve();
        return;
      }

      this.isSpeaking = true;
      this.startAudioCarrier();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.speechUtterance = utterance;

      const toneId = options.toneId || this.selectedToneId || 'elena';
      const preset = VOICE_TONES[toneId?.toUpperCase()] || VOICE_TONES.ELENA;

      // Rate and Pitch calculation (balanced for organic human cadence)
      utterance.rate = options.rate || (preset.rate * this.customRate) || 0.98;
      utterance.pitch = options.pitch || (preset.pitch * this.customPitch) || 1.0;

      // Select voice
      const chosenVoice = this.findBestVoiceForTone(
        toneId, 
        options.voiceName || this.selectedVoiceName
      );
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      // Syllable boundary detection
      const words = cleanText.split(/\s+/);
      let wordIndex = 0;

      utterance.onboundary = (e) => {
        if (e.name === 'word' || e.charIndex !== undefined) {
          const charIndex = e.charIndex || 0;
          const word = words[wordIndex] || cleanText.substr(charIndex, 8);
          wordIndex++;
          this.triggerWordVisemes(word);
        }
      };

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (options.onStart) options.onStart();
        this.startPhonemeSequence(cleanText);
      };

      const finish = () => {
        this.isSpeaking = false;
        this.target = { ...VISEMES.REST, audioLevel: 0 };
        this.stopAudioCarrier();
        if (this.syllableTimer) clearInterval(this.syllableTimer);
        this.speechUtterance = null;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      window.speechSynthesis.speak(utterance);
    });
  }

  // Trigger expressive syllable visemes throughout words
  triggerWordVisemes(word) {
    if (!word || !this.isSpeaking) return;
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) return;

    let chosenViseme = VISEMES.A_AH;
    for (const c of clean) {
      if ('o'.includes(c)) { chosenViseme = VISEMES.O_OH; break; }
      if ('u'.includes(c)) { chosenViseme = VISEMES.U_OO; break; }
      if ('eiy'.includes(c)) { chosenViseme = VISEMES.E_EE; break; }
      if ('a'.includes(c)) { chosenViseme = VISEMES.A_AH; break; }
      if ('mbp'.includes(c)) { chosenViseme = VISEMES.M_B_P; break; }
      if ('fv'.includes(c)) { chosenViseme = VISEMES.F_V; break; }
    }

    const amp = 0.55 + Math.random() * 0.45;
    this.target = {
      ...chosenViseme,
      open: chosenViseme.open * amp,
      audioLevel: amp
    };
  }

  startPhonemeSequence(text) {
    if (this.syllableTimer) clearInterval(this.syllableTimer);

    const visemeSequence = [
      VISEMES.A_AH,
      VISEMES.E_EE,
      VISEMES.O_OH,
      VISEMES.S_Z,
      VISEMES.I_IH,
      VISEMES.M_B_P,
      VISEMES.U_OO,
      VISEMES.TH_L
    ];

    let idx = 0;
    this.syllableTimer = setInterval(() => {
      if (!this.isSpeaking) {
        clearInterval(this.syllableTimer);
        this.target = { ...VISEMES.REST, audioLevel: 0 };
        return;
      }

      // Organic consonant breath pauses
      if (Math.random() < 0.12) {
        this.target = { ...VISEMES.M_B_P, open: 0.04, audioLevel: 0.2 };
        return;
      }

      idx = (idx + 1) % visemeSequence.length;
      const base = visemeSequence[idx];
      const variance = 0.65 + Math.random() * 0.35;

      this.target = {
        ...base,
        open: base.open * variance,
        width: base.width * (0.95 + Math.random() * 0.1),
        audioLevel: variance
      };
    }, 130);
  }

  stop() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.syllableTimer) {
      clearInterval(this.syllableTimer);
      this.syllableTimer = null;
    }
    this.stopAudioCarrier();
    this.isSpeaking = false;
    this.target = { ...VISEMES.REST, audioLevel: 0 };
  }

  destroy() {
    this.stop();
    this.stopMicMonitoring();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const lipSyncEngine = new LipSyncEngine();
