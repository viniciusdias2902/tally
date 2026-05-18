import { test, expect } from '@playwright/test';

const USUARIO = {
  nome: `José ${Date.now()}`,
  email: `jose-${Date.now()}@e2e.com`,
  senha: "senha1234",
};      