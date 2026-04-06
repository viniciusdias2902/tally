import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tally API",
      version: "1.0.0",
      description: "API para gerenciamento de atividades e sessões de medição",
    },
    servers: [
      { url: process.env.API_BASE_URL || "http://localhost:3000", description: process.env.NODE_ENV === "production" ? "Produção" : "Desenvolvimento" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Access token JWT obtido em /auth/login ou /auth/registrar",
        },
      },
      schemas: {
        Tokens: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        Atividade: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            usuarioId: { type: "string", format: "uuid" },
            nome: { type: "string", example: "Leitura" },
            tipoMedicao: { $ref: "#/components/schemas/TipoMedicao" },
            arquivada: { type: "boolean" },
            criadoEm: { type: "string", format: "date-time" },
            atualizadoEm: { type: "string", format: "date-time" },
          },
        },
        TipoMedicao: {
          type: "string",
          enum: ["cronometrada", "binaria"],
        },
        ErroSimples: {
          type: "object",
          properties: {
            erro: { type: "string", example: "ATIVIDADE_NAO_ENCONTRADA" },
          },
        },
        ErroValidacao: {
          type: "object",
          properties: {
            erro: { type: "string", example: "VALIDACAO_FALHOU" },
            erros: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  campo: { type: "string", example: "body" },
                  caminho: { type: "array", items: { type: "string" } },
                  mensagem: { type: "string", example: "Required" },
                },
              },
            },
          },
        },
      },
      responses: {
        NaoAutorizado: {
          description: "Token ausente ou inválido",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroSimples" },
              example: { erro: "TOKEN_INVALIDO" },
            },
          },
        },
        NaoEncontrado: {
          description: "Recurso não encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroSimples" },
              example: { erro: "ATIVIDADE_NAO_ENCONTRADA" },
            },
          },
        },
        ErroValidacao: {
          description: "Dados de entrada inválidos",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroValidacao" },
            },
          },
        },
        Conflito: {
          description: "Conflito com um recurso existente",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroSimples" },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    "./backend/modules/auth/auth.routes.js",
    "./backend/modules/atividades/atividade.routes.js",
    "./backend/modules/categorias/categoria.routes.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
