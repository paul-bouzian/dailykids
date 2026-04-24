"use client";

import confetti from "canvas-confetti";

export function celebrate(originX?: number, originY?: number) {
  const x = originX ?? 0.5;
  const y = originY ?? 0.5;
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    origin: { x, y },
    scalar: 0.9,
    colors: ["#F5A623", "#3BB0E8", "#FF8FAB", "#6EC46E", "#A78BFA", "#F7D154"],
  });
  try {
    if ("vibrate" in navigator) navigator.vibrate([30, 30, 30]);
  } catch {}
  playDing();
}

let audioCtx: AudioContext | null = null;
function playDing() {
  try {
    if (typeof window === "undefined") return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const notes = [880, 1175, 1568];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  } catch {}
}
