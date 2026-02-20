// prisma.config.ts
import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// On force le chargement du fichier .env
dotenv.config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Ici on s'assure que l'URL est bien récupérée
    url: process.env.DATABASE_URL,
  },
});