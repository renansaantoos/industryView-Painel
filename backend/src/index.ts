// =============================================================================
// INDUSTRYVIEW BACKEND - Entry Point
// Ponto de entrada da aplicacao
// Migrado de Xano para Node.js/Express
// =============================================================================

// Global BigInt serialization - ensures JSON.stringify handles BigInt everywhere
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer for multipart form data
const upload = multer();

import { config } from './config/env';
import { connectDatabase, disconnectDatabase, checkDatabaseHealth } from './config/database';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { defaultRateLimiter } from './middleware/rateLimit';
import { authenticate } from './middleware/auth';
import { AuthenticatedRequest } from './types';
import { logger, httpLogger } from './utils/logger';

// Import routes
import { authRoutes } from './modules/auth';
import { usersRoutes } from './modules/users';
import { projectsRoutes } from './modules/projects';
import { sprintsRoutes } from './modules/sprints';
import { teamsRoutes } from './modules/teams';
import { trackersRoutes } from './modules/trackers';
import { inventoryRoutes } from './modules/inventory';
import { reportsRoutes } from './modules/reports';
import { agentsRoutes } from './modules/agents';
import { companyRoutes } from './modules/company';
import { tasksRoutes } from './modules/tasks';
import { manufacturersRoutes } from './modules/manufacturers';
import { stripeRoutes } from './modules/stripe';

// Onda 1+2+3 - Compliance Industrial routes
import { safetyRoutes } from './modules/safety';
import { qualityRoutes } from './modules/quality';
import { planningRoutes } from './modules/planning';
import { dailyReportsRoutes } from './modules/daily-reports';
import { workPermitsRoutes } from './modules/work-permits';
import { workforceRoutes } from './modules/workforce';
import { notificationsRoutes } from './modules/notifications';
import { ppeRoutes } from './modules/ppe';
import { contractsRoutes } from './modules/contracts';
import { commissioningRoutes } from './modules/commissioning';
import { environmentalRoutes } from './modules/environmental';
import { healthRoutes } from './modules/health';
import { materialRequisitionsRoutes } from './modules/material-requisitions';
import { auditRoutes } from './modules/audit';
import { employeesRoutes } from './modules/employees';
import { scheduleImportRoutes } from './modules/schedule-import';

// Import scheduled jobs
import { registerJobs } from './jobs';

// Cria a aplicacao Express
const app: Express = express();

// =============================================================================
// Middlewares Globais
// =============================================================================

// CORS - DEVE ser configurado ANTES do helmet e outros middlewares
// para garantir que preflight requests sejam tratados corretamente
const corsOptions = {
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // Cache preflight por 24 horas
  optionsSuccessStatus: 204,
};

// Log CORS config em desenvolvimento para debug
if (config.app.isDevelopment) {
  logger.info({ corsOrigin: typeof config.cors.origin === 'function' ? 'dynamic (any origin)' : config.cors.origin, credentials: config.cors.credentials }, 'CORS configuration');
}

app.use(cors(corsOptions));

// Security headers - configurado DEPOIS do CORS
// crossOriginResourcePolicy desabilitado para permitir requests cross-origin em dev
app.use(helmet({
  contentSecurityPolicy: config.app.isProduction,
  crossOriginEmbedderPolicy: config.app.isProduction,
  crossOriginResourcePolicy: config.app.isProduction ? { policy: 'same-origin' } : false,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
const uploadsDir = path.resolve(config.storage?.path || './uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Request logging
if (config.app.isDevelopment) {
  app.use(morgan('dev', {
    stream: {
      write: (message: string) => {
        httpLogger.info(message.trim());
      },
    },
  }));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        httpLogger.info(message.trim());
      },
    },
  }));
}

// Rate limiting
app.use(defaultRateLimiter);

// =============================================================================
// API Routes
// =============================================================================

const API_PREFIX = `/api/${config.app.apiVersion}`;

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseHealth();

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
    database: dbHealthy ? 'connected' : 'disconnected',
  });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'IndustryView API Documentation',
}));

// Users aliases (must be BEFORE main routes to avoid /:users_id capture)
app.get(`${API_PREFIX}/users/users_roles`, async (_req, res, next) => {
  try {
    const { db } = await import('./config/database');
    const roles = await db.users_roles.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
    });
    // JSON.stringify converts Date→ISO string and replacer converts BigInt→Number
    res.json(JSON.parse(JSON.stringify(roles, (_, v) => typeof v === 'bigint' ? Number(v) : v)));
  } catch (error) {
    next(error);
  }
});

