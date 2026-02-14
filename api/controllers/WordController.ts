import { PrismaClient } from "@prisma/client";
import { before, DELETE, inject, PATCH, route } from "awilix-koa";
import { Context } from "koa";
import AuthenticationMiddleware from "../middlewares/AuthenticationMiddleware";
import { Word } from "../models/word";

@route("/api/words")
export default class WordController {
  private _prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this._prisma = prisma;
  }

  @DELETE()
  @route("/:id")
  @before([inject(AuthenticationMiddleware)])
  async deleteWord(ctx: Context) {
    const res = await this._prisma.word.delete({
      where: {
        id: ctx.params.id,
      },
    });

    ctx.body = res;
  }

  @route("/:id")
  @PATCH()
  @before([inject(AuthenticationMiddleware)])
  async updateWord(ctx: Context) {
    const patchWord = ctx.request.body as Word;

    console.log(ctx.params.id);

    const word = await this._prisma.word.findFirst({
      where: {
        id: ctx.params.id,
      },
    });

    if (!word) {
      throw new Error("Can not update");
    }

    const updateWord: Partial<Word> = {};

    if (patchWord.status) {
      updateWord.status = patchWord.status;
    }

    if (patchWord.definition) {
      updateWord.definition = patchWord.definition;
    }

    if (patchWord.example) {
      updateWord.example = patchWord.example;
    }

    const wordUpdated = await this._prisma.word.update({
      data: {
        ...updateWord,
      },
      where: {
        id: ctx.params.id,
      },
    });

    ctx.body = wordUpdated;
  }
}
