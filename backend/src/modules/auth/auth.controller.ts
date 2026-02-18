// =============================================================================
// INDUSTRYVIEW BACKEND - Auth Controller
// Controller de autenticacao
// Equivalente aos endpoints do api_group Authentication do Xano
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { AuthModuleService } from './auth.service';
import { AuthenticatedRequest } from '../../types';
import { logger } from '../../utils/logger';
import { serializeBigInt } from '../../utils/bigint';

/**
 * AuthController - Controller do modulo de autenticacao
 */
export class AuthController {
  /**
   * POST /auth/signup
   * Registra um novo usuario
   * Equivalente a: query "auth/signup" verb=POST do Xano (endpoint 403)
   */
  static async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthModuleService.signup(req.body);

      logger.info({ email: req.body.email }, 'User signed up successfully');

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Realiza login do usuario
   * Equivalente a: query "auth/login" verb=POST do Xano (endpoint 404)
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthModuleService.login(req.body);

      logger.info({ email: req.body.email }, 'User logged in successfully');

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   * Busca dados do usuario autenticado
   * Equivalente a: query "auth/me" verb=GET do Xano (endpoint 405)
   */
  static async me(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.auth!.id;
      const result = await AuthModuleService.getMe(userId);

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/daily-login
   * Login diario (app mobile)
   * Equivalente a: query "daily_login" verb=POST do Xano (endpoint 613)
   */
  static async dailyLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthModuleService.dailyLogin(email, password);

      logger.info({ email }, 'Daily login successful');

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me/app
   * Me para app mobile
   * Equivalente a: query "auth/me/app" verb=GET do Xano (endpoint 614)
   */
  static async meApp(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.auth!.id;
      const result = await AuthModuleService.getMeApp(userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // PASSWORD RECOVERY CONTROLLERS (SendGrid)
  // =============================================================================

  /**
   * POST /auth/sendgrid/send/code
   * Envia codigo de recuperacao para o email
   */
  static async sendRecoveryCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email_to_recover } = req.body;
      const result = await AuthModuleService.sendRecoveryCode(email_to_recover);

      logger.info({ email: email_to_recover }, 'Recovery code sent');

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/sendgrid/validate/code
   * Valida codigo de recuperacao
   */
  static async validateRecoveryCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { code, users_email } = req.body;
      const result = await AuthModuleService.validateRecoveryCode(code, users_email);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /auth/sendgrid/reset/pass
   * Reset de senha
   */
  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { is_valid, new_password, users_email } = req.body;
      const result = await AuthModuleService.resetPassword(is_valid, new_password, users_email);

      logger.info({ email: users_email }, 'Password reset successful');

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/sendgrid/validate
   * Valida servico SendGrid
   */
  static async validateSendgrid(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { to_email, subject, body } = req.body;
      const result = await AuthModuleService.validateSendgrid(to_email, subject, body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