app.get(`${API_PREFIX}/users/users_system_access`, async (_req, res, next) => {
  try {
    const { db } = await import('./config/database');
    const access = await db.users_system_access.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
    });
    res.json(JSON.parse(JSON.stringify(access, (_, v) => typeof v === 'bigint' ? Number(v) : v)));
  } catch (error) {
    next(error);
  }
});

app.get(`${API_PREFIX}/users/users_control_system`, async (_req, res, next) => {
  try {
    const { db } = await import('./config/database');
    const control = await db.users_control_system.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
    });
    res.json(JSON.parse(JSON.stringify(control, (_, v) => typeof v === 'bigint' ? Number(v) : v)));
  } catch (error) {
    next(error);
  }
});

app.post(`${API_PREFIX}/users/users_list`, (req, res, next) => {
  req.url = '/list';
  usersRoutes(req, res, next);
});

// POST /users/users -> POST /users (create user)
// Suporta multipart/form-data e JSON
app.post(`${API_PREFIX}/users/users`, upload.none(), (req, res, next) => {
  // Se veio como form-data, os campos estão em req.body como strings
  // Converte para o formato esperado
  if (req.body && typeof req.body === 'object') {
    // Garante que os campos numéricos sejam números
    if (req.body.users_roles_id) req.body.users_roles_id = parseInt(req.body.users_roles_id, 10);
    if (req.body.users_control_system_id) req.body.users_control_system_id = parseInt(req.body.users_control_system_id, 10);
    if (req.body.users_system_access_id) req.body.users_system_access_id = parseInt(req.body.users_system_access_id, 10);
    if (req.body.projects_id) req.body.projects_id = parseInt(req.body.projects_id, 10);
    if (req.body.company_id) req.body.company_id = parseInt(req.body.company_id, 10);
    if (req.body.teams_id) req.body.teams_id = parseInt(req.body.teams_id, 10);
    if (req.body.is_leader !== undefined) req.body.is_leader = req.body.is_leader === 'true' || req.body.is_leader === true;
  }
  req.url = '/';
  usersRoutes(req, res, next);
});

// Projects aliases (must be BEFORE main routes to avoid /:projects_id capture)
app.get(`${API_PREFIX}/projects/equipaments_types`, async (_req, res, next) => {
  try {
    const { db } = await import('./config/database');
    const { serializeBigInt } = await import('./utils/bigint');
    const types = await db.equipaments_types.findMany({
      where: { deleted_at: null },
      orderBy: { type: 'asc' },
    });
    res.json(serializeBigInt(types));
  } catch (error) {
    next(error);
  }
});

app.get(`${API_PREFIX}/projects/projects`, authenticate, async (req: any, res, next) => {
  try {
    const { ProjectsService } = await import('./modules/projects/projects.service');
    const { serializeBigInt } = await import('./utils/bigint');

    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 20;
    const search = req.query.search as string || '';
    const companyId = req.user?.companyId;
    const sortField = req.query.sort_field as string || undefined;
    const sortDirection = (req.query.sort_direction as string) || undefined;

    const result = await ProjectsService.list({
      page,
      per_page: perPage,
      search: search || undefined,
      company_id: companyId || undefined,
      sort_field: sortField,
      sort_direction: sortDirection as 'asc' | 'desc' | undefined,
    });

    res.json(serializeBigInt(result));
  } catch (error) {
    next(error);
  }
});

// API routes
// Equivalente aos api_groups do Xano

// Teams Leaders aliases - DEVEM vir ANTES do app.use de /projects
// pois o frontend (FlutterFlow) chama /projects/teams_leaders* mas o backend tem /teams/leaders*
app.get(`${API_PREFIX}/projects/teams_leaders`, (req, res, next) => {
  req.url = '/leaders';
  teamsRoutes(req, res, next);
});

app.post(`${API_PREFIX}/projects/teams_leaders`, (req, res, next) => {
  req.url = '/leaders';
  teamsRoutes(req, res, next);
});

app.get(`${API_PREFIX}/projects/teams_leaders/all/:teamsId`, (req, res, next) => {
  req.url = `/leaders/all/${req.params.teamsId}`;
  teamsRoutes(req, res, next);
});

