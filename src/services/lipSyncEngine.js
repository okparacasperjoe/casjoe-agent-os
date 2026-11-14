/**
 * Casjoe Agent OS - Lip Sync & Audio Viseme Engine
 * Real-time speech audio analysis and phoneme-to-viseme mapping for animated AI avatars.
 * Supports Web Audio FFT frequency analysis, TTS boundary hooks, and smooth spring physics.
 */

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
    const ease = this.isSpeaking ? 0.28 : 0.15; // Snappy speech response, smooth rest settle

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

      // Low volume carrier tone purely to feed the FFT analyser and visualizer
      gain.gain.setValueAtTime(0.015, ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.analyser);
      // We don't connect gain to ctx.destination to avoid hearing the synth tone over TTS
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
   * Speaks the provided text using SpeechSynthesis with synchronized lip visemes
   * @param {string} text - Spoken dialogue
   * @param {object} options - { rate, pitch, voiceName, onStart, onEnd }
   * @returns {Promise<void>}
   */
  async speak(text, options = {}) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        console.warn('SpeechSynthesis not supported');
        resolve();
        return;
      }

      this.stop(); // Stop any ongoing speech

      const cleanText = text.replace(/[*#_`]/g, '').trim();
      if (!cleanText) {
        resolve();
        return;
      }

      this.isSpeaking = true;
      this.startAudioCarrier();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.speechUtterance = utterance;

      utterance.rate = options.rate || 1.05;
      utterance.pitch = options.pitch || 1.0;

      // Select best voice (prefer natural English)
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find(v => 
          (options.voiceName && v.name.toLowerCase().includes(options.voiceName.toLowerCase())) ||
          v.name.includes('Natural') ||
          v.name.includes('Google US English') ||
          v.name.includes('Samantha') ||
          v.name.includes('David') ||
          v.lang.startsWith('en')
        );
        if (preferred) utterance.voice = preferred;
      }

      // Word-by-word syllable timing simulation
      const words = cleanText.split(/\s+/);
      let wordIndex = 0;
      let charIndex = 0;

      // Real boundary event from speech synthesis
      utterance.onboundary = (e) => {
        if (e.name === 'word' || e.charIndex !== undefined) {
          charIndex = e.charIndex || 0;
          const word = words[wordIndex] || cleanText.substr(charIndex, 8);
          wordIndex++;
          this.triggerWordVisemes(word);
        }
      };

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (options.onStart) options.onStart();
        // Start rhythmic phoneme generator to cover continuous speech
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

    // Pick primary vowel or consonant in word
    let chosenViseme = VISEMES.A_AH;
    for (const c of clean) {
      if ('o'.includes(c)) { chosenViseme = VISEMES.O_OH; break; }
      if ('u'.includes(c)) { chosenViseme = VISEMES.U_OO; break; }
      if ('eiy'.includes(c)) { chosenViseme = VISEMES.E_EE; break; }
      if ('a'.includes(c)) { chosenViseme = VISEMES.A_AH; break; }
      if ('mbp'.includes(c)) { chosenViseme = VISEMES.M_B_P; break; }
      if ('fv'.includes(c)) { chosenViseme = VISEMES.F_V; break; }
    }

    // Set target with randomized amplitude for organic life
    const amp = 0.55 + Math.random() * 0.45;
    this.target = {
      ...chosenViseme,
      open: chosenViseme.open * amp,
      audioLevel: amp
    };
  }

  startPhonemeSequence(text) {
    if (this.syllableTimer) clearInterval(this.syllableTimer);

    // Phoneme cadence ~ 130-160ms per syllable
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

      // 10% chance of consonant closure / breath pause
      if (Math.random() < 0.12) {
        this.target = { ...VISEMES.M_B_P, open: 0.05, audioLevel: 0.2 };
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
    }, 135);
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
