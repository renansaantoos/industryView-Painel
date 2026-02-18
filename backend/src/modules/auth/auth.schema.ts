// =============================================================================
// INDUSTRYVIEW BACKEND - Auth Schemas
// Schemas de validacao para endpoints de autenticacao
// Equivalente aos input definitions do Xano
// =============================================================================

import { z } from 'zod';

/**
 * Schema para signup
 * Equivalente a: query "auth/signup" verb=POST do Xano
 */
export const signupSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio').trim(),
  email: z.string().email('Email invalido').trim().toLowerCase(),
  phone: z.string().optional().transform(val => val?.trim()),
  password_hash: z
    .string()
    .min(8, 'Senha deve ter no minimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiuscula')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um simbolo'),
  env_from_create: z.number().optional().default(1),
  user_system_access: z.number().optional().default(3),
  user_control_system: z.number().optional().default(2),
  user_role_type: z.number().optional().default(5),
  // profile_picture seria tratado via multer
});

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Schema para login
 * Equivalente a: query "auth/login" verb=POST do Xano
 */
export const loginSchema = z.object({
  email: z.string().email('Email invalido').trim().toLowerCase(),
  password_hash: z.string().min(1, 'Senha e obrigatoria'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema para daily login (app)
 * Equivalente a: query "daily_login" verb=POST do Xano
 */
export const dailyLoginSchema = z.object({
  email: z.string().email('Email invalido').trim().toLowerCase().optional(),
  password: z.string().optional(),
});

export type DailyLoginInput = z.infer<typeof dailyLoginSchema>;

/**
 * Schema para refresh token
 */
export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token e obrigatorio'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
