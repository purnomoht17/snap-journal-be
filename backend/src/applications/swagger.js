import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import basicAuth from "express-basic-auth";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SnapJournal API Documentation",
      version: "1.0.0",
      description: "Dokumentasi API untuk aplikasi SnapJournal (Backend).",
      contact: {
        name: "Developer",
      },
    },

    tags: [
      { name: "Auth Public", description: "Endpoint Autentikasi Publik" },
      { name: "Auth", description: "Endpoint Autentikasi Private" },
      { name: "User", description: "Manajemen User" },
      { name: "Journal", description: "Manajemen Journal" },
      { name: "Notification", description: "Manajemen Notifikasi" },
    ],
    
    servers: [
      {
        url: "/", 
        description: "Current Server",
      },
      {
        url: "http://localhost:3000",
        description: "Localhost Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/docs/*.js"], 
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  // Ambil user & pass dari .env 
  const user = process.env.SWAGGER_USER;
  const password = process.env.SWAGGER_PASSWORD;

  const authMiddleware = basicAuth({
    users: { [user]: password },
    challenge: true,
  });

  if (process.env.NODE_ENV === 'production') {
      app.use("/api-docs", authMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
      console.log(`🔒 Swagger Docs protected & available at /api-docs`);
  } else {
      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
      console.log(`📄 Swagger Docs available at /api-docs (No Auth - Dev Mode)`);
  }
};

export default swaggerDocs;