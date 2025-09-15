import { PrismaClient } from "@prisma/client";
import { asValue, AwilixContainer, createContainer } from "awilix";
import { loadControllers, scopePerRequest } from "awilix-koa";
import Koa from "koa";
import bodyParser from "koa-bodyparser";

export async function createApp(): Promise<Koa> {
  const app: Koa = new Koa();

  const prisma: PrismaClient = new PrismaClient();

  const container: AwilixContainer = createContainer().register({
    prisma: asValue(prisma),
  });

  app
    .use(bodyParser())
    .use(scopePerRequest(container))
    .use(loadControllers("controllers/*.{ts,js}", { cwd: __dirname }));

  return app;
}
