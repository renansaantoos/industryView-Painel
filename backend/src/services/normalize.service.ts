// =============================================================================
// INDUSTRYVIEW BACKEND - Normalize Service
// Servico para normalizacao de dados
// Equivalente a: function normalize do Xano
// =============================================================================

import { db } from '../config/database';
import { normalizeText } from '../utils/helpers';
import { logger } from '../utils/logger';

/**
 * NormalizeService - Servico para normalizacao de textos em tabelas
 * Equivalente a function normalize do Xano
 *
 * Usado para manter campos *_normalized atualizados para busca case-insensitive
 */
export class NormalizeService {
  /**
   * Normaliza todos os registros de manufacturers
   * Equivalente a: function normalize do Xano
   */
  static async normalizeManufacturers(): Promise<number> {
    try {
      const manufacturers = await db.manufacturers.findMany({
        where: { deleted_at: null },
      });

      let count = 0;
      for (const item of manufacturers) {
        if (item.name) {
          await db.manufacturers.update({
            where: { id: item.id },
            data: {
              name_normalized: normalizeText(item.name),
            },
          });
          count++;
        }
      }

      logger.info({ count }, 'Manufacturers normalized');
      return count;
    } catch (error) {
      logger.error({ error }, 'Error normalizing manufacturers');
      return 0;
    }
  }

  /**
   * Normaliza todos os registros de users
   */
  static async normalizeUsers(): Promise<number> {
    try {
      const users = await db.users.findMany({
        where: { deleted_at: null },
      });

      let count = 0;
      for (const item of users) {
        if (item.name) {
          await db.users.update({
            where: { id: item.id },
            data: {
              name_normalized: normalizeText(item.name),
            },
          });
          count++;
        }
      }

      logger.info({ count }, 'Users normalized');
      return count;
    } catch (error) {
      logger.error({ error }, 'Error normalizing users');
      return 0;
    }
  }

  /**
   * Normaliza todos os registros de projects
   */
  static async normalizeProjects(): Promise<number> {
    try {
      const projects = await db.projects.findMany({
        where: { deleted_at: null },
      });

      let count = 0;
      for (const item of projects) {
        const updateData: Record<string, string> = {};

        if (item.name) {
          updateData.name_normalized = normalizeText(item.name);
        }

        if (Object.keys(updateData).length > 0) {
          await db.projects.update({
            where: { id: item.id },
            data: updateData,
          });
          count++;
        }
      }

      logger.info({ count }, 'Projects normalized');
      return count;
    } catch (error) {
      logger.error({ error }, 'Error normalizing projects');
      return 0;
    }
  }

  /**
   * Normaliza todos os registros de product_inventory
   * (Tabela correta para produtos - nao existe tabela 'products')
   */
  static async normalizeProductInventory(): Promise<number> {
    try {
      const products = await db.product_inventory.findMany({
        where: { deleted_at: null },
      });

      let count = 0;
      for (const item of products) {
        if (item.product) {
          await db.product_inventory.update({
            where: { id: item.id },
            data: {
              product_normalized: normalizeText(item.product),
            },
          });
          count++;
        }
      }

      logger.info({ count }, 'Product inventory normalized');
      return count;
    } catch (error) {
      logger.error({ error }, 'Error normalizing product inventory');
      return 0;
    }
  }

  /**
   * Normaliza todos os registros de tasks_template
   */
  static async normalizeTasksTemplate(): Promise<number> {
    try {
      const tasks = await db.tasks_template.findMany({
        where: { deleted_at: null },
      });

      let count = 0;
      for (const item of tasks) {
        if (item.description) {
          await db.tasks_template.update({
            where: { id: item.id },
            data: {
              description_normalized: normalizeText(item.description),
            },
          });
          count++;
        }
      }

      logger.info({ count }, 'Tasks template normalized');
      return count;
    } catch (error) {
      logger.error({ error }, 'Error normalizing tasks template');
      return 0;
    }
  }

