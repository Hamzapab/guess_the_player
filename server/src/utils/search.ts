export const normalize = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');