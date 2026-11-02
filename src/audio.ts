import type { GameSettings } from "./settings";
export type SoundCue =
  | "click"
  | "bonk"
  | "push"
  | "throw"
  | "rescue"
  | "guard"
  | "banana"
  | "error"
  | "message"
  | "recover";
/** Audio is created only after a user gesture. All sources route through the three live volume controls. */
export class GameAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private music?: GainNode;
  private effects?: GainNode;
  private settings?: GameSettings["audio"];
  private focused = true;
  private lastCue = 0;
  configure(settings: GameSettings["audio"]) {
    this.settings = settings;
    this.update();
  }
  setFocused(focused: boolean) {
    this.focused = focused;
    this.update();
  }
  private update() {
    if (!this.context || !this.settings) return;
    const s = this.settings,
      t = this.context.currentTime;
    this.master!.gain.setTargetAtTime(
      s.muted || (!this.focused && s.muteWhenHidden) ? 0 : s.master / 100,
      t,
      0.025,
    );
    this.music!.gain.setTargetAtTime((s.music / 100) * 0.025, t, 0.04);
    this.effects!.gain.setTargetAtTime((s.effects / 100) * 0.12, t, 0.025);
  }
  async unlock() {
    try {
      if (!this.context) {
        const ctx = new AudioContext();
        this.context = ctx;
        this.master = ctx.createGain();
        this.master.gain.value = 0;
        this.master.connect(ctx.destination);
        this.music = ctx.createGain();
        this.music.gain.value = 0;
        this.music.connect(this.master);
        this.effects = ctx.createGain();
        this.effects.connect(this.master);
        [110, 164.81, 220].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.value = freq + (i === 2 ? 0.35 : 0);
          osc.connect(this.music!);
          osc.start();
        });
        this.update();
      }
      if (this.context.state === "suspended") await this.context.resume();
      return this.context.state === "running";
    } catch {
      return false;
    }
  }
  play(cue: SoundCue) {
    const ctx = this.context,
      s = this.settings;
    if (
      !ctx ||
      ctx.state !== "running" ||
      !s ||
      s.muted ||
      s.master === 0 ||
      s.effects === 0 ||
      (!this.focused && s.muteWhenHidden) ||
      Date.now() - this.lastCue < 70
    )
      return;
    this.lastCue = Date.now();
    const frequencies: Record<SoundCue, [number, number]> = {
      click: [520, 710],
      bonk: [210, 90],
      push: [150, 75],
      throw: [410, 95],
      rescue: [520, 880],
      guard: [720, 280],
      banana: [430, 190],
      error: [170, 130],
      message: [640, 760],
      recover: [330, 660],
    };
    const [from, to] = frequencies[cue],
      osc = ctx.createOscillator(),
      gain = ctx.createGain(),
      t = ctx.currentTime;
    osc.type = ["bonk", "push", "throw"].includes(cue) ? "triangle" : "sine";
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + 0.16);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.7, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.23);
    osc.connect(gain);
    gain.connect(this.effects!);
    osc.start(t);
    osc.stop(t + 0.24);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
  async dispose() {
    await this.context?.close();
    this.context = undefined;
  }
}
