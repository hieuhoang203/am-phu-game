export const soulPalettes = {
  jade: { name: "Ngọc bích", body: "#9ec8bc", face: "#c5ded2" },
  ice: { name: "Sương lam", body: "#83b9d5", face: "#c2e2ec" },
  amber: { name: "Đèn hổ phách", body: "#d1ae70", face: "#f0dcb0" },
  lilac: { name: "Khói tím", body: "#b39bd1", face: "#ded0ed" },
  rose: { name: "Sen hồng", body: "#cd98ae", face: "#f0ced8" },
} as const;
export type SoulAppearance = {
  palette: keyof typeof soulPalettes;
  eyes: "round" | "sleepy" | "cheeky";
  hat: "none" | "leaf" | "lantern" | "lotus" | "horns";
  aura: "none" | "spark" | "mist" | "orbit";
};
export const defaultAppearance: SoulAppearance = {
  palette: "jade",
  eyes: "round",
  hat: "none",
  aura: "none",
};
export const appearanceOptions = {
  eyes: { round: "Mắt tròn", sleepy: "Buồn ngủ", cheeky: "Tinh nghịch" },
  hat: {
    none: "Đầu trần",
    leaf: "Lá bùa xanh",
    lantern: "Đèn lồng",
    lotus: "Hoa sen",
    horns: "Sừng nhỏ",
  },
  aura: {
    none: "Không hào quang",
    spark: "Đốm sáng",
    mist: "Làn sương",
    orbit: "Vòng tinh tú",
  },
} as const;
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
export function normalizeAppearance(
  input: unknown,
  fallback: SoulAppearance = defaultAppearance,
): SoulAppearance {
  const v = object(input) ? input : {};
  return {
    palette:
      typeof v.palette === "string" && Object.hasOwn(soulPalettes, v.palette)
        ? (v.palette as SoulAppearance["palette"])
        : fallback.palette,
    eyes:
      typeof v.eyes === "string" &&
      Object.hasOwn(appearanceOptions.eyes, v.eyes)
        ? (v.eyes as SoulAppearance["eyes"])
        : fallback.eyes,
    hat:
      typeof v.hat === "string" && Object.hasOwn(appearanceOptions.hat, v.hat)
        ? (v.hat as SoulAppearance["hat"])
        : fallback.hat,
    aura:
      typeof v.aura === "string" &&
      Object.hasOwn(appearanceOptions.aura, v.aura)
        ? (v.aura as SoulAppearance["aura"])
        : fallback.aura,
  };
}
export function validAppearance(input: unknown): input is SoulAppearance {
  if (!object(input)) return false;
  const v = normalizeAppearance(input);
  return (["palette", "eyes", "hat", "aura"] as const).every(
    (k) => input[k] === v[k],
  );
}
