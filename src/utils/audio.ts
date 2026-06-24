/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseGain: GainNode | null = null;

  // Active noise source nodes
  private activeSource: AudioNode | null = null;
  private rainInterval: any = null;
  private cricketInterval: any = null;
  private focusOscillators: AudioNode[] = [];

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.noiseGain.connect(this.masterGain);
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Synthesizes a soft, warm wooden block tap or water droplet.
   */
  public playTap() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    const now = this.ctx.currentTime;

    // Fast pitch slide from 400Hz down to 80Hz creates a warm "plop/wood" sound
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);

    // Rapid volume decay
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Synthesizes a beautiful pentatonic chime (3 warm, staggered notes) for completion.
   */
  public playCompleteChime() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77]; // C5, E5, G5, B5 (Warm major-7th chord feel)

    notes.forEach((freq, idx) => {
      const triggerTime = now + idx * 0.15;
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, triggerTime);

      // Low-pass filter to make it softer
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, triggerTime);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      gainNode.gain.setValueAtTime(0, triggerTime);
      gainNode.gain.linearRampToValueAtTime(0.15, triggerTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, triggerTime + 1.2);

      osc.start(triggerTime);
      osc.stop(triggerTime + 1.5);
    });
  }

  /**
   * Generates white noise buffer.
   */
  private createWhiteNoiseBuffer(seconds = 3): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Generates brown noise buffer (cumulative integration of white noise).
   * Brown noise has much more low frequency, which sounds like deep waves, wind, or distant rumble.
   */
  private createBrownNoiseBuffer(seconds = 4): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Filter coefficient to integrate white noise (brownian motion)
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Amplify slightly because integration reduces volume
    }
    return buffer;
  }

  /**
   * Stop any running loops or audio components.
   */
  public stopNoise() {
    clearInterval(this.rainInterval);
    clearInterval(this.cricketInterval);
    this.rainInterval = null;
    this.cricketInterval = null;

    if (this.activeSource) {
      try {
        (this.activeSource as any).stop();
      } catch (e) {}
      this.activeSource = null;
    }

    this.focusOscillators.forEach((osc) => {
      try {
        (osc as any).stop();
      } catch (e) {}
    });
    this.focusOscillators = [];
  }

  /**
   * Adjust white noise playback volume (0 to 1).
   */
  public setVolume(vol: number) {
    this.resume();
    if (this.noiseGain && this.ctx) {
      this.noiseGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  /**
   * Plays the designated noise channel.
   */
  public startNoise(type: 'rain' | 'crickets' | 'focus') {
    this.resume();
    this.stopNoise();
    if (!this.ctx || !this.noiseGain) return;

    if (type === 'rain') {
      this.startRainSynth();
    } else if (type === 'crickets') {
      this.startCricketsSynth();
    } else if (type === 'focus') {
      this.startFocusSynth();
    }
  }

  /**
   * Synthesizes Warm Rain (Brown noise + Pink filter + LFO gust modulation).
   */
  private startRainSynth() {
    if (!this.ctx || !this.noiseGain) return;

    const brownBuffer = this.createBrownNoiseBuffer(4);
    if (!brownBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = brownBuffer;
    source.loop = true;

    // Filter to make the rain sound soft and organic
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    // LFO (Low Frequency Oscillator) to simulate gentle wind/rain gusts
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // very slow cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime); // modulate filter by 250Hz

    // Connect LFO to modulate filter frequency
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Setup main gain node for rain sound to make it cozy
    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.noiseGain);

    lfo.start();
    source.start();

    this.activeSource = source;

    // Store references so we can stop them
    this.focusOscillators.push(lfo);
  }

  /**
   * Synthesizes Summer Crickets (Chirp impulses with high-pitched oscillators).
   */
  private startCricketsSynth() {
    if (!this.ctx || !this.noiseGain) return;

    const now = this.ctx.currentTime;

    // 1. Generate deep tranquil background forest hum (very quiet lowpass noise)
    const humBuffer = this.createBrownNoiseBuffer(5);
    let humSource: AudioBufferSourceNode | null = null;
    if (humBuffer) {
      humSource = this.ctx.createBufferSource();
      humSource.buffer = humBuffer;
      humSource.loop = true;

      const humFilter = this.ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(180, now);

      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.12, now); // super subtle low rumbling wind

      humSource.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(this.noiseGain);
      humSource.start();
      this.activeSource = humSource;
    }

    // 2. Synthesize cricket chirps periodically
    // A chirp is a packet of high-freq pulses around 4000Hz modulated at 45Hz
    const playChirp = () => {
      if (!this.ctx || !this.noiseGain) return;

      const time = this.ctx.currentTime;
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const chirpGain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(3800 + Math.random() * 400, time); // cricket freq range

      // The modulator creates the rapid cricket vibration (approx 45Hz)
      modulator.type = 'sawtooth';
      modulator.frequency.setValueAtTime(45, time);

      modGain.gain.setValueAtTime(0.8, time);

      // Setup clean amplitude envelope for a single burst (e.g. "creee-creee-creee")
      chirpGain.gain.setValueAtTime(0, time);
      
      // We will create 3 quick chirps in a row (typical cricket call)
      const duration = 0.08;
      const interval = 0.14;
      for (let i = 0; i < 3; i++) {
        const start = time + i * interval;
        chirpGain.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.03, start + 0.02);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      }

      // Connect modulator to carrier frequency for frequency modulation (buzz effect)
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      // Connect carrier through chirp gain to output
      carrier.connect(chirpGain);

      // Lowpass filter to avoid harshness
      const highFilter = this.ctx.createBiquadFilter();
      highFilter.type = 'bandpass';
      highFilter.frequency.setValueAtTime(4000, time);
      highFilter.Q.setValueAtTime(2.0, time);

      chirpGain.connect(highFilter);
      highFilter.connect(this.noiseGain);

      modulator.start(time);
      carrier.start(time);

      modulator.stop(time + 0.6);
      carrier.stop(time + 0.6);
    };

    // Chirp every 1.5 to 2.5 seconds
    playChirp();
    this.cricketInterval = setInterval(() => {
      playChirp();
    }, 2000 + Math.random() * 1000);
  }

  /**
   * Synthesizes Classroom Study/Deep Focus (low pass hum + ultra subtle ticking clock).
   */
  private startFocusSynth() {
    if (!this.ctx || !this.noiseGain) return;

    const now = this.ctx.currentTime;

    // 1. Cozy warm room air hum (lowpassed brown noise)
    const roomBuffer = this.createBrownNoiseBuffer(6);
    if (!roomBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = roomBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    const roomGain = this.ctx.createGain();
    roomGain.gain.setValueAtTime(0.4, now);

    source.connect(filter);
    filter.connect(roomGain);
    roomGain.connect(this.noiseGain);
    source.start();

    this.activeSource = source;

    // 2. Add an ultra-subtle periodic wooden clock tick ("tock... tock") at 1Hz
    const playTick = () => {
      if (!this.ctx || !this.noiseGain) return;
      const tickTime = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const tickGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, tickTime);
      osc.frequency.exponentialRampToValueAtTime(150, tickTime + 0.015);

      tickGain.gain.setValueAtTime(0.02, tickTime); // extremely quiet and subtle
      tickGain.gain.exponentialRampToValueAtTime(0.0001, tickTime + 0.018);

      osc.connect(tickGain);
      tickGain.connect(this.noiseGain);

      osc.start(tickTime);
      osc.stop(tickTime + 0.03);
    };

    this.cricketInterval = setInterval(playTick, 1000);
  }
}

export const audio = new AudioManager();
