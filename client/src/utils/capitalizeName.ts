

export function capitalizeName(name : string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const cap = (s : string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  if (parts.length === 1) return cap(parts[0]);
  return cap(parts[0]) + ' ' + cap(parts[parts.length - 1]);
}