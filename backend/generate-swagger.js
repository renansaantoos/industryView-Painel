const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

// Base configuration copied from src/config/swagger.ts but in JS
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IndustryView API',
      version: '1.0.0',
      description: 'API REST para gerenciamento de projetos de instalacao solar.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Scans all routes
  apis: [
    './src/index.ts',
    './src/modules/**/routes.ts',
    './src/modules/**/*.routes.ts'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

try {
  fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2));
  console.log('Swagger documentation generated successfully at swagger.json');
} catch (error) {
  console.error('Error generating swagger documentation:', error);
}
