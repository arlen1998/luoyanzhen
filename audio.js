/* ============================================================
   落雁镇 · 程序化音频
   无音频文件：环境音与音效全部由 WebAudio 实时合成
   ============================================================ */
window.Sound = (function () {
  "use strict";

  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let muted = false;
  let inited = false;
  const L = {};
  let current = null;

  const MUTE_KEY = "luoyanzhen.muted";
  try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) {}

  const TARGETS = {
    rain:   { rain: 0.55, room: 0.22, drone: 0.10, noise: 0.00, water: 0.00 },
    room:   { rain: 0.06, room: 0.36, drone: 0.10, noise: 0.00, water: 0.00 },
    hall:   { rain: 0.00, room: 0.12, drone: 0.34, noise: 0.00, water: 0.00 },
    cctv:   { rain: 0.00, room: 0.10, drone: 0.06, noise: 0.30, water: 0.00 },
    water:  { rain: 0.00, room: 0.10, drone: 0.14, noise: 0.00, water: 0.42 },
    jail:   { rain: 0.00, room: 0.18, drone: 0.16, noise: 0.00, water: 0.18 },
    silent: { rain: 0.00, room: 0.00, drone: 0.00, noise: 0.00, water: 0.00 }
  };

  function init() {
    if (inited) return;
    inited = true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.55;
      master.connect(ctx.destination);

      const len = Math.floor(ctx.sampleRate * 2.5);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

      buildRain();
      buildRoom();
      buildDrone();
      buildStatic();
      buildWater();
    } catch (e) {
      ctx = null;
    }
  }

  function loopNoise() {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = true;
    s.start(0);
    return s;
  }

  function gainNode(v) {
    const g = ctx.createGain();
    g.gain.value = v == null ? 0 : v;
    return g;
  }

  function buildRain() {
    const src = loopNoise();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.55;
    const g = gainNode(0);
    src.connect(bp); bp.connect(g); g.connect(master);
    const src2 = loopNoise();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 620;
    const g2 = gainNode(0);
    src2.connect(lp); lp.connect(g2); g2.connect(master);
    L.rain = { g: g, g2: g2, src: src, src2: src2 };
  }

  function buildRoom() {
    const src = loopNoise();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 240; lp.Q.value = 0.6;
    const g = gainNode(0);
    src.connect(lp); lp.connect(g); g.connect(master);
    L.room = { g: g, src: src };
  }

  function buildDrone() {
    const g = gainNode(0);
    const o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = 55;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = 82.4;
    const g1 = gainNode(0.5), g2 = gainNode(0.32);
    o1.connect(g1); g1.connect(g);
    o2.connect(g2); g2.connect(g);
    g.connect(master);
    o1.start(0); o2.start(0);
    L.drone = { g: g, o1: o1, o2: o2 };
  }

  function buildStatic() {
    const src = loopNoise();
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 2200;
    const g = gainNode(0);
    src.connect(hp); hp.connect(g); g.connect(master);
    L.noise = { g: g, src: src };
  }

  function buildWater() {
    const src = loopNoise();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 680;
    const g = gainNode(0);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoGain = gainNode(260);
    lfo.connect(lfoGain); lfoGain.connect(lp.frequency);
    lfo.start(0);
    src.connect(lp); lp.connect(g); g.connect(master);
    L.water = { g: g, lp: lp, src: src, lfo: lfo };
  }

  function setScene(name) {
    if (!ctx) return;
    if (name === current) return;
    current = name;
    const t = TARGETS[name] || TARGETS.silent;
    const now = ctx.currentTime;
    const ramp = 1.4;
    if (L.rain) {
      L.rain.g.gain.setTargetAtTime(t.rain, now, ramp);
      L.rain.g2.gain.setTargetAtTime(t.rain * 0.55, now, ramp);
    }
    if (L.room) L.room.g.gain.setTargetAtTime(t.room, now, ramp);
    if (L.drone) L.drone.g.gain.setTargetAtTime(t.drone, now, ramp);
    if (L.noise) L.noise.g.gain.setTargetAtTime(t.noise, now, ramp);
    if (L.water) L.water.g.gain.setTargetAtTime(t.water, now, ramp);
  }

  function blip(freq, dur, type, vol, slideTo) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol == null ? 0.06 : vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(master);
    o.start(); o.stop(ctx.currentTime + dur + 0.03);
  }

  function noiseBurst(dur, freq, type, vol) {
    if (!ctx) return;
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type || "bandpass";
    f.frequency.value = freq || 1200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol == null ? 0.09 : vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(); s.stop(ctx.currentTime + dur + 0.02);
  }

  function sfx(name) {
    if (!ctx || muted) return;
    switch (name) {
      case "knock":
        [0, 0.42, 0.84].forEach(function (d, i) {
          setTimeout(function () {
            blip(76 - i * 5, 0.18, "sine", 0.26);
            blip(128, 0.05, "square", 0.03);
          }, d * 1000);
        });
        break;
      case "paper":
        noiseBurst(0.28, 2800, "highpass", 0.05);
        break;
      case "tape":
        noiseBurst(0.9, 900, "lowpass", 0.05);
        blip(120, 0.5, "sawtooth", 0.02, 70);
        break;
      case "bell":
        blip(196, 2.6, "sine", 0.07);
        blip(392, 1.6, "sine", 0.03);
        blip(588, 1.0, "sine", 0.015);
        break;
      case "glitch":
        noiseBurst(0.22, 1800, "bandpass", 0.11);
        blip(48, 0.5, "sawtooth", 0.08);
        break;
      case "heart":
        setTimeout(function () { blip(52, 0.22, "sine", 0.2); }, 0);
        setTimeout(function () { blip(46, 0.18, "sine", 0.14); }, 260);
        break;
      case "creak":
        blip(80, 1.1, "sawtooth", 0.035, 55);
        noiseBurst(0.9, 400, "bandpass", 0.03);
        break;
      case "whisper":
        noiseBurst(1.1, 1600, "bandpass", 0.045);
        break;
      case "click":
        blip(1100, 0.04, "square", 0.02);
        break;
      case "notify":
        blip(880, 0.09, "sine", 0.05);
        setTimeout(function () { blip(1318, 0.13, "sine", 0.04); }, 95);
        break;
      case "water":
        noiseBurst(0.5, 700, "lowpass", 0.05);
        break;
      default:
        break;
    }
  }

  function setMuted(v) {
    muted = !!v;
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.55, ctx.currentTime, 0.2);
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
    return muted;
  }

  function toggleMute() { return setMuted(!muted); }

  function resume() {
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  return {
    init: init,
    scene: setScene,
    sfx: sfx,
    toggleMute: toggleMute,
    setMuted: setMuted,
    isMuted: function () { return muted; },
    resume: resume
  };
})();
