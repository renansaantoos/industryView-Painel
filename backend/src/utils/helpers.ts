// =============================================================================
// INDUSTRYVIEW BACKEND - Helper Functions
// Funcoes utilitarias equivalentes aos filters e expressoes do Xano
// =============================================================================

import crypto from 'crypto';

/**
 * Normaliza texto removendo acentos e convertendo para lowercase
 * Equivalente a: $value|to_lower|unaccent do Xano
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Remove espacos em branco do inicio e fim
 * Equivalente a: filters=trim do Xano
 */
export function trim(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim();
}

/**
 * Converte para lowercase
 * Equivalente a: filters=lower ou |to_lower do Xano
 */
export function toLowerCase(value: string | null | undefined): string {
  if (!value) return '';
  return value.toLowerCase();
}

/**
 * Converte para uppercase
 * Equivalente a: |to_upper do Xano
 */
export function toUpperCase(value: string | null | undefined): string {
  if (!value) return '';
  return value.toUpperCase();
}

/**
 * Gera um codigo aleatorio de 6 digitos
 * Equivalente a: security.random_number { min = 100000, max = 999999 } do Xano
 */
export function generateRandomCode(min: number = 100000, max: number = 999999): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera uma senha aleatoria segura
 * Equivalente a: security.create_password do Xano
 */
export function generateRandomPassword(options: {
  length?: number;
  requireLowercase?: boolean;
  requireUppercase?: boolean;
  requireDigit?: boolean;
  requireSymbol?: boolean;
  symbolWhitelist?: string;
} = {}): string {
  const {
    length = 8,
    requireLowercase = true,
    requireUppercase = true,
    requireDigit = true,
    requireSymbol = false,
    symbolWhitelist = '!@#$%^&*',
  } = options;

  let chars = '';
  let password = '';

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';

  if (requireLowercase) {
    chars += lowercase;
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
  }
  if (requireUppercase) {
    chars += uppercase;
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
  }
  if (requireDigit) {
    chars += digits;
    password += digits[Math.floor(Math.random() * digits.length)];
  }
  if (requireSymbol && symbolWhitelist) {
    chars += symbolWhitelist;
    password += symbolWhitelist[Math.floor(Math.random() * symbolWhitelist.length)];
  }

  // Fill remaining length
  while (password.length < length) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Gera UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Formata timestamp para string
 * Equivalente a: |format_timestamp do Xano
 */
export function formatTimestamp(
  date: Date | string | number | null | undefined,
  format: string = 'Y-m-d',
  _timezone: string = 'America/Sao_Paulo'
): string {
  if (!date) return '';

  const d = new Date(date);

  // Simple format replacements (PHP-like)
  const replacements: Record<string, string> = {
    'Y': d.getFullYear().toString(),
    'm': String(d.getMonth() + 1).padStart(2, '0'),
    'd': String(d.getDate()).padStart(2, '0'),
    'H': String(d.getHours()).padStart(2, '0'),
    'i': String(d.getMinutes()).padStart(2, '0'),
    's': String(d.getSeconds()).padStart(2, '0'),
  };

  let result = format;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }

  return result;
}

/**
 * Obtem a data atual no timezone especificado
 */
export function now(_timezone: string = 'America/Sao_Paulo'): Date {
  return new Date();
}

/**
 * Obtem a data de hoje no formato YYYY-MM-DD
 */
export function today(_timezone: string = 'America/Sao_Paulo'): string {
  return formatTimestamp(new Date(), 'Y-m-d', _timezone);
}

/**
 * Calcula paginacao
 * Equivalente a: paging do Xano
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  perPage: number = 20
): {
  items: T[];
  curPage: number;
  perPage: number;
  itemsReceived: number;
  itemsTotal: number;
  pageTotal: number;
} {
  const total = items.length;
  const pageTotal = Math.ceil(total / perPage);
  const offset = (page - 1) * perPage;
  const paginatedItems = items.slice(offset, offset + perPage);

  return {
    items: paginatedItems,
    curPage: page,
    perPage,
    itemsReceived: paginatedItems.length,
    itemsTotal: total,
    pageTotal,
  };
}

/**
 * Deep merge de objetos
 * Equivalente a: |set do Xano
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;

  const source = sources.shift();
  if (source === undefined) return target;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key as keyof T];
      const targetValue = target[key as keyof T];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        target[key as keyof T] = deepMerge(
          { ...targetValue } as object,
          sourceValue as object
        ) as T[keyof T];
      } else {
        target[key as keyof T] = sourceValue as T[keyof T];
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Verifica se um valor esta vazio (null, undefined, string vazia, array vazio)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Garante que o valor seja um array
 */
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Gera URL de QR Code
 * Equivalente ao padrao usado no Xano para gerar QR codes
 */
export function generateQRCodeUrl(data: string | number, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}x${size}`;
}

/**
 * Concatena strings
 * Equivalente a: |concat do Xano
 */
export function concat(...parts: (string | number | null | undefined)[]): string {
  return parts.filter(p => p !== null && p !== undefined).join('');
}

/**
 * Sanitiza input removendo caracteres potencialmente perigosos
 */
export function sanitizeInput(value: string): string {
  return value
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove special chars
    .trim();
}

/**
 * Mascara email para exibicao
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const maskedLocal = localPart.length > 2
    ? `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`
    : '*'.repeat(localPart.length);

  return `${maskedLocal}@${domain}`;
}

/**
 * Calcula porcentagem
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 10000) / 100;
}

/**
 * Constroi resposta de paginacao no formato do Xano
 * Equivalente a: paging response do Xano
 *
 * @param items - Array de itens ja paginados
 * @param total - Total de itens antes da paginacao
 * @param page - Pagina atual
 * @param perPage - Itens por pagina
 */
export function buildPaginationResponse<T>(
  items: T[],
  total: number,
  page: number = 1,
  perPage: number = 20
): {
  items: T[];
  curPage: number;
  perPage: number;
  itemsReceived: number;
  itemsTotal: number;
  pageTotal: number;
} {
  const pageTotal = Math.ceil(total / perPage);

  return {
    items,
    curPage: page,
    perPage,
    itemsReceived: items.length,
    itemsTotal: total,
    pageTotal,
  };
}
