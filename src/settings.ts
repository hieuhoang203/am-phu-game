import {
  defaultAppearance,
  normalizeAppearance,
  type SoulAppearance,
} from "../shared/customization";
export interface GameSettings {
  version: 1;
  audio: {
    master: number;
    music: number;
    effects: number;
    muted: boolean;
    muteWhenHidden: boolean;
  };
  appearance: SoulAppearance;
  display: {
    particles: boolean;
    reduceMotion: boolean;
    showNames: boolean;
    highContrast: boolean;
    largeButtons: boolean;
    showKeys: boolean;
  };
}
export const SETTINGS_KEY = "am-phu.settings.v1";
export const defaultSettings: GameSettings = {
  version: 1,
  audio: {
    master: 65,
    music: 35,
    effects: 65,
    muted: true,
    muteWhenHidden: true,
  },
  appearance: defaultAppearance,
  display: {
    particles: true,
    reduceMotion: false,
    showNames: true,
    highContrast: false,
    largeButtons: false,
    showKeys: true,
  },
};
const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const percent = (v: unknown, fallback: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.round(Math.max(0, Math.min(100, v)))
    : fallback;
const bool = (v: unknown, fallback: boolean) =>
  typeof v === "boolean" ? v : fallback;
export function normalizeSettings(value: unknown): GameSettings {
  const root = record(value),
    audio = record(root.audio),
    display = record(root.display),
    d = defaultSettings;
  return {
    version: 1,
    audio: {
      master: percent(audio.master, d.audio.master),
      music: percent(audio.music, d.audio.music),
      effects: percent(audio.effects, d.audio.effects),
      muted: bool(audio.muted, d.audio.muted),
      muteWhenHidden: bool(audio.muteWhenHidden, d.audio.muteWhenHidden),
    },
    appearance: normalizeAppearance(root.appearance),
    display: Object.fromEntries(
      Object.entries(d.display).map(([key, val]) => [
        key,
        bool(display[key], val),
      ]),
    ) as GameSettings["display"],
  };
}
export function readSettings(): GameSettings {
  try {
    return normalizeSettings(
      JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null"),
    );
  } catch {
    return normalizeSettings(null);
  }
}
