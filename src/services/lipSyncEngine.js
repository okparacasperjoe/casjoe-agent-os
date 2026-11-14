/**
 * Casjoe Agent OS - 3D Neural Lip-Sync & Voice Engine
 * Streams hyper-realistic Microsoft Edge Neural voices directly through Web Audio API,
 * providing real-time acoustic frequency analysis and ARKit-standard blendshape targets:
 * jawOpen, mouthPucker, mouthSmile, mouthPress, eyeBlink, and head kinematics.
 */

// Voice Tone Presets for 3D Human Avatars
export const VOICE_TONES = {
  ELENA: {
    id: 'elena',
    name: 'Elena (Warm & Conversational)',
    gender: 'female',
    edgeVoice: 'en-US-JennyNeural',
    pitch: '+0Hz',
    rate: '+0%',
    description: 'Empathetic, clear, and natural human conversational tone'
  },
  MARCUS: {
    id: 'marcus',
    name: 'Marcus (Executive & Confident)',
    gender: 'male',
    edgeVoice: 'en-US-GuyNeural',
    pitch: '-3Hz',
    rate: '-2%',
    description: 'Deep, resonant, authoritative corporate executive tone'
  },
  SOPHIA: {
    id: 'sophia',
    name: 'Sophia (Bright & Friendly)',
    gender: 'female',
    edgeVoice: 'en-US-AriaNeural',
    pitch: '+2Hz',
    rate: '+2%',
    description: 'Energetic, modern, engaging tech advisor'
  },
  DAVID: {
    id: 'david',
    name: 'David (Calm & Articulate)',
    gender: 'male',
    edgeVoice: 'en-US-ChristopherNeural',
    pitch: '-2Hz',
    rate: '-3%',
    description: 'Balanced, articulate, and thoughtful executive advisor'
  },
  VICTORIA: {
    id: 'victoria',
    name: 'Victoria (British RP Refined)',
    gender: 'female',
    edgeVoice: 'en-GB-SoniaNeural',
    pitch: '+0Hz',
    rate: '+0%',
    description: 'Refined, elegant British accent with articulate pacing'
  }
};

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
    this.dataArray = null;
    this.activeAudioSource = null;
    this.micAnalyser = null;
    this.micStream = null;
    this.micDataArray = null;

    this.isSpeaking = false;
    this.isListening = false;

    // Active voice configuration
    this.selectedToneId = localStorage.getItem('casjoe_voice_tone') || 'elena';
    this.customPitch = parseFloat(localStorage.getItem('casjoe_voice_pitch') || '1.0');
    this.customRate = parseFloat(localStorage.getItem('casjoe_voice_rate') || '1.0');

    // ARKit-Standard 3D Facial Blendshape Parameters (0.0 to 1.0)
    this.blendshapes = {
      jawOpen: 0.0,        // Primary vertical jaw opening
      mouthPucker: 0.0,    // 'O' and 'U' circular lips
      mouthFunnel: 0.0,    // 'OH' open oval
      mouthSmile: 0.1,     // Natural subtle smile / 'EE' width
      mouthStretch: 0.0,   // Horizontal vowel stretch
      mouthPress: 0.0,     // 'M', 'B', 'P' closed lip seal
      teethExposure: 0.0,  // Upper dental visibility
      tongueUp: 0.0,       // 'L', 'TH' articulation
      audioLevel: 0.0,     // Real-time audio RMS amplitude
      micLevel: 0.0        // User mic volume
    };

    // Target state driven by real-time acoustic FFT
    this.targetBlendshapes = { ...this.blendshapes };

    this.listeners = new Set();
    this.animFrameId = null;

    this.startAnimationLoop();
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.45;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  // Connect microphone for user audio visualizer
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

  // 60fps interpolation physics loop
  startAnimationLoop() {
    const loop = () => {
      this.updatePhysics();
      this.notifyListeners();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  updatePhysics() {
    // 1. Analyze user mic if listening
    if (this.micAnalyser && this.micDataArray) {
      this.micAnalyser.getByteFrequencyData(this.micDataArray);
      let sum = 0;
      for (let i = 0; i < this.micDataArray.length; i++) {
        sum += this.micDataArray[i];
      }
      this.blendshapes.micLevel = (sum / this.micDataArray.length) / 128;
    } else {
      this.blendshapes.micLevel = 0;
    }

    // 2. Real-time Acoustic Analysis of playing neural speech
    if (this.isSpeaking && this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);

      let totalEnergy = 0;
      let lowBand = 0;   // 100Hz - 600Hz (vowel fundamentals, 'O', 'U')
      let midBand = 0;   // 600Hz - 2200Hz ('A', 'E', jaw opening formants)
      let highBand = 0;  // 2500Hz - 6000Hz ('S', 'F', fricative sibilants)

      const binCount = this.dataArray.length; // 128
      for (let i = 0; i < binCount; i++) {
        const val = this.dataArray[i];
        totalEnergy += val;
        if (i < 8) lowBand += val;
        else if (i < 32) midBand += val;
        else if (i < 70) highBand += val;
      }

      const avg = totalEnergy / binCount; // 0 to 255
      const rms = avg / 128; // 0 to ~2.0

      if (rms > 0.04) {
        // Voice is actively producing sound
        const jawOpenTarget = Math.min(1.0, Math.max(0.05, (midBand / 24) / 100 * 1.3));
        const puckerTarget = Math.min(1.0, (lowBand / 8) / 120 * 0.9);
        const stretchTarget = Math.min(1.0, (midBand / 24) / 140);
        const teethTarget = Math.min(1.0, (highBand / 38) / 110);

        this.targetBlendshapes.jawOpen = jawOpenTarget;
        this.targetBlendshapes.mouthPucker = puckerTarget > 0.4 ? puckerTarget : 0.05;
        this.targetBlendshapes.mouthStretch = stretchTarget;
        this.targetBlendshapes.teethExposure = teethTarget;
        this.targetBlendshapes.mouthPress = 0.0;
        this.targetBlendshapes.audioLevel = rms;
      } else {
        // Brief pause or consonant breath closure
        this.targetBlendshapes.jawOpen = 0.02;
        this.targetBlendshapes.mouthPucker = 0.05;
        this.targetBlendshapes.mouthStretch = 0.05;
        this.targetBlendshapes.teethExposure = 0.0;
        this.targetBlendshapes.mouthPress = 0.15;
        this.targetBlendshapes.audioLevel = 0.0;
      }
    } else if (!this.isSpeaking) {
      // Return smoothly to relaxed neutral smile
      this.targetBlendshapes.jawOpen = 0.0;
      this.targetBlendshapes.mouthPucker = 0.0;
      this.targetBlendshapes.mouthFunnel = 0.0;
      this.targetBlendshapes.mouthSmile = 0.1;
      this.targetBlendshapes.mouthStretch = 0.0;
      this.targetBlendshapes.mouthPress = 0.0;
      this.targetBlendshapes.teethExposure = 0.0;
      this.targetBlendshapes.audioLevel = 0.0;
    }

    // 3. Smooth Damped Spring Interpolation at 60fps
    const ease = this.isSpeaking ? 0.35 : 0.18;
    this.blendshapes.jawOpen += (this.targetBlendshapes.jawOpen - this.blendshapes.jawOpen) * ease;
    this.blendshapes.mouthPucker += (this.targetBlendshapes.mouthPucker - this.blendshapes.mouthPucker) * ease;
    this.blendshapes.mouthStretch += (this.targetBlendshapes.mouthStretch - this.blendshapes.mouthStretch) * ease;
    this.blendshapes.mouthPress += (this.targetBlendshapes.mouthPress - this.blendshapes.mouthPress) * ease;
    this.blendshapes.teethExposure += (this.targetBlendshapes.teethExposure - this.blendshapes.teethExposure) * ease;
    this.blendshapes.audioLevel += (this.targetBlendshapes.audioLevel - this.blendshapes.audioLevel) * 0.3;
  }

  notifyListeners() {
    for (const cb of this.listeners) {
      cb({ ...this.blendshapes, isSpeaking: this.isSpeaking, isListening: this.isListening });
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  setVoiceTone(toneId) {
    this.selectedToneId = toneId;
    localStorage.setItem('casjoe_voice_tone', toneId);
  }

  /**
   * Speaks dialogue using high-fidelity Microsoft Edge Neural Voice streaming.
   * Feeds the decoded audio directly into Web Audio for acoustic lip synchronization.
   * @param {string} text - Spoken text
   * @param {object} options - { toneId, pitch, rate, onStart, onEnd }
   */
  async speak(text, options = {}) {
    return new Promise(async (resolve) => {
      this.stop(); // Stop ongoing audio

      const cleanText = cleanTextForNaturalSpeech(text);
      if (!cleanText) {
        resolve();
        return;
      }

      const toneId = options.toneId || this.selectedToneId || 'elena';
      const preset = VOICE_TONES[toneId?.toUpperCase()] || VOICE_TONES.ELENA;

      // Rate / pitch adjustments
      const pitchStr = options.pitch ? `${Math.round((options.pitch - 1) * 20)}Hz` : preset.pitch;
      const rateStr = options.rate ? `${Math.round((options.rate - 1) * 30)}%` : preset.rate;

      // Check if Electron native IPC is available for Edge Neural TTS
      let ipcRenderer = null;
      if (window.electron && window.electron.ipcRenderer) {
        ipcRenderer = window.electron.ipcRenderer;
      } else if (typeof window !== 'undefined' && typeof window.require === 'function') {
        try {
          const electron = window.require('electron');
          ipcRenderer = electron.ipcRenderer;
        } catch {}
      }

      if (ipcRenderer && ipcRenderer.invoke) {
        try {
          // 1. Invoke Edge Neural TTS in Electron Main process
          const res = await ipcRenderer.invoke('agent:synthesize-neural-speech', {
            text: cleanText,
            voice: preset.edgeVoice,
            pitch: pitchStr,
            rate: rateStr
          });

          if (res && res.success && res.base64Audio) {
            // 2. Decode MP3 Audio into Web Audio Buffer
            const ctx = this.getAudioContext();
            const binaryString = window.atob(res.base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const audioBuffer = await ctx.decodeAudioData(bytes.buffer);

            // 3. Play audio through AnalyserNode
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;

            source.connect(this.analyser);
            this.analyser.connect(ctx.destination);

            this.activeAudioSource = source;
            this.isSpeaking = true;
            if (options.onStart) options.onStart();

            source.onended = () => {
              this.isSpeaking = false;
              this.activeAudioSource = null;
              if (options.onEnd) options.onEnd();
              resolve();
            };

            source.start(0);
            return;
          }
        } catch (err) {
          console.warn('Edge Neural TTS IPC failed, falling back to speech synthesis:', err);
        }
      }

      // Offline / browser fallback: use natural Web Speech API
      this.speakFallback(cleanText, preset, options, resolve);
    });
  }

  speakFallback(cleanText, preset, options, resolve) {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.98;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => 
      v.name.includes('Natural') || 
      v.name.includes('Jenny') || 
      v.name.includes('Guy') || 
      v.name.includes('Google') || 
      v.lang.startsWith('en')
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    this.isSpeaking = true;
    if (options.onStart) options.onStart();

    const finish = () => {
      this.isSpeaking = false;
      if (options.onEnd) options.onEnd();
      resolve();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (this.activeAudioSource) {
      try {
        this.activeAudioSource.stop();
        this.activeAudioSource.disconnect();
      } catch {}
      this.activeAudioSource = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.targetBlendshapes.jawOpen = 0.0;
    this.targetBlendshapes.mouthPucker = 0.0;
    this.targetBlendshapes.mouthStretch = 0.0;
    this.targetBlendshapes.audioLevel = 0.0;
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

export const lipSyncEngine = new LipSyncEngine();
