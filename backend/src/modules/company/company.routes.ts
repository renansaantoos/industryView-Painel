// =============================================================================
// INDUSTRYVIEW BACKEND - Company Routes
// Rotas do modulo de empresa (matriz/filiais)
// =============================================================================

import { Router } from 'express';
import { CompanyController } from './company.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody, validateParams } from '../../middleware/validation';
import {
  companyParamsSchema,
  branchParamsSchema,
  updateCompanySchema,
  createBranchSchema,
  updateBranchSchema,
} from './company.schema';

const router = Router();

// =============================================================================
// ROTAS DA MATRIZ
// =============================================================================

/**
 * @swagger
 * /api/v1/company/{company_id}:
 *   get:
 *     summary: Busca empresa (matriz) com suas filiais ativas
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados da empresa com filiais
 *       403:
 *         description: Acesso negado a esta empresa
 *       404:
 *         description: Empresa nao encontrada
 */
router.get(
  '/:company_id',
  authenticate,
  validateParams(companyParamsSchema),
  CompanyController.getCompany
);

/**
 * @swagger
 * /api/v1/company/{company_id}:
 *   patch:
 *     summary: Atualiza dados da empresa (matriz)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand_name:
 *                 type: string
 *               legal_name:
 *                 type: string
 *               cnpj:
 *                 type: string
 *                 example: "00.000.000/0000-00"
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               cep:
 *                 type: string
 *                 example: "00000-000"
 *               numero:
 *                 type: string
 *               address_line:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               bairro:
 *                 type: string
 *               complemento:
 *                 type: string
 *               pais:
 *                 type: string
 *               inscricao_estadual:
 *                 type: string
 *               inscricao_municipal:
 *                 type: string
 *               cnae:
 *                 type: string
 *               regime_tributario:
 *                 type: string
 *               responsavel_legal:
 *                 type: string
 *               responsavel_cpf:
 *                 type: string
 *               website:
 *                 type: string
 *               logo_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Empresa atualizada com sucesso
 *       400:
 *         description: Dados invalidos
 *       403:
 *         description: Acesso negado a esta empresa
 *       404:
 *         description: Empresa nao encontrada
 */
router.patch(
  '/:company_id',
  authenticate,
  validateParams(companyParamsSchema),
  validateBody(updateCompanySchema),
  CompanyController.updateCompany
);

// =============================================================================
// ROTAS DE FILIAIS
// =============================================================================

/**
 * @swagger
 * /api/v1/company/{company_id}/branches:
 *   get:
 *     summary: Lista filiais ativas da empresa
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de filiais
 *       403:
 *         description: Acesso negado a esta empresa
 *       404:
 *         description: Empresa nao encontrada
 */
router.get(
  '/:company_id/branches',
  authenticate,
  validateParams(companyParamsSchema),
  CompanyController.listBranches
);

/**
 * @swagger
 * /api/v1/company/{company_id}/branches:
 *   post:
 *     summary: Cria uma nova filial
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand_name
 *             properties:
 *               brand_name:
 *                 type: string
 *               legal_name:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               cep:
 *                 type: string
 *               address_line:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Filial criada com sucesso
 *       400:
 *         description: Dados invalidos
 *       403:
 *         description: Acesso negado a esta empresa
 *       404:
 *         description: Empresa nao encontrada
 */
router.post(
  '/:company_id/branches',
  authenticate,
  validateParams(companyParamsSchema),
  validateBody(createBranchSchema),
  CompanyController.createBranch
);

/**
 * @swagger
 * /api/v1/company/{company_id}/branches/{branch_id}:
 *   get:
 *     summary: Busca filial especifica
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: branch_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados da filial
 *       403:
 *         description: Acesso negado a esta empresa
 *       404:
 *         description: Filial nao encontrada
 */
router.get(
  '/:company_id/branches/:branch_id',
  authenticate,
  validateParams(branchParamsSchema),
  CompanyController.getBranch
);

/**
 * @swagger
 * /api/v1/company/{company_id}/branches/{branch_id}:
 *   patch:
 *     summary: Atualiza dados de uma filial
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: branch_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand_name:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Filial atualizada com sucesso
 *       400:
 *         description: Dados invalidos
 *       403:
 *         description: Acesso negado a esta empresa
 *       404:
 *         description: Filial nao encontrada
 */
router.patch(
  '/:company_id/branches/:branch_id',
  authenticate,
  validateParams(branchParamsSchema),
  validateBody(updateBranchSchema),
  CompanyController.updateBranch
);

/**
 * @swagger
 * /api/v1/company/{company_id}/branches/{branch_id}:
 *   delete:
 *     summary: Remove filial (soft delete)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: branch_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filial removida com sucesso
 *       403:
 *         description: Acesso negado a esta empresa
 *       404:
 *         description: Filial nao encontrada
 */
router.delete(
  '/:company_id/branches/:branch_id',
  authenticate,
  validateParams(branchParamsSchema),
  CompanyController.deleteBranch
);

export default router;
