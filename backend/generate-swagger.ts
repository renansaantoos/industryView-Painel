import fs from 'fs';
import { swaggerSpec } from './src/config/swagger';

try {
  fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2));
  console.log('Swagger documentation generated successfully at swagger.json');
} catch (error) {
  console.error('Error generating swagger documentation:', error);
}
