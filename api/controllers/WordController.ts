import { PrismaClient, WordStatus } from "@prisma/client";
import { before, inject, PATCH, route } from "awilix-koa";
import { Context } from "koa";
import AuthenticationMiddleware from "../middlewares/AuthenticationMiddleware";

interface UpdateWordStatusRequest {
  status: WordStatus;
}

@route("/api/words")
export default class WordController {
  private _prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this._prisma = prisma;
  }

  @route("/:id")
  @PATCH()
  @before([inject(AuthenticationMiddleware)])
  async updateWordStatus(ctx: Context) {
    const { status } = ctx.request.body as UpdateWordStatusRequest;

    const wordUpdated = await this._prisma.word.update({
      data: {
        status,
      },
      where: {
        id: ctx.params.id,
      },
    });

    ctx.body = wordUpdated;
  }
}
