/**
 * audio.js - Web Audio API Procedural Sound Engine & Voice Synthesizer
 * 100% self-contained: no external audio files required!
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.fanGain = null;
        this.fanNoiseNode = null;
        this.fanOscNode = null;
        this.isFanPlaying = false;
        this.speechQueue = [];
        this.speechDebounce = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted && this.fanGain) {
            this.fanGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        return this.muted;
    }

    // Continuous Fan Whoosh & Motor Hum
    startFan(mega = false) {
        if (this.muted) return;
        this.init();
        if (this.isFanPlaying) {
            if (this.fanGain && this.ctx) {
                const targetGain = mega ? 0.35 : 0.18;
                this.fanGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
            }
            return;
        }

        try {
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            this.fanNoiseNode = this.ctx.createBufferSource();
            this.fanNoiseNode.buffer = buffer;
            this.fanNoiseNode.loop = true;

            // Bandpass filter for wind whoosh
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(mega ? 900 : 650, this.ctx.currentTime);
            filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

            // Motor drone
            this.fanOscNode = this.ctx.createOscillator();
            this.fanOscNode.type = 'sawtooth';
            this.fanOscNode.frequency.setValueAtTime(mega ? 160 : 110, this.ctx.currentTime);

            const oscFilter = this.ctx.createBiquadFilter();
            oscFilter.type = 'lowpass';
            oscFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

            const oscGain = this.ctx.createGain();
            oscGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

            this.fanGain = this.ctx.createGain();
            const initialGain = mega ? 0.35 : 0.18;
            this.fanGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
            this.fanGain.gain.linearRampToValueAtTime(initialGain, this.ctx.currentTime + 0.1);

            this.fanNoiseNode.connect(filter);
            filter.connect(this.fanGain);

            this.fanOscNode.connect(oscFilter);
            oscFilter.connect(oscGain);
            oscGain.connect(this.fanGain);

            this.fanGain.connect(this.ctx.destination);

            this.fanNoiseNode.start();
            this.fanOscNode.start();
            this.isFanPlaying = true;
        } catch (e) {
            console.warn("Audio init error", e);
        }
    }

    stopFan() {
        if (!this.isFanPlaying || !this.fanGain || !this.ctx) return;
        try {
            this.fanGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
            setTimeout(() => {
                if (this.fanNoiseNode) {
                    try { this.fanNoiseNode.stop(); } catch(e){}
                    this.fanNoiseNode.disconnect();
                }
                if (this.fanOscNode) {
                    try { this.fanOscNode.stop(); } catch(e){}
                    this.fanOscNode.disconnect();
                }
                this.isFanPlaying = false;
            }, 160);
        } catch (e) {}
    }

    // Bomb Throw sound (swish)
    playThrow() {
        if (this.muted) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.2);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        } catch(e) {}
    }

    // Bomb Bounce (little icy clink)
    playBounce() {
        if (this.muted) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch(e) {}
    }

    // Dry Ice Bomb Detonation: Frost shockwave boom & crackle
    playBombExplosion() {
        if (this.muted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            
            // 1. Low Thud / Shockwave
            const subOsc = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(180, now);
            subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.45);
            subGain.gain.setValueAtTime(0.5, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            subOsc.connect(subGain);
            subGain.connect(this.ctx.destination);
            subOsc.start(now);
            subOsc.stop(now + 0.45);

            // 2. Frost hiss / Icy mist explosion
            const bufferSize = this.ctx.sampleRate * 0.6;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.18));
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1800, now);
            filter.frequency.linearRampToValueAtTime(800, now + 0.5);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.4, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(now);

            // 3. Ice Crystal sparkle chimes
            [1200, 1600, 2200].forEach((freq, idx) => {
                const chime = this.ctx.createOscillator();
                const chimeGain = this.ctx.createGain();
                chime.type = 'sine';
                chime.frequency.setValueAtTime(freq, now + idx * 0.04);
                chimeGain.gain.setValueAtTime(0.12, now + idx * 0.04);
                chimeGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);
                chime.connect(chimeGain);
                chimeGain.connect(this.ctx.destination);
                chime.start(now + idx * 0.04);
                chime.stop(now + idx * 0.04 + 0.25);
            });
        } catch(e) {}
    }

    // Powerup pickup fanfare
    playPowerup() {
        if (this.muted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.08);

                gain.gain.setValueAtTime(0.2, now + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + i * 0.08);
                osc.stop(now + i * 0.08 + 0.25);
            });
        } catch(e) {}
    }

    // Haze cleared puff sound
    playHazeCleared() {
        if (this.muted) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600 + Math.random() * 200, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        } catch(e) {}
    }

    // Warning alert tick (low time)
    playWarningTick() {
        if (this.muted) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.06);
        } catch(e) {}
    }

    // Victory celebration fanfare
    playWin() {
        if (this.muted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            // C major joyful arpeggio
            const melody = [
                { f: 523.25, d: 0.15, t: 0.0 },  // C5
                { f: 659.25, d: 0.15, t: 0.15 }, // E5
                { f: 783.99, d: 0.15, t: 0.3 },  // G5
                { f: 1046.50, d: 0.45, t: 0.45 },// C6
                { f: 880.00, d: 0.2, t: 0.9 },   // A5
                { f: 1046.50, d: 0.7, t: 1.1 }   // C6
            ];
            melody.forEach(note => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(note.f, now + note.t);

                gain.gain.setValueAtTime(0.25, now + note.t);
                gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + note.t);
                osc.stop(now + note.t + note.d);
            });
        } catch(e) {}
    }

    // Game Over fail tune
    playLose() {
        if (this.muted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const melody = [
                { f: 440, d: 0.3, t: 0.0 },
                { f: 415.3, d: 0.3, t: 0.3 },
                { f: 392, d: 0.3, t: 0.6 },
                { f: 349.2, d: 0.8, t: 0.9 }
            ];
            melody.forEach(note => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(note.f, now + note.t);

                gain.gain.setValueAtTime(0.18, now + note.t);
                gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + note.t);
                osc.stop(now + note.t + note.d);
            });
        } catch(e) {}
    }

    // Makcik Voice Lines (Humorous Malaysian canteen phrases)
    speak(phrase, triggerBubbleCallback = null) {
        if (triggerBubbleCallback) {
            triggerBubbleCallback(phrase);
        }

        if (this.muted) return;
        const now = Date.now();
        if (now - this.speechDebounce < 2500) return; // Prevent spamming
        this.speechDebounce = now;

        if ('speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(phrase);
                utter.rate = 1.15;
                utter.pitch = 1.25; // Slightly high energetic tone for Makcik
                utter.volume = 0.9;
                
                // Try finding Malay or English voice
                const voices = window.speechSynthesis.getVoices();
                const msVoice = voices.find(v => v.lang.startsWith('ms') || v.lang.startsWith('id'));
                if (msVoice) {
                    utter.voice = msVoice;
                }
                window.speechSynthesis.speak(utter);
            } catch(e) {}
        }
    }
}

// Global Sound Instance
window.GameSound = new SoundEngine();
