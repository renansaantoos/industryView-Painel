// =============================================================================
// INDUSTRYVIEW BACKEND - Swagger Configuration
// Configuracao da documentacao OpenAPI/Swagger
// =============================================================================

import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IndustryView API',
      version: '1.0.0',
      description: `
# IndustryView Backend API

API REST para gerenciamento de projetos de instalacao solar.

## Autenticacao

A maioria dos endpoints requer autenticacao via JWT Token.
Inclua o token no header Authorization:

\`\`\`
Authorization: Bearer <seu-token>
\`\`\`

## Grupos de Endpoints

- **Authentication**: Login, signup, dados do usuario
- **Users**: Gerenciamento de usuarios e permissoes
- **Projects**: Gerenciamento de projetos
- **Sprints**: Planejamento de sprints
- **Tasks**: Backlog e tarefas
- **Teams**: Gerenciamento de equipes
- **Trackers**: Configuracao de trackers solares
- **Inventory**: Controle de estoque
- **Reports**: Relatorios e dashboards
- **Agents**: Agentes de IA

## Codigos de Erro

- \`400\` - Bad Request: Dados invalidos
- \`401\` - Unauthorized: Nao autenticado
- \`403\` - Forbidden: Sem permissao
- \`404\` - Not Found: Recurso nao encontrado
- \`409\` - Conflict: Conflito (ex: email duplicado)
- \`429\` - Too Many Requests: Rate limit excedido
- \`500\` - Internal Server Error: Erro interno
      `,
      contact: {
        name: 'IndustryView Team',
        email: 'support@industryview.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}/api/${config.app.apiVersion}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token de autenticacao',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'boolean',
              example: true,
            },
            code: {
              type: 'string',
              example: 'BAD_REQUEST',
            },
            message: {
              type: 'string',
              example: 'Erro de validacao',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'boolean',
              example: true,
            },
            code: {
              type: 'string',
              example: 'VALIDATION_ERROR',
            },
            message: {
              type: 'string',
              example: 'Erro de validacao',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email',
                  },
                  message: {
                    type: 'string',
                    example: 'Email invalido',
                  },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {},
            },
            curPage: {
              type: 'integer',
              example: 1,
            },
            perPage: {
              type: 'integer',
              example: 20,
            },
            itemsReceived: {
              type: 'integer',
              example: 20,
            },
            itemsTotal: {
              type: 'integer',
              example: 100,
            },
            pageTotal: {
              type: 'integer',
              example: 5,
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            phone: {
              type: 'string',
              example: '+5511999999999',
            },
            profile_picture: {
              type: 'string',
              nullable: true,
            },
            first_login: {
              type: 'boolean',
              example: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Solar Park Alpha',
            },
            registration_number: {
              type: 'string',
              example: 'PRJ-001',
            },
            responsible: {
              type: 'string',
              example: 'John Doe',
            },
            city: {
              type: 'string',
              example: 'Sao Paulo',
            },
            state: {
              type: 'string',
              example: 'SP',
            },
            completion_percentage: {
              type: 'number',
              example: 75.5,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Sprint: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'Sprint 1',
            },
            objective: {
              type: 'string',
              example: 'Instalacao dos trackers',
            },
            start_date: {
              type: 'string',
              format: 'date-time',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
            },
            progress_percentage: {
              type: 'number',
              example: 50.0,
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Nao autenticado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Recurso nao encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Erro de validacao',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticacao',
      },
      {
        name: 'Users',
        description: 'Gerenciamento de usuarios',
      },
      {
        name: 'Projects',
        description: 'Gerenciamento de projetos',
      },
      {
        name: 'Sprints',
        description: 'Planejamento de sprints',
      },
      {
        name: 'Tasks',
        description: 'Backlog e tarefas',
      },
      {
        name: 'Teams',
        description: 'Gerenciamento de equipes',
      },
      {
        name: 'Trackers',
        description: 'Configuracao de trackers',
      },
      {
        name: 'Inventory',
        description: 'Controle de estoque',
      },
      {
        name: 'Reports',
        description: 'Relatorios',
      },
      {
        name: 'Agents',
        description: 'Agentes de IA',
      },
    ],
  },
  apis: ['./src/modules/**/routes.ts', './src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
