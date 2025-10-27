import { PrismaClient, RecentlyAdded } from "@prisma/client";
import { before, DELETE, GET, inject, POST, route } from "awilix-koa";
import { Context } from "koa";
import { DictionaryEntry } from "../models/api.type";
import { Word } from "../models/word";
import AuthenticationMiddleware from "../middlewares/AuthenticationMiddleware";

interface NewWordRequest {
  text: string;
}

interface MoveWordRequest {
  deckIds: string[];
  wordId: string;
}

@route("/api/recently_added")
@before([inject(AuthenticationMiddleware)])
export default class DeckController {
  private _prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this._prisma = prisma;
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

  @GET()
  @before([inject(AuthenticationMiddleware)])
  async getRecentyAdded(ctx: Context) {
    const results = await this._prisma.recentlyAdded.findMany({
      where: { authorId: ctx.state.user.id },
    });

    ctx.body = results;
  }

  @DELETE()
  @route("/:id")
  @before([inject(AuthenticationMiddleware)])
  async deleteWord(ctx: Context) {
    const { id } = ctx.params;

    await this._prisma.recentlyAdded.delete({
      where: {
        id,
      },
    });
  }

  @POST()
  @route("/move_word")
  @before([inject(AuthenticationMiddleware)])
  async moveWord(ctx: Context) {
    const { deckIds, wordId } = ctx.request.body as MoveWordRequest;

    const wordRecentlyAdded = await this._prisma.recentlyAdded.findUnique({
      where: {
        id: wordId,
      },
    });

    if (!wordRecentlyAdded) {
      return;
    }

    const newWords: Word[] = [];

    for (const deckId of deckIds) {
      const word = {
        text: wordRecentlyAdded.text,
        phonetic: wordRecentlyAdded.phonetic,
        partOfSpeech: wordRecentlyAdded.partOfSpeech,
        definition: wordRecentlyAdded.definition,
        example: wordRecentlyAdded.example,
        deckId: deckId,
      } as Word;

      newWords.push(word);
    }

    await this._prisma.word.createMany({
      data: newWords,
    });

    await this._prisma.recentlyAdded.delete({
      where: {
        id: wordId,
      },
    });

    ctx.body = "Move word successfully";
  }

  @POST()
  @before([inject(AuthenticationMiddleware)])
  async addNewWord(ctx: Context) {
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
      authorId: ctx.state.user.id,
    }));

    await this._prisma.recentlyAdded.createMany({
      data: recentlyAdded,
    });

    ctx.body = results;
  }
}
