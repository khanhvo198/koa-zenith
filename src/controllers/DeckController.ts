import { PrismaClient } from "@prisma/client";
import { GET, route } from "awilix-koa";
import { Context } from "koa";

@route("/api/decks")
export default class DeckController {
  private _prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this._prisma = prisma;
  }

  @GET()
  async getDecks(ctx: Context) {
    const decks = await this._prisma.deck.findMany({
      where: { authorId: "1" },
    });

    ctx.body = { decks };
  }

  @route("/:id")
  @GET()
  async getDeckById(ctx: Context) {
    const deck = await this._prisma.deck.findFirst({
      where: { id: ctx.params.id },
      include: {
        words: true,
      },
    });

    ctx.body = { deck };
  }
}
