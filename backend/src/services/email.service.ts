// =============================================================================
// INDUSTRYVIEW BACKEND - Email Service
// Servico de envio de emails via SendGrid
// Equivalente a: sendgrid_basic_send e sendgrid_dynamic_send do Xano
// =============================================================================

import sgMail from '@sendgrid/mail';
import { config } from '../config/env';
import { ExternalServiceError } from '../utils/errors';
import { externalLogger } from '../utils/logger';

// Inicializa o SendGrid com a API key
if (config.sendgrid.apiKey) {
  sgMail.setApiKey(config.sendgrid.apiKey);
}

export interface SendBasicEmailParams {
  to: string;
  subject: string;
  body: string;
}

export interface SendDynamicEmailParams {
  to: string;
  templateId: string;
  data?: Record<string, unknown>;
}

/**
 * EmailService - Servico para envio de emails
 * Equivalente as functions sendgrid_basic_send e sendgrid_dynamic_send do Xano
 */
export class EmailService {
  /**
   * Verifica se o SendGrid esta configurado
   */
  private static checkConfiguration(): void {
    if (!config.sendgrid.apiKey) {
      throw new ExternalServiceError(
        'SendGrid',
        'SendGrid API key not configured. Please set SENDGRID_API_KEY environment variable.'
      );
    }

    if (!config.sendgrid.fromEmail) {
      throw new ExternalServiceError(
        'SendGrid',
        'SendGrid from email not configured. Please set SENDGRID_FROM_EMAIL environment variable.'
      );
    }
  }

  /**
   * Envia um email de texto simples
   * Equivalente a: sendgrid_basic_send do Xano
   *
   * @param params - Parametros do email
   */
  static async sendBasic(params: SendBasicEmailParams): Promise<void> {
    this.checkConfiguration();

    const { to, subject, body } = params;

    const msg = {
      to,
      from: {
        email: config.sendgrid.fromEmail!,
        name: config.sendgrid.fromName,
      },
      subject,
      text: body,
    };

    try {
      externalLogger.info({ to, subject }, 'Sending basic email');

      const [response] = await sgMail.send(msg);

      if (response.statusCode !== 202) {
        throw new ExternalServiceError(
          'SendGrid',
          `Failed to send email. Status: ${response.statusCode}`
        );
      }

      externalLogger.info({ to, subject }, 'Basic email sent successfully');
    } catch (error: unknown) {
      externalLogger.error({ error, to, subject }, 'Failed to send basic email');

      // @ts-ignore - SendGrid error structure
      const errorMessage = error?.response?.body?.errors?.[0]?.message || 'Failed to send email';
      throw new ExternalServiceError('SendGrid', errorMessage);
    }
  }

  /**
   * Envia um email usando um template dinamico do SendGrid
   * Equivalente a: sendgrid_dynamic_send do Xano
   *
   * @param params - Parametros do email com template
   */
  static async sendDynamic(params: SendDynamicEmailParams): Promise<void> {
    this.checkConfiguration();

    const { to, templateId, data = {} } = params;

    const msg = {
      to,
      from: {
        email: config.sendgrid.fromEmail!,
        name: config.sendgrid.fromName,
      },
      templateId,
      dynamicTemplateData: data,
    };

    try {
      externalLogger.info({ to, templateId }, 'Sending dynamic email');

      const [response] = await sgMail.send(msg);

      if (response.statusCode !== 202) {
        throw new ExternalServiceError(
          'SendGrid',
          `Failed to send email. Status: ${response.statusCode}`
        );
      }

      externalLogger.info({ to, templateId }, 'Dynamic email sent successfully');
    } catch (error: unknown) {
      externalLogger.error({ error, to, templateId }, 'Failed to send dynamic email');

      // @ts-ignore - SendGrid error structure
      const errorMessage = error?.response?.body?.errors?.[0]?.message || 'Failed to send email';
      throw new ExternalServiceError('SendGrid', errorMessage);
    }
  }

  /**
   * Envia email de boas-vindas com senha temporaria
   * Usado no cadastro de usuarios
   */
  static async sendWelcomeEmail(
    to: string,
    name: string,
    password: string
  ): Promise<void> {
    await this.sendDynamic({
      to,
      templateId: config.sendgrid.templates.welcome,
      data: {
        name,
        password,
      },
    });
  }

  /**
   * Envia email de recuperacao de senha com codigo
   * Equivalente ao fluxo de sendgrid_send_code do Xano
   */
  static async sendPasswordResetCode(
    to: string,
    name: string,
    code: number
  ): Promise<void> {
    await this.sendDynamic({
      to,
      templateId: config.sendgrid.templates.passwordReset,
      data: {
        name,
        code,
      },
    });
  }
}

export default EmailService;
