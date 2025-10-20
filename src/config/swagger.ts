import swaggerUi from 'swagger-ui-express';
import { DocumentNode, print } from 'graphql';
import type { Express } from 'express';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: {
      name?: string;
    };
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
  };
}

/**
 * Create a basic Swagger/OpenAPI spec for GraphQL API
 */
function createGraphQLSwaggerSpec(): OpenAPISpec {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Rick and Morty Character API',
      version: '1.0.0',
      description: 'API documentation for the Rick and Morty Character API',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env["API_URL"] || 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    paths: {
      '/graphql': {
        post: {
          summary: 'GraphQL Query',
          description: 'Execute GraphQL queries',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string',
                      description: 'GraphQL query string',
                      example: '{ characters { id name status } }',
                    },
                    variables: {
                      type: 'object',
                      description: 'Query variables',
                    },
                  },
                  required: ['query'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Successful GraphQL response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        description: 'GraphQL query result',
                      },
                      errors: {
                        type: 'array',
                        description: 'GraphQL errors if any',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
            },
            '500': {
              description: 'Server error',
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Character: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            api_id: { type: 'integer' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['Alive', 'Dead', 'Unknown'] },
            species: { type: 'string' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Unknown'] },
            origin_id: { type: 'integer' },
          },
        },
        Origin: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            api_id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
      },
    },
  };
}

/**
 * Setup Swagger documentation for GraphQL API
 */
export const setupSwagger = (app: Express): void => {
  try {
    // Create Swagger specification
    const swaggerSpec = createGraphQLSwaggerSpec();

    // Setup Swagger UI
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: 'list',
        },
        customCss: `
          .swagger-ui { font-family: "Courier New", monospace; }
          .topbar { background-color: #1f2937; }
        `,
      })
    );

    console.log('✓ Swagger documentation available at http://localhost:3000/api-docs');
  } catch (error) {
    console.error('✗ Error setting up Swagger:', error);
    throw error;
  }
};