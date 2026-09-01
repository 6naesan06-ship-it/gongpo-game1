// Web Audio API procedural sound engine for Abandoned Mansion horror atmosphere

class MazeHorrorAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private heartbeatInterval: number | null = null;
  private isInitialized: boolean = false;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.isInitialized = true;
    } catch {
      console.warn('Web Audio API not supported');
    }
  }

  private ensureCtx() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.value = muted ? 0 : 0.4;
    }
    if (this.windGain) {
      this.windGain.gain.value = muted ? 0 : 0.25;
    }
  }

  // Start continuous abandoned house ambient drone (wind, low sub-bass drone)
  public startAmbient() {
    this.ensureCtx();
    if (!this.ctx || this.ambientGain) return;

    // Sub-bass dark drone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    this.ambientGain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(45, this.ctx.currentTime); // Low Bb/F drone

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(48.5, this.ctx.currentTime); // Beating dissonance

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();

    // Wind noise generator
    this.startWindNoise();
  }

  private startWindNoise() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(320, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(this.isMuted ? 0 : 0.18, this.ctx.currentTime);

    whiteNoise.connect(bandpass);
    bandpass.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);

    whiteNoise.start();

    // Modulate wind frequency
    setInterval(() => {
      if (this.ctx && bandpass) {
        const nextFreq = 200 + Math.random() * 350;
        bandpass.frequency.setTargetAtTime(nextFreq, this.ctx.currentTime, 3.0);
      }
    }, 4000);
  }

  // Creaking wood floor footstep
  public playFootstep(isSprinting: boolean = false) {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Wood thud + creak
    const baseFreq = 70 + Math.random() * 40;
    osc.type = Math.random() > 0.4 ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + (isSprinting ? 0.09 : 0.13));

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600 + Math.random() * 300, t);

    const volume = isSprinting ? 0.45 : 0.3;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isSprinting ? 0.12 : 0.17));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);

    // High frequency wood splinter creak sound (sometimes)
    if (Math.random() > 0.4) {
      const creak = this.ctx.createOscillator();
      const creakGain = this.ctx.createGain();
      creak.type = 'sawtooth';
      creak.frequency.setValueAtTime(450 + Math.random() * 300, t);
      creak.frequency.exponentialRampToValueAtTime(180, t + 0.08);

      creakGain.gain.setValueAtTime(0.08, t);
      creakGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

      creak.connect(creakGain);
      creakGain.connect(this.ctx.destination);
      creak.start(t);
      creak.stop(t + 0.09);
    }
  }

  // Flashlight click
  public playFlashlightClick() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.03);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Wooden sliding door creak and friction sound
  public playDoorCreak(isOpen: boolean = true) {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Friction track scrape sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    const startFreq = isOpen ? 180 : 260;
    const endFreq = isOpen ? 320 : 160;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);

    // 2. High wooden creak groan
    const creak = this.ctx.createOscillator();
    const creakGain = this.ctx.createGain();
    creak.type = 'triangle';
    creak.frequency.setValueAtTime(isOpen ? 520 : 640, t);
    creak.frequency.exponentialRampToValueAtTime(isOpen ? 780 : 420, t + 0.28);

    creakGain.gain.setValueAtTime(0.001, t);
    creakGain.gain.linearRampToValueAtTime(0.18, t + 0.05);
    creakGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);

    creak.connect(creakGain);
    creakGain.connect(this.ctx.destination);
    creak.start(t);
    creak.stop(t + 0.4);

    // 3. Wooden contact thud on close
    if (!isOpen) {
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(110, t + 0.32);
      thud.frequency.exponentialRampToValueAtTime(40, t + 0.45);

      thudGain.gain.setValueAtTime(0.35, t + 0.32);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

      thud.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thud.start(t + 0.32);
      thud.stop(t + 0.5);
    }
  }

  // Item inspection / parchment rustle
  public playInspectSound() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(t);
  }

  // Shaman brass bell / talisman pickup
  public playShamanBell() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [1200, 1820, 2480, 3700];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      const vol = 0.18 / (idx + 1);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  // Heartbeat pulse (triggers when sanity is low or phantom is near)
  public playHeartbeat(bpm: number = 80) {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Lub-dub double thud
    const makeThud = (timeOffset: number, freq: number, vol: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(30, t + timeOffset + 0.1);

      gain.gain.setValueAtTime(vol, t + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + timeOffset);
      osc.stop(t + timeOffset + 0.16);
    };

    makeThud(0, 75, 0.4);
    makeThud(0.12, 60, 0.3);
  }

  // Ghost whisper / eerie sting
  public playGhostPresence() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(680, t + 0.4);
    osc.frequency.linearRampToValueAtTime(290, t + 1.1);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(550, t);
    filter.Q.setValueAtTime(5.0, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.3);
  }

  // Jumpscare / Horror Stinger
  public playHorrorStinger() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Screeching cluster
    const cluster = [415, 440, 466, 622, 880];
    cluster.forEach((f) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.linearRampToValueAtTime(f * (Math.random() > 0.5 ? 1.2 : 0.8), t + 0.5);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.0);
    });

    // Sub bass slam
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(95, t);
    sub.frequency.exponentialRampToValueAtTime(25, t + 0.5);
    subGain.gain.setValueAtTime(0.6, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 0.8);
  }

  // Water drip in abandoned house
  public playWaterDrip() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600 + Math.random() * 600, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Sacred Taoist Talisman Exorcism burst & chanting chime
  public playTalismanExorcism() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. High sacred bell resonance (Chime)
    [587.33, 880, 1174.66, 1760].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, t + 0.8);

      gain.gain.setValueAtTime(0.18 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9 + idx * 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);
    });

    // 2. Taoist flame burst whoosh
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.2);
    filter.Q.setValueAtTime(3.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Sacred Sword (사인참사검) Slash
  public playSwordSlash() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Metallic blade ring
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.18);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);

    // Fast blade whoosh
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.linearRampToValueAtTime(400, t + 0.2);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Ghost Dissipation / Purification screech fading into ether
  public playGhostDissipate() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Fading spectral screech
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.7);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.8);
  }

  // Sacred Item Acquire Chord
  public playItemAcquire() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C major pentatonic sacred chord
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      gain.gain.setValueAtTime(0.001, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, t + i * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 1.0);
    });
  }

  // Escape Victory / Barrier Broken fanfare
  public playEscapeVictory() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Divine gong + celestial chords
    const chord = [261.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25 / (idx * 0.5 + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 3.2);
    });
  }

  public destroy() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}

export const mazeAudio = new MazeHorrorAudio();
