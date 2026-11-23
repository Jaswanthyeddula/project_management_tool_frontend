import { AVATAR_COLORS } from "./constants";

export function initials(name) {
  if (!name) return "U";
  return name.trim().split(" ").filter(Boolean).map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

export function colorFor(name) {
  if (!name) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
