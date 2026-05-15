import { api } from "@/lib/api";

let cachedLogo = null;

export async function getLogo() {
  if (cachedLogo) return cachedLogo;
  try {
    const { data } = await api.get("/settings/logo");
    cachedLogo = data.logo;
    return cachedLogo;
  } catch {
    return null;
  }
}

export function clearLogoCache() {
  cachedLogo = null;
}
