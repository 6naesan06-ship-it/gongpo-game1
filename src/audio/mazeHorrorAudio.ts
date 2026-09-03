// Web Audio API procedural sound engine for Abandoned Mansion horror atmosphere

class MazeHorrorAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private tensionGain: GainNode | null = null;
  private isInitialized: boolean = false;

  // Heartbeat loop state
  private lastHeartbeatBeatTime: number = 0;
  private isHeartbeatActive: boolean = false;

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
  public playHeartbeat(bpm: number = 80, customVolume: number = 0.45) {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Lub-dub deep organic cardiac thuds with harmonic resonance
    const makeThud = (timeOffset: number, startFreq: number, endFreq: number, vol: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, t + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + timeOffset + 0.12);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, t + timeOffset);

      gain.gain.setValueAtTime(0.001, t + timeOffset);
      gain.gain.linearRampToValueAtTime(vol, t + timeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + timeOffset + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + timeOffset);
      osc.stop(t + timeOffset + 0.2);
    };

    // First heavy ventricular systole (Lub)
    makeThud(0, 82, 28, customVolume);
    // Second diastolic snap (Dub)
    makeThud(0.13, 68, 22, customVolume * 0.78);
  }

  // Real-time sanity-driven heartbeat loop (called every frame)
  public updateSanityHeartbeat(sanity: number, phantomNear: boolean = false) {
    if (this.isMuted) return;

    // Trigger condition: Sanity is 30% or below, or a phantom is within close distance
    const isCritical = sanity <= 30 || phantomNear;

    if (!isCritical) {
      this.isHeartbeatActive = false;
      return;
    }

    this.isHeartbeatActive = true;
    const now = performance.now();

    // Calculate BPM and intensity based on sanity depth
    let targetBpm = 85;
    let volume = 0.45;

    if (phantomNear && sanity > 30) {
      targetBpm = 100;
      volume = 0.55;
    } else if (sanity <= 30 && sanity > 20) {
      // 20% ~ 30%: Anxious pace
      const factor = (30 - sanity) / 10; // 0 to 1
      targetBpm = 85 + factor * 25; // 85 -> 110 BPM
      volume = 0.45 + factor * 0.15; // 0.45 -> 0.60
    } else if (sanity <= 20 && sanity > 10) {
      // 10% ~ 20%: Panic pace
      const factor = (20 - sanity) / 10;
      targetBpm = 110 + factor * 30; // 110 -> 140 BPM
      volume = 0.60 + factor * 0.20; // 0.60 -> 0.80
    } else if (sanity <= 10) {
      // 0% ~ 10%: Extreme terror & cardiac tachycardia
      const factor = (10 - sanity) / 10;
      targetBpm = 140 + factor * 35; // 140 -> 175 BPM
      volume = 0.80 + factor * 0.25; // 0.80 -> 1.05
    }

    const intervalMs = (60 / targetBpm) * 1000;

    if (now - this.lastHeartbeatBeatTime >= intervalMs) {
      this.lastHeartbeatBeatTime = now;
      this.playHeartbeat(targetBpm, volume);
    }
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

  // Violent Ghost Jumpscare Scream & Impact (공포 귀신 피격 갑툭튀 비명 및 충격음)
  public playGhostJumpscareScream(variant: 'white_maiden' | 'shadow_specter' | 'boss_demon' = 'white_maiden') {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Terrifying High Shriek (피를 말리는 찢어지는 귀신 비명음)
    const screamFreqs = variant === 'white_maiden' 
      ? [880, 932, 1174, 1480, 1850] 
      : variant === 'boss_demon' 
        ? [180, 240, 360, 520, 840] 
        : [540, 680, 820, 1100, 1340];

    screamFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      // Sudden shrieking pitch wobble & terrifying drop
      osc.frequency.linearRampToValueAtTime(freq * 1.25, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, t + 0.95);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(300, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.42 / screamFreqs.length, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.2);
    });

    // 2. Bone-Crushing Sub Impact Slam (심장을 후벼파는 충격음)
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(140, t);
    sub.frequency.exponentialRampToValueAtTime(22, t + 0.6);

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(180, t);

    subGain.gain.setValueAtTime(0.85, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    sub.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 0.9);

    // 3. Static Glitch / Noise Blast (스피커를 찢는 듯한 노이즈 크런치)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    whiteNoise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    whiteNoise.start(t);

    // 4. Player hyperventilation and extreme pounding heartbeat
    this.playHeartbeat(175, 0.7);
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

  // Boss Battle BGM & Soundscapes
  private bossDrumInterval: number | null = null;
  private isBossBgmActive: boolean = false;

  public startBossBgm() {
    if (this.isBossBgmActive) return;
    this.isBossBgmActive = true;
    this.ensureCtx();

    // Intense Korean shaman drum (대북) pulse & dark rhythmic drone
    let beat = 0;
    const playDrumPattern = () => {
      if (!this.isBossBgmActive || !this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;

      // Heavy bass drum hit (Dung)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const isAccent = beat % 4 === 0;
      const freq = isAccent ? 52 : 64;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(24, t + 0.35);

      gain.gain.setValueAtTime(isAccent ? 0.5 : 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);

      // Clanging metallic rhythm on accented beats
      if (isAccent && Math.random() > 0.3) {
        const gongOsc = this.ctx.createOscillator();
        const gongGain = this.ctx.createGain();
        gongOsc.type = 'sawtooth';
        gongOsc.frequency.setValueAtTime(320, t);
        gongOsc.frequency.exponentialRampToValueAtTime(140, t + 0.6);

        const gongFilter = this.ctx.createBiquadFilter();
        gongFilter.type = 'bandpass';
        gongFilter.frequency.setValueAtTime(450, t);

        gongGain.gain.setValueAtTime(0.18, t);
        gongGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

        gongOsc.connect(gongFilter);
        gongFilter.connect(gongGain);
        gongGain.connect(this.ctx.destination);
        gongOsc.start(t);
        gongOsc.stop(t + 0.7);
      }

      beat++;
    };

    // 130 BPM rhythm interval (~230ms per eighth note)
    this.bossDrumInterval = window.setInterval(playDrumPattern, 230);
  }

  public stopBossBgm() {
    this.isBossBgmActive = false;
    if (this.bossDrumInterval !== null) {
      clearInterval(this.bossDrumInterval);
      this.bossDrumInterval = null;
    }
  }

  // Boss Battle Intro Roar & Realm Transition Gong
  public playBossIntro() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Deep Sub-bass realm tear
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(90, t);
    subOsc.frequency.exponentialRampToValueAtTime(28, t + 2.5);

    subGain.gain.setValueAtTime(0.6, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 2.9);

    // 2. Dark mythical bell toll
    const bellFreqs = [146.83, 220.0, 293.66, 440.0];
    bellFreqs.forEach((freq) => {
      if (!this.ctx) return;
      const bell = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bell.type = 'triangle';
      bell.frequency.setValueAtTime(freq, t);

      bGain.gain.setValueAtTime(0.25, t);
      bGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

      bell.connect(bGain);
      bGain.connect(this.ctx.destination);
      bell.start(t);
      bell.stop(t + 3.3);
    });

    // 3. Eoduksini monstrous shadow roar
    this.playBossRoar();
  }

  // Eoduksini monstrous roar
  public playBossRoar() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Monster screech + guttural growl
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, t);
    osc1.frequency.linearRampToValueAtTime(220, t + 0.4);
    osc1.frequency.exponentialRampToValueAtTime(45, t + 1.8);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(80, t);
    osc2.frequency.linearRampToValueAtTime(160, t + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(35, t + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 0.4);
    filter.frequency.exponentialRampToValueAtTime(200, t + 1.8);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.55, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.85);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.9);
    osc2.stop(t + 1.9);
  }

  // Boss Shadow Ground Slam / Shockwave
  public playBossSlam() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Heavy earth-shattering thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.6);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.75);

    // Dark rumble burst
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + 0.35);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.5, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Boss Hit Reaction (Sa-in Sword Strike Clang & Holy Sparks)
  public playBossHit(currentHp: number) {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Crisp sword steel impact & divine chime
    const swordOsc = this.ctx.createOscillator();
    const swordGain = this.ctx.createGain();
    swordOsc.type = 'triangle';
    swordOsc.frequency.setValueAtTime(1800, t);
    swordOsc.frequency.exponentialRampToValueAtTime(400, t + 0.2);

    swordGain.gain.setValueAtTime(0.45, t);
    swordGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    swordOsc.connect(swordGain);
    swordGain.connect(this.ctx.destination);
    swordOsc.start(t);
    swordOsc.stop(t + 0.26);

    // 2. Agonized shadow shriek
    const shriek = this.ctx.createOscillator();
    const sGain = this.ctx.createGain();
    const sFilter = this.ctx.createBiquadFilter();

    shriek.type = 'sawtooth';
    shriek.frequency.setValueAtTime(380, t);
    shriek.frequency.exponentialRampToValueAtTime(90, t + 0.45);

    sFilter.type = 'bandpass';
    sFilter.frequency.setValueAtTime(600, t);
    sFilter.Q.setValueAtTime(4.0, t);

    sGain.gain.setValueAtTime(0.35, t);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

    shriek.connect(sFilter);
    sFilter.connect(sGain);
    sGain.connect(this.ctx.destination);
    shriek.start(t);
    shriek.stop(t + 0.5);

    // 3. Holy chime resonance (pitch climbs higher as boss HP gets lower!)
    const pitch = 523.25 + (15 - currentHp) * 35;
    const chime = this.ctx.createOscillator();
    const cGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(pitch, t);

    cGain.gain.setValueAtTime(0.2, t);
    cGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

    chime.connect(cGain);
    cGain.connect(this.ctx.destination);
    chime.start(t);
    chime.stop(t + 0.85);
  }

  // Boss Invulnerable Deflection Sound (Clank & dark barrier hiss)
  public playBossInvulnerableBlock() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Metallic barrier clink
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.15);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    // Dark barrier hiss
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, t);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.35, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Boss Groggy / Stunned Sound (Exposed core chime & heavy breath)
  public playBossStaggerGroggy() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Divine stun chime (Groggy chance alert!)
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.22 / (idx + 1), t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.04);
      osc.stop(t + 1.3);
    });

    // Sub groan of weakness
    const groan = this.ctx.createOscillator();
    const gGain = this.ctx.createGain();
    groan.type = 'sawtooth';
    groan.frequency.setValueAtTime(140, t);
    groan.frequency.exponentialRampToValueAtTime(50, t + 0.6);
    gGain.gain.setValueAtTime(0.3, t);
    gGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    groan.connect(gGain);
    gGain.connect(this.ctx.destination);
    groan.start(t);
    groan.stop(t + 0.7);
  }

  // Boss Tentacle Rush Attack Sound
  public playBossTentacleRush() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const stabTime = t + i * 0.16;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, stabTime);
      osc.frequency.exponentialRampToValueAtTime(180, stabTime + 0.12);

      gain.gain.setValueAtTime(0.3, stabTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stabTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(stabTime);
      osc.stop(stabTime + 0.15);
    }
  }

  // Boss Black Lightning Eclipse Strike
  public playBossLightningStorm() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Thunder crack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.8);

    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.95);
  }

  // Boss Gravitational Vortex Pull
  public playBossVortexPull() {
    if (this.isMuted) return;
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.linearRampToValueAtTime(180, t + 1.2);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.6);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 1.8);
  }

  // Boss Defeat & Exorcism Grand Fanfare
  public playBossDefeat() {
    if (this.isMuted) return;
    this.stopBossBgm();
    this.ensureCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Grand celestial pentatonic chord resolution + temple gong
    const grandChords = [130.81, 196.0, 261.63, 329.63, 392.0, 523.25, 659.25, 1046.5];
    grandChords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.001, t + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.35 / (idx * 0.4 + 1), t + idx * 0.05 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + 4.8);
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
    this.stopBossBgm();
    this.isHeartbeatActive = false;
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
