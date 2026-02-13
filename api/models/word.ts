export interface Word {
  text: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
  deckId: string;
  status: "NOT_YET" | "MASTERED";
}
