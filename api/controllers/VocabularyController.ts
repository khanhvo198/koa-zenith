import { PrismaClient, RecentlyAdded } from "@prisma/client";
import { GET, POST, route } from "awilix-koa";
import { Context } from "koa";
import { DictionaryEntry } from "../models/api.type";
import { NewWordRequest } from "./RecentlyAddedController";

@route("/api/vocabulary")
export default class WordController {
  private _prisma: PrismaClient;

  private defaultUser: string = "khanhvo198.y2k@gmail.com";

  constructor({ prisma }: { prisma: PrismaClient }) {
    this._prisma = prisma;
  }

  @GET()
  async getVocabulary(ctx: Context) {
    const user = await this._prisma.user.findFirst({
      where: {
        email: this.defaultUser,
      },
    });

    const decks = await this._prisma.deck.findMany({
      where: { authorId: user?.id },
      include: {
        words: true,
      },
    });

    const vocabulary = decks.map((deck) => deck.words);

    const recentlyAdded = await this._prisma.recentlyAdded.findMany({
      where: {
        authorId: user?.id,
      },
    });

    const recentlyAddedMap = recentlyAdded.map((word) => ({
      ...word,
      status: "NOT_YET",
    }));

    const response = [vocabulary, recentlyAddedMap].flat(Infinity);

    ctx.body = response;
  }

  @POST()
  async addNewWord(ctx: Context) {
    const user = await this._prisma.user.findFirst({
      where: {
        email: this.defaultUser,
      },
    });

    const body = ctx.request.body as NewWordRequest;

    const params = body.text.split(",");

    const results: any[] = [];

    for (const param of params) {
      const result = await this.fetchWordFromDictionary(param);

      if (typeof result === "string") {
        continue;
      }

      results.push(this.simplifyResponse(result));
    }

    const recentlyAdded = results.map((result) => ({
      ...result,
      authorId: user?.id,
    }));

    await this._prisma.recentlyAdded.createMany({
      data: recentlyAdded,
    });

    ctx.body = results;
  }

  async fetchWordFromDictionary(
    word: string,
  ): Promise<DictionaryEntry | string> {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      {
        method: "GET",
      },
    );

    console.log(response);

    const result: DictionaryEntry[] = await response.json();

    if (result[0] === undefined) {
      return "Error";
    }

    return result[0];
  }

  simplifyResponse(result: DictionaryEntry): RecentlyAdded {
    const response: any = {};

    response.text = result.word;
    response.phonetic = this.getPhonetic(result);

    return {
      ...response,
      ...this.getMeaning(result),
    };
  }

  getMeaning(result: DictionaryEntry) {
    const meaningWithExample = result.meanings.find((meaning) => {
      return meaning.definitions.find((definition) => definition.example);
    });

    if (meaningWithExample) {
      const definition = meaningWithExample.definitions.find(
        (definition) => definition.example,
      );

      return {
        partOfSpeech: meaningWithExample.partOfSpeech,
        definition: definition?.definition,
        example: definition?.example,
      };
    } else {
      return {
        partOfSpeech: result.meanings[0].partOfSpeech,
        definition: result.meanings[0].definitions[0].definition,
        example: result.meanings[0].definitions[0].example,
      };
    }
  }

  getPhonetic(result: DictionaryEntry) {
    if (result.phonetic) return result.phonetic;

    for (const phonetic of result.phonetics) {
      if (phonetic.text) {
        return phonetic.text;
      }
    }

    return "";
  }
}