app.get(`${API_PREFIX}/projects/teams_leaders/:teamsLeadersId`, (req, res, next) => {
  req.url = `/leaders/${req.params.teamsLeadersId}`;
  teamsRoutes(req, res, next);
});

app.patch(`${API_PREFIX}/projects/teams_leaders/:teamsLeadersId`, (req, res, next) => {
  req.url = `/leaders/${req.params.teamsLeadersId}`;
  teamsRoutes(req, res, next);
});

app.delete(`${API_PREFIX}/projects/teams_leaders/:teamsLeadersId`, (req, res, next) => {
  req.url = `/leaders/${req.params.teamsLeadersId}`;
  teamsRoutes(req, res, next);
});

// Teams Members aliases - DEVEM vir ANTES do app.use de /projects
app.get(`${API_PREFIX}/projects/teams_members`, (req, res, next) => {
  req.url = '/members';
  teamsRoutes(req, res, next);
});

app.post(`${API_PREFIX}/projects/teams_members`, (req, res, next) => {
  req.url = '/members';
  teamsRoutes(req, res, next);
});

app.get(`${API_PREFIX}/projects/teams_members/:teamsMembersId`, (req, res, next) => {
  req.url = `/members/${req.params.teamsMembersId}`;
  teamsRoutes(req, res, next);
});

app.delete(`${API_PREFIX}/projects/teams_members/:teamsMembersId`, (req, res, next) => {
  req.url = `/members/${req.params.teamsMembersId}`;
  teamsRoutes(req, res, next);
});

// ALIAS REMOVED: This route is now handled by projectsRoutes in projects.routes.ts
// app.post(`${API_PREFIX}/projects/teams_list/all/:projectsId`...

// Teams CRUD aliases - frontend chama /projects/teams, backend tem /teams
app.get(`${API_PREFIX}/projects/teams`, (req, res, next) => {
  req.url = '/';
  teamsRoutes(req, res, next);
});

app.post(`${API_PREFIX}/projects/teams`, (req, res, next) => {
  req.url = '/';
  teamsRoutes(req, res, next);
});

app.get(`${API_PREFIX}/projects/teams/:teamsId`, (req, res, next) => {
  req.url = `/${req.params.teamsId}`;
  teamsRoutes(req, res, next);
});

app.patch(`${API_PREFIX}/projects/teams/:teamsId`, (req, res, next) => {
  req.url = `/${req.params.teamsId}`;
  teamsRoutes(req, res, next);
});

app.delete(`${API_PREFIX}/projects/teams/:teamsId`, (req, res, next) => {
  req.url = `/${req.params.teamsId}`;
  teamsRoutes(req, res, next);
});