  /**
   * Normaliza todos os registros de projects_backlogs
   */
  static async normalizeProjectsBacklogs(): Promise<number> {
    try {
      const backlogs = await db.projects_backlogs.findMany({
        where: { deleted_at: null },
      });

      let count = 0;
      for (const item of backlogs) {
        if (item.description) {
          await db.projects_backlogs.update({
            where: { id: item.id },
            data: {
              description_normalized: normalizeText(item.description),
            },
          });
          count++;
        }
      }

      logger.info({ count }, 'Projects backlogs normalized');
      return count;
    } catch (error) {
      logger.error({ error }, 'Error normalizing projects backlogs');
      return 0;
    }
  }

  /**
   * Normaliza todos os registros de subtasks
   */
  static async normalizeSubtasks(): Promise<number> {
    try {
      const subtasks = await db.subtasks.findMany({
        where: { deleted_at: null },
      });

      let count = 0;
      for (const item of subtasks) {
        if (item.description) {
          await db.subtasks.update({
            where: { id: item.id },
            data: {
              description_normalized: normalizeText(item.description),
            },
          });
          count++;
        }
      }

      logger.info({ count }, 'Subtasks normalized');
      return count;
    } catch (error) {
      logger.error({ error }, 'Error normalizing subtasks');
      return 0;
    }
  }

  /**
   * Normaliza todos os registros de users_roles
   */
  static async normalizeUsersRoles(): Promise<number> {
    try {
      const roles = await db.users_roles.findMany({
        where: { deleted_at: null },
      });

      let count = 0;
      for (const item of roles) {
        if (item.role) {
          await db.users_roles.update({
            where: { id: item.id },
            data: {
              role_normalized: normalizeText(item.role),
            },
          });
          count++;
        }
      }

      logger.info({ count }, 'Users roles normalized');
      return count;
    } catch (error) {
      logger.error({ error }, 'Error normalizing users roles');
      return 0;
    }
  }

  /**
   * Normaliza todos os registros de trackers_types
   */
  static async normalizeTrackersTypes(): Promise<number> {
    try {
      const types = await db.trackers_types.findMany({
        where: { deleted_at: null },
      });

      let count = 0;
      for (const item of types) {
        if (item.type) {
          await db.trackers_types.update({
            where: { id: item.id },
            data: {
              type_normalized: normalizeText(item.type),
            },
          });
          count++;
        }
      }

      logger.info({ count }, 'Trackers types normalized');
      return count;
    } catch (error) {
      logger.error({ error }, 'Error normalizing trackers types');
      return 0;
    }
  }

  /**
   * Normaliza todos os registros de modules_types
   */
  static async normalizeModulesTypes(): Promise<number> {
    try {
      const types = await db.modules_types.findMany({
        where: { deleted_at: null },
      });

      let count = 0;
      for (const item of types) {
        if (item.type) {
          await db.modules_types.update({
            where: { id: item.id },
            data: {
              type_normalized: normalizeText(item.type),
            },
          });
          count++;
        }
      }

      logger.info({ count }, 'Modules types normalized');
      return count;
    } catch (error) {
      logger.error({ error }, 'Error normalizing modules types');
      return 0;
    }
  }

  /**
   * Normaliza todas as tabelas
   */
  static async normalizeAll(): Promise<Record<string, number>> {
    const results: Record<string, number> = {};

    results.manufacturers = await this.normalizeManufacturers();
    results.users = await this.normalizeUsers();
    results.projects = await this.normalizeProjects();
    results.productInventory = await this.normalizeProductInventory();
    results.tasksTemplate = await this.normalizeTasksTemplate();
    results.projectsBacklogs = await this.normalizeProjectsBacklogs();
    results.subtasks = await this.normalizeSubtasks();
    results.usersRoles = await this.normalizeUsersRoles();
    results.trackersTypes = await this.normalizeTrackersTypes();
    results.modulesTypes = await this.normalizeModulesTypes();

    logger.info({ results }, 'All tables normalized');
    return results;
  }

  /**
   * Normaliza um texto especifico
   * Utility function para uso em outros servicos
   */
  static normalize(text: string | null | undefined): string {
    return normalizeText(text);
  }
}

export default NormalizeService;
