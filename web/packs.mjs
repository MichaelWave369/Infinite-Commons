// Commons Experience v0.1. Curated locally reviewed, data-only themes.
// Theme selections affect presentation only: never identity, permissions, or world nodes.
export const WORLD_NODES = Object.freeze([
  Object.freeze({ id: "commons.arrival", label: "Arrival Terrace", visibility: "public-demo" }),
  Object.freeze({ id: "commons.plaza", label: "Commons Promenade", visibility: "public-demo" }),
  Object.freeze({ id: "commons.bbs", label: "BBS Lounge", visibility: "public-demo" }),
  Object.freeze({ id: "phispace.example", label: "Example PhiSpace", visibility: "public-demo" }),
]);
export const WORLD_FINGERPRINT = WORLD_NODES.map((node) => node.id).join("|");
export const PALETTE_KEYS = Object.freeze([
  "skyTop", "skyBottom", "ridge", "ground", "wall", "amber", "neon", "haze"
]);
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const SAFE_ID = /^[a-z][a-z0-9-]{1,39}$/;
const SCENES = new Set(["city", "floating"]);
const entry = (id, name, mood, scene, featured, colors) => ({
  id, name, mood, scene, featured,
  palette: Object.fromEntries(PALETTE_KEYS.map((key, index) => [key, colors[index]]))
});

// Original starter palette studies. Two packs have scene-level treatments;
// the other eighteen are preview palettes awaiting community-made art assets.
export const PACKS = Object.freeze([
  entry("midnight-sierra", "Midnight Sierra", "Blue-hour mystery · amber windows", "city", true,
    ["#052b5b", "#0877b1", "#123963", "#061a39", "#14568a", "#ffad65", "#6bdcff", "#0a3655"]),
  entry("ansi-alley", "ANSI Alley", "BBS terminals · glowing phosphor", "city", false,
    ["#020e14", "#12362b", "#09241f", "#061412", "#0b2924", "#f7b34f", "#5dffc6", "#132c27"]),
  entry("sunset-circuit", "Sunset Circuit", "Analog horizons · pastel nostalgia", "city", false,
    ["#492064", "#df6783", "#774676", "#3e1d57", "#875382", "#ffd480", "#7bffeb", "#834a86"]),
  entry("neon-bazaar", "Neon Bazaar", "Night markets · electric streets", "city", false,
    ["#0d1333", "#372f78", "#241b55", "#130c30", "#393261", "#ffa459", "#fc64db", "#1b1746"]),
  entry("solar-porch", "Solar Porch", "Sunny gardens · cooperative streets", "floating", false,
    ["#75b8d4", "#f2d49e", "#8cae98", "#427e64", "#e6cfac", "#f6bd64", "#8ce5bd", "#d3ecd4"]),
  entry("cloudgarden", "Cloudgarden", "Floating islands · gentle possibility", "floating", true,
    ["#497ed0", "#bcdded", "#6e96b3", "#396d88", "#d5eaf2", "#ffcb83", "#70f0d9", "#aaddec"]),
  entry("clockwork-quarter", "Clockwork Quarter", "Copper towers · mechanical wonder", "city", false,
    ["#173048", "#9b6f59", "#544741", "#251f2c", "#80634f", "#ffcb83", "#9ee3d7", "#5d4944"]),
  entry("monolith", "Monolith", "Concrete geometry · quiet horizons", "city", false,
    ["#202f43", "#607184", "#343b4f", "#181d2c", "#566576", "#edc99a", "#b7d0e6", "#4e5b65"]),
  entry("dreamfold", "Dreamfold", "Impossible structures · nested worlds", "floating", false,
    ["#292469", "#976ccc", "#555293", "#332e6e", "#8675c3", "#ffcfb6", "#a7fdff", "#6657a2"]),
  entry("athenaeum", "The Athenaeum", "Warm libraries · midnight inquiry", "city", false,
    ["#1b243d", "#565b7c", "#353751", "#181c33", "#4d4a60", "#f4c77c", "#b3d3f9", "#414259"]),
  entry("astral-harbor", "Astral Harbor", "Star docks · orbital avenues", "city", false,
    ["#070c35", "#2e3d9a", "#1b2675", "#111344", "#263e7b", "#ff9f82", "#96e9ff", "#222f72"]),
  entry("abyssal-lantern", "Abyssal Lantern", "Bioluminescent coral · glass domes", "floating", false,
    ["#002244", "#036e86", "#09566d", "#043b50", "#116b86", "#fbd099", "#66f5de", "#15718b"]),
  entry("canopy-commons", "Canopy Commons", "Treehouse paths · living canopies", "floating", false,
    ["#1a4851", "#8fb99f", "#397d69", "#24593e", "#79a48a", "#f3c77b", "#a6ebcb", "#629c7a"]),
  entry("dune-observatory", "Dune Observatory", "Sandstone horizons · constellations", "city", false,
    ["#1e315b", "#bb7f75", "#895c67", "#55374a", "#aa8079", "#ffca80", "#bce5ff", "#996e79"]),
  entry("noir-avenue", "Noir Avenue", "Rainy streets · monochrome jazz", "city", false,
    ["#111820", "#3c4954", "#303741", "#0f1720", "#59636b", "#efdab5", "#c2d1d5", "#293743"]),
  entry("pixel-carnival", "Pixel Carnival", "Arcade districts · playful colors", "city", false,
    ["#302369", "#ac46bc", "#6639a0", "#301451", "#7a42b0", "#ffc46a", "#8bfff3", "#6c3391"]),
  entry("aurora-haven", "Aurora Haven", "Arctic villages · northern lights", "floating", false,
    ["#0d2247", "#297779", "#205b68", "#112e4c", "#39748b", "#ffbd97", "#8cffe0", "#275d72"]),
  entry("papercraft-city", "Papercraft City", "Storybook streets · tactile wonder", "city", false,
    ["#577da2", "#d7a1a6", "#9d8494", "#52627c", "#d4bec0", "#ffdb9e", "#99f0e4", "#aa8794"]),
  entry("golden-meridian", "Golden Meridian", "Art Deco avenues · brass reflections", "city", false,
    ["#0f3041", "#41727a", "#2f4e54", "#102933", "#37606a", "#ffd185", "#a1e9e0", "#2b5960"]),
  entry("domistika-morph", "Domistika Morph", "Living geometry · shifting forms", "floating", false,
    ["#262063", "#8457b3", "#524a91", "#31276c", "#7460a8", "#ffbfaa", "#77f7e7", "#594792"]),
]);