// Users aliases - DEVEM vir ANTES do app.use de /users
app.post(`${API_PREFIX}/users/users_leaders_0`, authenticate, async (req: any, res, next) => {
  try {
    const { db } = await import('./config/database');
    const { serializeBigInt } = await import('./utils/bigint');

    const { projects_id: _projects_id, page = 1, per_page = 20, teams_id: _teams_id, users_roles_id, search } = req.body;
    const companyId = req.user?.companyId;

    const whereConditions: any = {
      deleted_at: null,
    };

    // Filtra por roles de liderança (se informado, usa o array; senao, usa padrao)
    const roleIds = Array.isArray(users_roles_id) && users_roles_id.length > 0
      ? users_roles_id
      : [1, 2, 3];

    whereConditions.users_permissions = {
      users_roles_id: { in: roleIds },
    };

    if (companyId) {
      whereConditions.company_id = BigInt(companyId);
    }

    if (search && search.trim() !== '') {
      whereConditions.name = { contains: search, mode: 'insensitive' };
    }

    const total = await db.users.count({ where: whereConditions });

    const leaders = await db.users.findMany({
      where: whereConditions,
      include: {
        users_permissions: {
          include: { users_roles: true },
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * per_page,
      take: per_page,
    });

    res.json(serializeBigInt({
      items: leaders,
      curPage: page,
      perPage: per_page,
      nextPage: page * per_page < total ? page + 1 : null,
      itemsReceived: leaders.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    }));
  } catch (error) {
    next(error);
  }
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, usersRoutes);
app.use(`${API_PREFIX}/company`, companyRoutes);
app.use(`${API_PREFIX}/projects`, projectsRoutes);
app.use(`${API_PREFIX}/sprints`, sprintsRoutes);
app.use(`${API_PREFIX}/teams`, teamsRoutes);
app.use(`${API_PREFIX}/trackers`, trackersRoutes);
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
app.use(`${API_PREFIX}/reports`, reportsRoutes);
app.use(`${API_PREFIX}/agents`, agentsRoutes);
app.use(`${API_PREFIX}/tasks`, tasksRoutes);
app.use(`${API_PREFIX}/manufacturers`, manufacturersRoutes);
app.use(`${API_PREFIX}/stripe`, stripeRoutes);

// Onda 1+2+3 - Compliance Industrial routes
app.use(`${API_PREFIX}/safety`, safetyRoutes);
app.use(`${API_PREFIX}/quality`, qualityRoutes);
app.use(`${API_PREFIX}/planning`, planningRoutes);
app.use(`${API_PREFIX}/daily-reports`, dailyReportsRoutes);
app.use(`${API_PREFIX}/work-permits`, workPermitsRoutes);
app.use(`${API_PREFIX}/workforce`, workforceRoutes);
app.use(`${API_PREFIX}/notifications`, notificationsRoutes);
app.use(`${API_PREFIX}/ppe`, ppeRoutes);
app.use(`${API_PREFIX}/contracts`, contractsRoutes);
app.use(`${API_PREFIX}/commissioning`, commissioningRoutes);
app.use(`${API_PREFIX}/environmental`, environmentalRoutes);
app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/material-requisitions`, materialRequisitionsRoutes);
app.use(`${API_PREFIX}/audit`, auditRoutes);
app.use(`${API_PREFIX}/employees`, employeesRoutes);
app.use(`${API_PREFIX}/schedule-import`, scheduleImportRoutes);

// =============================================================================
// File Upload Endpoint - Upload generico de arquivos
// =============================================================================

const fileUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.resolve(config.storage.path, 'attachments');
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const blocked = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.dll'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (blocked.includes(ext)) {
      cb(new Error('Tipo de arquivo nao permitido.'));
    } else {
      cb(null, true);
    }
  },
});

app.post(`${API_PREFIX}/uploads`, authenticate, fileUpload.single('file'), (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: true, message: 'Nenhum arquivo enviado.' });
    return;
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${baseUrl}/uploads/attachments/${file.filename}`;

  res.status(201).json({
    file_url: fileUrl,
    file_name: file.originalname,
    file_type: file.mimetype,
    file_size: file.size,
  });
});

// =============================================================================
// ALIAS ROUTES - Suporte para paths legados do Xano usados pelo Flutter
// Estes redirecionam as chamadas antigas para os novos endpoints
// =============================================================================

// Users aliases
app.post(`${API_PREFIX}/users_list`, (req, res, next) => {
  usersRoutes(Object.assign(req, { url: '/list' }), res, next);
});

// Root level users_roles, users_system_access, users_control_system (Xano style)
app.get(`${API_PREFIX}/users_roles`, async (_req, res, next) => {
  try {
    const { db } = await import('./config/database');
    const roles = await db.users_roles.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
    });
    res.json(JSON.parse(JSON.stringify(roles, (_, v) => typeof v === 'bigint' ? Number(v) : v)));
  } catch (error) {
    next(error);
  }
});

app.get(`${API_PREFIX}/users_system_access`, async (_req, res, next) => {
  try {
    const { db } = await import('./config/database');
    const access = await db.users_system_access.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
    });
    res.json(JSON.parse(JSON.stringify(access, (_, v) => typeof v === 'bigint' ? Number(v) : v)));
  } catch (error) {
    next(error);
  }
});

app.get(`${API_PREFIX}/users_control_system`, async (_req, res, next) => {
  try {
    const { db } = await import('./config/database');
    const control = await db.users_control_system.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
    });
    res.json(JSON.parse(JSON.stringify(control, (_, v) => typeof v === 'bigint' ? Number(v) : v)));
  } catch (error) {
    next(error);
  }
});

app.put(`${API_PREFIX}/change_password`, (req, res, next) => {
  req.url = '/change-password';
  usersRoutes(req, res, next);
});

