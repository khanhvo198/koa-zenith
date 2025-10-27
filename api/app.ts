import { PrismaClient } from "@prisma/client";
import { asValue, AwilixContainer, createContainer } from "awilix";
import { loadControllers, scopePerRequest } from "awilix-koa";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import SecurityService from "./services/SercurityService";

export function createApp(): Koa {
  const app: Koa = new Koa();

  const prisma: PrismaClient = new PrismaClient();
  const securityService: SecurityService = new SecurityService();

  const container: AwilixContainer = createContainer().register({
    prisma: asValue(prisma),
    securityService: asValue(securityService),
  });

  app
    .use(bodyParser())
    .use(scopePerRequest(container))
    .use(loadControllers("api/controllers/*.{ts,js}", { cwd: process.cwd() }));

  return app;
}
