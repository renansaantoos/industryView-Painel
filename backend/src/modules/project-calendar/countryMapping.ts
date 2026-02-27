const COUNTRY_TO_ISO: Record<string, string> = {
  'brasil': 'BR',
  'brazil': 'BR',
  'estados unidos': 'US',
  'united states': 'US',
  'eua': 'US',
  'usa': 'US',
  'argentina': 'AR',
  'chile': 'CL',
  'colombia': 'CO',
  'peru': 'PE',
  'mexico': 'MX',
  'méxico': 'MX',
  'uruguai': 'UY',
  'uruguay': 'UY',
  'paraguai': 'PY',
  'paraguay': 'PY',
  'bolivia': 'BO',
  'bolívia': 'BO',
  'equador': 'EC',
  'ecuador': 'EC',
  'venezuela': 'VE',
  'portugal': 'PT',
  'espanha': 'ES',
  'spain': 'ES',
  'franca': 'FR',
  'frança': 'FR',
  'france': 'FR',
  'alemanha': 'DE',
  'germany': 'DE',
  'italia': 'IT',
  'itália': 'IT',
  'italy': 'IT',
  'reino unido': 'GB',
  'united kingdom': 'GB',
  'canada': 'CA',
  'canadá': 'CA',
  'australia': 'AU',
  'austrália': 'AU',
  'japao': 'JP',
  'japão': 'JP',
  'japan': 'JP',
  'china': 'CN',
  'india': 'IN',
  'índia': 'IN',
  'africa do sul': 'ZA',
  'south africa': 'ZA',
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function resolveCountryCode(name: string | null | undefined): string | null {
  if (!name) return null;
  const normalized = normalize(name);
  return COUNTRY_TO_ISO[normalized] ?? null;
}

export function getAvailableCountries(): { name: string; code: string }[] {
  const seen = new Set<string>();
  const result: { name: string; code: string }[] = [];
  for (const [name, code] of Object.entries(COUNTRY_TO_ISO)) {
    if (!seen.has(code)) {
      seen.add(code);
      result.push({ name, code });
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}
