import { PrismaClient } from "@prisma/client";
import { before, DELETE, GET, inject, POST, route } from "awilix-koa";
import { Context } from "koa";
import AuthenticationMiddleware from "../middlewares/AuthenticationMiddleware";

interface AddNewDeckRequest {
  deckName: string;
  emoji: string;
}

@route("/api/decks")
export default class DeckController {
  private _prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this._prisma = prisma;
  }

  @GET()
  @before([inject(AuthenticationMiddleware)])
  async getDecks(ctx: Context) {
    const decks = await this._prisma.deck.findMany({
      where: { authorId: ctx.state.user.id },
      include: {
        words: true,
      },
    });

    const response = decks.map((deck) => ({
      ...deck,
      wordCount: deck.words.length,
      mastered: deck.words.filter((word) => word.status === "MASTERED").length,
    }));

    console.log(response);

    ctx.body = response;
  }

  @route("/:id")
  @GET()
  @before([inject(AuthenticationMiddleware)])
  async getDeckById(ctx: Context) {
    const deck = await this._prisma.deck.findFirst({
      where: { id: ctx.params.id },
      include: {
        words: true,
      },
    });

    ctx.body = deck;
  }

  @POST()
  @before([inject(AuthenticationMiddleware)])
  async createDeck(ctx: Context) {
    const { deckName, emoji } = ctx.request.body as AddNewDeckRequest;
    const author = ctx.state.user;

    const newDeck = await this._prisma.deck.create({
      data: {
        name: deckName,
        authorId: author.id,
        icon: emoji || "📖",
      },
    });

    ctx.body = newDeck;
  }

  @DELETE()
  @route("/:id")
  @before([inject(AuthenticationMiddleware)])
  async deleteDeck(ctx: Context) {
    const { id } = ctx.params;

    const response = await this._prisma.$transaction([
      this._prisma.word.deleteMany({
        where: {
          deckId: id,
        },
      }),

      this._prisma.deck.delete({
        where: {
          id,
        },
      }),
    ]);

    ctx.body = response;
  }
}