const queryAllUsersHandler = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { db } = await import('./config/database');
    const companyId = req.user?.companyId;
    const where: Record<string, unknown> = { deleted_at: null };
    if (companyId) {
      where.company_id = companyId;
    }
    const users = await db.users.findMany({
      where,
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    res.json(users.map((u: { id: bigint; name: string | null; email: string | null }) => ({
      id: Number(u.id),
      name: u.name || '',
      email: u.email || '',
    })));
  } catch (error) {
    next(error);
  }
};
app.get(`${API_PREFIX}/query_all_users`, authenticate, queryAllUsersHandler as any);
app.get(`${API_PREFIX}/users/query_all_users`, authenticate, queryAllUsersHandler as any);

app.post(`${API_PREFIX}/users_leaders_0`, authenticate, async (req: any, res, next) => {
  try {
    const { db } = await import('./config/database');
    const { serializeBigInt } = await import('./utils/bigint');
    const companyId = req.user?.companyId;
    const whereConditions: any = {
      deleted_at: null,
      users_permissions: {
        users_roles_id: { in: [1, 2, 3] }, // Super Admin, Gerente, Lider
      },
    };
    if (companyId) {
      whereConditions.company_id = BigInt(companyId);
    }
    const leaders = await db.users.findMany({
      where: whereConditions,
      include: {
        users_permissions: {
          include: { users_roles: true },
        },
      },
    });
    res.json(serializeBigInt(leaders));
  } catch (error) {
    next(error);
  }
});

// Projects statuses alias (Xano style)
app.get(`${API_PREFIX}/projects_statuses`, async (_req, res, next) => {
  try {
    const { db } = await import('./config/database');
    const { serializeBigInt } = await import('./utils/bigint');
    const statuses = await db.projects_statuses.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
    });
    res.json(serializeBigInt(statuses));
  } catch (error) {
    next(error);
  }
});

// Tasks aliases
app.post(`${API_PREFIX}/tasks_list`, (req, res, next) => {
  req.url = '/list';
  tasksRoutes(req, res, next);
});

app.get(`${API_PREFIX}/all_tasks_template`, authenticate, async (req: any, res, next) => {
  try {
    const { db } = await import('./config/database');
    const { serializeBigInt } = await import('./utils/bigint');
    const companyId = req.user?.companyId;
    const where: any = { deleted_at: null };
    if (companyId) {
      where.OR = [
        { company_id: BigInt(companyId) },
        { company_id: null, fixed: true },
      ];
    }
    const templates = await db.tasks_template.findMany({
      where,
      orderBy: { description: 'asc' },
    });
    res.json(serializeBigInt(templates));
  } catch (error) {
    next(error);
  }
});

// Sprints aliases
// app.post(`${API_PREFIX}/sprints_tasks_painel`, ... (movido para projectsRoutes)


app.put(`${API_PREFIX}/update_sprint_task_status`, (req, res, next) => {
  req.url = '/tasks/status';
  sprintsRoutes(req, res, next);
});

app.put(`${API_PREFIX}/update_lista_sprint_task_status`, (req, res, next) => {
  req.url = '/tasks/status/list';
  sprintsRoutes(req, res, next);
});

app.get(`${API_PREFIX}/sprints_grafico_filter`, (req, res, next) => {
  req.url = '/chart';
  sprintsRoutes(req, res, next);
});

app.get(`${API_PREFIX}/counts_subtasks`, (req, res, next) => {
  req.url = '/subtasks/count';
  sprintsRoutes(req, res, next);
});

// Reports aliases
app.get(`${API_PREFIX}/schedule_per_day`, (req, res, next) => {
  req.url = '/schedule/day';
  reportsRoutes(req, res, next);
});

app.get(`${API_PREFIX}/informe_diario`, (req, res, next) => {
  req.url = '/informe-diario';
  reportsRoutes(req, res, next);
});

app.get(`${API_PREFIX}/informe_diario_0`, (req, res, next) => {
  req.url = '/informe-diario/filtered';
  reportsRoutes(req, res, next);
});

// Retirados pois agora estao nos modulos corretos com prefixo /projects
// app.post(`${API_PREFIX}/sprints_tasks_painel`, ...
// app.post(`${API_PREFIX}/filters_project_backlog`, ...

// Teams aliases
app.post(`${API_PREFIX}/teams_list/all/:projectsId`, (req, res, next) => {
  req.url = `/${req.params.projectsId}/list`;
  teamsRoutes(req, res, next);
});

