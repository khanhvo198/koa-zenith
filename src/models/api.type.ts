export type DictionaryResponse = DictionaryEntry[];

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  origin?: string;
  meanings: Meaning[];
}

export interface Phonetic {
  text?: string;
  audio?: string;
}

export interface Meaning {
  partOfSpeech: PartOfSpeech;
  definitions: Definition[];
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "interjection"
  | "exclamation"
  | "determiner"
  | "article"
  | "numeral"
  | "prefix"
  | "suffix"
  | "abbreviation"
  | "auxiliary"
  | "modal"
  | "phrase"
  | "phrasal verb"
  | string; // keep open for other tags
