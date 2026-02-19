// =============================================================================
// INDUSTRYVIEW BACKEND - BigInt Helpers
// Funcoes para conversao entre BigInt e Number
// Necessario devido ao Prisma gerar tipos bigint para campos SERIAL/BIGSERIAL
// =============================================================================

/**
 * Converte BigInt para number de forma segura
 * Usado para serializar valores do banco para respostas JSON
 *
 * @param value - Valor bigint ou number a ser convertido
 * @returns number ou null se o valor for null
 */
export const toNumber = (value: bigint | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  return typeof value === 'bigint' ? Number(value) : value;
};

/**
 * Converte number para BigInt
 * Usado para converter parametros de entrada para queries do Prisma
 *
 * @param value - Valor number a ser convertido
 * @returns bigint ou null se o valor for null
 */
export const toBigInt = (value: number | string | null | undefined): bigint | null => {
  if (value === null || value === undefined) return null;
  return BigInt(value);
};

/**
 * Serializa objeto convertendo BigInts e Decimals para numbers
 * Util para preparar objetos para resposta JSON (JSON.stringify nao suporta BigInt)
 * Tambem converte strings que representam numeros (Decimal do Prisma) para numbers
 *
 * @param obj - Objeto a ser serializado
 * @returns Objeto com BigInts e Decimals convertidos para numbers
 */
/**
 * Serializa objeto convertendo:
 * - BigInt -> Number
 * - Date -> Timestamp (number)
 * - Decimal strings (campos especificos) -> number
 * 
 * Substitui o uso de JSON.parse(JSON.stringify) para permitir a interceptacao de Dates
 * antes que eles sejam convertidos para string ISO.
 */
export const serializeBigInt = <T>(obj: T): T => {
  return transformValues(obj);
};

const transformValues = (value: any, key?: string): any => {
  if (value === null || value === undefined) return value; // Preserva null/undefined

  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(item => transformValues(item));
  }

  // Detecta objetos Decimal (Prisma/Decimal.js) que possuem estrutura { s, e, d }
  if (typeof value === 'object' && value !== null && 's' in value && 'e' in value && 'd' in value) {
    // Tenta converter usando .toNumber() se diponível, ou converte para Number
    // (Muitas implementações de Decimal possuem toNumber ou toString aceitável)
    // Se falhar, retorna 0 para evitar quebra no frontend.
    try {
      if (typeof value.toNumber === 'function') return value.toNumber();
      return Number(value);
    } catch (e) {
      return 0;
    }
  }

  if (typeof value === 'object') {
    const newObj: any = {};
    for (const k in value) {
      if (Object.prototype.hasOwnProperty.call(value, k)) {
        newObj[k] = transformValues(value[k], k);
      }
    }
    return newObj;
  }

  // Converte Decimal strings para number para campos especificos
  const decimalFields = ['weight', 'quantity', 'quantity_done', 'amount', 'price', 'total', 'completion_percentage'];
  if (key && typeof value === 'string' && decimalFields.includes(key)) {
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }

  return value;
};

/**
 * Converte um array de BigInts para numbers
 *
 * @param arr - Array de BigInts
 * @returns Array de numbers
 */
export const bigIntArrayToNumbers = (arr: bigint[]): number[] => {
  return arr.map(v => Number(v));
};

/**
 * Converte um array de numbers para BigInts
 *
 * @param arr - Array de numbers
 * @returns Array de BigInts
 */
export const numberArrayToBigInts = (arr: number[]): bigint[] => {
  return arr.map(v => BigInt(v));
};

/**
 * Type guard para verificar se um valor e BigInt
 *
 * @param value - Valor a verificar
 * @returns true se o valor for BigInt
 */
export const isBigInt = (value: unknown): value is bigint => {
  return typeof value === 'bigint';
};

/**
 * Converte ID de entrada (pode ser string ou number) para BigInt
 * Util para parametros de rotas que vem como string
 *
 * @param id - ID como string ou number
 * @returns BigInt
 */
export const parseId = (id: string | number): bigint => {
  return BigInt(id);
};

/**
 * Converte ID para number seguro
 * Util para retornar IDs em respostas JSON
 *
 * @param id - ID como BigInt, number ou null
 * @returns number ou null
 */
export const serializeId = (id: bigint | number | null | undefined): number | null => {
  return toNumber(id);
};

/**
 * Converte BigInt para number garantindo que nao e null
 * Lanca erro se o valor for null/undefined
 *
 * @param value - Valor bigint ou number a ser convertido
 * @returns number (nunca null)
 * @throws Error se o valor for null ou undefined
 */
export const toNumberRequired = (value: bigint | number | null | undefined): number => {
  if (value === null || value === undefined) {
    throw new Error('Value cannot be null or undefined');
  }
  return typeof value === 'bigint' ? Number(value) : value;
};

export default {
  toNumber,
  toNumberRequired,
  toBigInt,
  serializeBigInt,
  bigIntArrayToNumbers,
  numberArrayToBigInts,
  isBigInt,
  parseId,
  serializeId,
};