app.put(`${API_PREFIX}/edit_teams_leaders`, (req, res, next) => {
  req.url = '/leaders/edit';
  teamsRoutes(req, res, next);
});

app.put(`${API_PREFIX}/edit_teams_member`, (req, res, next) => {
  req.url = '/members/edit';
  teamsRoutes(req, res, next);
});


// Inventory aliases
app.get(`${API_PREFIX}/product_inventory`, (req, res, next) => {
  req.url = '/products';
  inventoryRoutes(req, res, next);
});

app.post(`${API_PREFIX}/product_inventory`, (req, res, next) => {
  req.url = '/products';
  inventoryRoutes(req, res, next);
});

app.get(`${API_PREFIX}/product_inventory/:id`, (req, res, next) => {
  req.url = `/products/${req.params.id}`;
  inventoryRoutes(req, res, next);
});

app.patch(`${API_PREFIX}/product_inventory/:id`, (req, res, next) => {
  req.url = `/products/${req.params.id}`;
  inventoryRoutes(req, res, next);
});

app.delete(`${API_PREFIX}/product_inventory/:id`, (req, res, next) => {
  req.url = `/products/${req.params.id}`;
  inventoryRoutes(req, res, next);
});

app.get(`${API_PREFIX}/status_inventory`, (req, res, next) => {
  req.url = '/status';
  inventoryRoutes(req, res, next);
});

app.post(`${API_PREFIX}/Add_quantity_inventory`, (req, res, next) => {
  req.url = '/add-quantity';
  inventoryRoutes(req, res, next);
});

app.post(`${API_PREFIX}/Remove_quantity_inventory`, (req, res, next) => {
  req.url = '/remove-quantity';
  inventoryRoutes(req, res, next);
});

app.get(`${API_PREFIX}/inventory_logs`, (req, res, next) => {
  req.url = '/logs';
  inventoryRoutes(req, res, next);
});

app.get(`${API_PREFIX}/inventory_logs_0`, (req, res, next) => {
  req.url = '/logs/filtered';
  inventoryRoutes(req, res, next);
});

app.get(`${API_PREFIX}/export_inventory`, (req, res, next) => {
  req.url = '/export';
  inventoryRoutes(req, res, next);
});

// Unity aliases (frontend calls /unity, backend has /tasks/unity)
app.get(`${API_PREFIX}/unity`, (req, res, next) => {
  req.url = '/unity';
  tasksRoutes(req, res, next);
});
app.post(`${API_PREFIX}/unity`, (req, res, next) => {
  req.url = '/unity';
  tasksRoutes(req, res, next);
});
app.get(`${API_PREFIX}/unity/:unity_id`, (req, res, next) => {
  req.url = `/unity/${req.params.unity_id}`;
  tasksRoutes(req, res, next);
});
app.patch(`${API_PREFIX}/unity/:unity_id`, (req, res, next) => {
  req.url = `/unity/${req.params.unity_id}`;
  tasksRoutes(req, res, next);
});
app.delete(`${API_PREFIX}/unity/:unity_id`, (req, res, next) => {
  req.url = `/unity/${req.params.unity_id}`;
  tasksRoutes(req, res, next);
});

// Discipline aliases (frontend calls /discipline, backend has /tasks/discipline)
app.get(`${API_PREFIX}/discipline`, (req, res, next) => {
  req.url = '/discipline';
  tasksRoutes(req, res, next);
});
app.post(`${API_PREFIX}/discipline`, (req, res, next) => {
  req.url = '/discipline';
  tasksRoutes(req, res, next);
});
app.get(`${API_PREFIX}/discipline/:discipline_id`, (req, res, next) => {
  req.url = `/discipline/${req.params.discipline_id}`;
  tasksRoutes(req, res, next);
});
app.put(`${API_PREFIX}/discipline/:discipline_id`, (req, res, next) => {
  req.url = `/discipline/${req.params.discipline_id}`;
  tasksRoutes(req, res, next);
});
app.delete(`${API_PREFIX}/discipline/:discipline_id`, (req, res, next) => {
  req.url = `/discipline/${req.params.discipline_id}`;
  tasksRoutes(req, res, next);
});

// Tasks list alias (frontend calls /tasks/tasks_list)
app.post(`${API_PREFIX}/tasks/tasks_list`, (req, res, next) => {
  req.url = '/list';
  tasksRoutes(req, res, next);
});

