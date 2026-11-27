export interface AppTheme {
  id: string;
  label: string;
  description: string;
}

export const MODE_STORAGE_KEY = "mode-watcher-mode";
export const THEME_STORAGE_KEY = "mode-watcher-theme";

export const DEFAULT_THEME_ID = "catppuccin";

export const APP_THEMES: readonly AppTheme[] = [
  {
    id: "catppuccin",
    label: "Catppuccin",
    description: "Soft pastel dark-first theme",
  },
  {
    id: "cerberus",
    label: "Cerberus",
    description: "Skeleton default neutral theme",
  },
  { id: "concord", label: "Concord", description: "Clean slate gray theme" },
  { id: "crimson", label: "Crimson", description: "Bold red accent theme" },
  { id: "dracula", label: "Dracula", description: "Classic dark purple theme" },
  { id: "fennec", label: "Fennec", description: "Warm desert orange theme" },
  { id: "hamlindigo", label: "Hamlindigo", description: "Deep indigo theme" },
  { id: "legacy", label: "Legacy", description: "Original Skeleton theme" },
  { id: "mint", label: "Mint", description: "Fresh green theme" },
  { id: "modern", label: "Modern", description: "Minimal monochrome theme" },
  { id: "mona", label: "Mona", description: "Warm orange and stone theme" },
  { id: "nosh", label: "Nosh", description: "Playful amber theme" },
  { id: "nouveau", label: "Nouveau", description: "Elegant art-deco theme" },
  { id: "pine", label: "Pine", description: "Forest green theme" },
  { id: "reign", label: "Reign", description: "Royal purple theme" },
  { id: "rocket", label: "Rocket", description: "Vibrant violet theme" },
  { id: "rose", label: "Rose", description: "Soft pink theme" },
  {
    id: "rosepine",
    label: "Rosé Pine",
    description: "Muted pine and rose theme",
  },
  { id: "sahara", label: "Sahara", description: "Warm sand theme" },
  { id: "seafoam", label: "Seafoam", description: "Cool ocean teal theme" },
  { id: "terminus", label: "Terminus", description: "Terminal green theme" },
  { id: "vintage", label: "Vintage", description: "Retro cream theme" },
  { id: "vox", label: "Vox", description: "High-contrast orange theme" },
  { id: "wintry", label: "Wintry", description: "Cool slate blue theme" },
] as const;

const THEME_IDS = new Set(APP_THEMES.map((item) => item.id));

export type ModePreference = "light" | "dark" | "system";

export const DEFAULT_MODE_PREFERENCE: ModePreference = "system";

export function normalizeModePreference(value: unknown): ModePreference {
  if (value === "light") {
    return "light";
  }
  if (value === "dark") {
    return "dark";
  }
  if (value === "system") {
    return "system";
  }
  return DEFAULT_MODE_PREFERENCE;
}

export function isAppThemeId(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  return THEME_IDS.has(value);
}

export function normalizeThemeId(value: unknown): string {
  if (isAppThemeId(value)) {
    return value;
  }
  return DEFAULT_THEME_ID;
}

export function getThemeById(id: string): AppTheme {
  const found = APP_THEMES.find((item) => item.id === id);
  if (found === undefined) {
    return APP_THEMES[0];
  }
  return found;
}