export function validatePack(pack) {
  if (!pack || typeof pack !== "object" || Array.isArray(pack)) return false;
  const keys = Object.keys(pack).sort().join(",");
  if (keys !== "featured,id,mood,name,palette,scene") return false;
  if (!SAFE_ID.test(pack.id) || typeof pack.name !== "string" || pack.name.length > 60 ||
      !pack.name.trim() || typeof pack.mood !== "string" || pack.mood.length > 120 ||
      !pack.mood.trim() || typeof pack.featured !== "boolean" || !SCENES.has(pack.scene)) return false;
  if (!pack.palette || typeof pack.palette !== "object" || Array.isArray(pack.palette)) return false;
  if (Object.keys(pack.palette).sort().join(",") !== [...PALETTE_KEYS].sort().join(",")) return false;
  return PALETTE_KEYS.every((key) => typeof pack.palette[key] === "string" &&
    HEX_COLOR.test(pack.palette[key]));
}

if (new Set(PACKS.map((pack) => pack.id)).size !== PACKS.length ||
    !PACKS.every(validatePack)) {
  throw new Error("Commons style catalog is invalid");
}

export function resolvePack(id) {
  return PACKS.find((pack) => pack.id === id) ?? PACKS[0];
}

export function styleVariables(pack) {
  if (!validatePack(pack)) throw new TypeError("Invalid presentation-only style pack");
  return Object.fromEntries(PALETTE_KEYS.map((key) => [
    "--" + key.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase()), pack.palette[key]
  ]));
}