// Tasks CRUD aliases (frontend calls /tasks/tasks, backend has /tasks)
app.post(`${API_PREFIX}/tasks/tasks`, (req, res, next) => {
  req.url = '/';
  tasksRoutes(req, res, next);
});
app.get(`${API_PREFIX}/tasks/tasks/:tasks_id`, (req, res, next) => {
  req.url = `/${req.params.tasks_id}`;
  tasksRoutes(req, res, next);
});
app.patch(`${API_PREFIX}/tasks/tasks/:tasks_id`, (req, res, next) => {
  req.url = `/${req.params.tasks_id}`;
  tasksRoutes(req, res, next);
});
app.delete(`${API_PREFIX}/tasks/tasks/:tasks_id`, (req, res, next) => {
  req.url = `/${req.params.tasks_id}`;
  tasksRoutes(req, res, next);
});

// Tasks discipline aliases (both /creat_discipline and /tasks/creat_discipline)
app.post(`${API_PREFIX}/creat_discipline`, (req, res, next) => {
  req.url = '/discipline';
  tasksRoutes(req, res, next);
});
app.post(`${API_PREFIX}/tasks/creat_discipline`, (req, res, next) => {
  req.url = '/discipline';
  tasksRoutes(req, res, next);
});

app.put(`${API_PREFIX}/edit_discipline`, (req, res, next) => {
  req.url = `/discipline/${req.body.discipline_id || req.body.id}`;
  tasksRoutes(req, res, next);
});
app.put(`${API_PREFIX}/tasks/edit_discipline`, (req, res, next) => {
  req.url = `/discipline/${req.body.discipline_id || req.body.id}`;
  tasksRoutes(req, res, next);
});

app.delete(`${API_PREFIX}/deleted_discipline`, (req, res, next) => {
  req.url = `/discipline/${req.body.discipline_id || req.body.id}`;
  tasksRoutes(req, res, next);
});
app.delete(`${API_PREFIX}/tasks/deleted_discipline`, (req, res, next) => {
  req.url = `/discipline/${req.body.discipline_id || req.body.id}`;
  tasksRoutes(req, res, next);
});

// AI Agents aliases (fix typo)
app.post(`${API_PREFIX}/projetcs/agent/search`, (req, res, next) => {
  req.url = '/projects/search';
  agentsRoutes(req, res, next);
});

// CEP Lookup - proxy para ViaCEP
app.get(`${API_PREFIX}/cep/:cep`, async (req, res, next) => {
  try {
    const cep = req.params.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      res.status(400).json({ error: true, message: 'CEP deve ter 8 dígitos' });
      return;
    }
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json() as { erro?: boolean };
    if (data.erro) {
      res.status(404).json({ error: true, message: 'CEP não encontrado' });
      return;
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Equipment types endpoint
app.get(`${API_PREFIX}/equipaments_types`, async (_req, res, next) => {
  try {
    const { db } = await import('./config/database');
    const { serializeBigInt } = await import('./utils/bigint');
    const types = await db.equipaments_types.findMany({
      where: { deleted_at: null },
      orderBy: { type: 'asc' },
    });
    res.json(serializeBigInt(types));
  } catch (error) {
    next(error);
  }
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'IndustryView API',
    version: '1.0.0',
    description: 'Backend API for IndustryView - Solar Installation Management',
    documentation: '/api-docs',
    health: '/health',
    api: API_PREFIX,
  });
});

// =============================================================================
// Error Handling
// =============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// =============================================================================
// Server Startup
// =============================================================================

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Register scheduled jobs
    // Equivalente aos tasks do Xano (end_sprint, start_sprint, att_first_login, update_tasks_end_day)
    registerJobs();

    // Start server
    app.listen(config.app.port, () => {
      logger.info({
        port: config.app.port,
        environment: config.app.env,
        apiVersion: config.app.apiVersion,
      }, `Server started on port ${config.app.port}`);

      logger.info(`API available at http://localhost:${config.app.port}${API_PREFIX}`);
      logger.info(`Documentation available at http://localhost:${config.app.port}/api-docs`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// =============================================================================
// Graceful Shutdown
// =============================================================================

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Received shutdown signal');

  try {
    await disconnectDatabase();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});

// Start the server
startServer();

export default app;
