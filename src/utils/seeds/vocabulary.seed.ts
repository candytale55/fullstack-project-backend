/* Seed script for populating the vocabulary collection in MongoDB */

import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

import { parse } from "csv-parse/sync";

import VocabularyItem, {
  type IVocabularyItem
} from "../../api/models/Vocabulary.model";

import { connectDB } from "../../config/db";

type VocabularySeedRow = {
  code: string;
  sourceRow: string;

  languageCode: string;
  term: string;
  level: string;
  partOfSpeech: string;

  definition: string;
  example: string;
  clozeExample: string;

  pronunciation: string;
  pronunciationSecondary: string;

  tags: string;
  curriculumReferences: string;
  mediaReferences: string;
};


/* ------------------------------------- */
/* Helpers                               */
/* ------------------------------------- */


const cleanValue = (
  value?: string
): string => {
  return value?.trim() ?? "";
};

/* Divides the tags space-separated 
string into an array of unique values */
const parseList = (
  value?: string
): string[] => {

  const cleanedValue = cleanValue(value);

  if (!cleanedValue) {
    return [];
  }

  return [
    ...new Set(
      cleanedValue.split(/\s+/)
    )
  ];
};


/*
 * Only real CEFR/course levels are stored.
 * A1, A2.1 both are valid
 */

const normalizeLevel = (
  value?: string
): string | undefined => {

  const level = value?.trim();

  if (!level) {
    return undefined;
  }

  const validLevelPattern =
    /^(A1|A2|B1|B2|C1|C2)(\.\d+)?$/i;

  if (!validLevelPattern.test(level)) {
    return undefined;
  }

  return level.toUpperCase();
};



const buildTags = (
  tagsValue?: string,
  levelValue?: string
): string[] => {

  const tags = parseList(tagsValue);

  const rawLevel =
    cleanValue(levelValue).toLowerCase();

  const normalizedLevel =
    normalizeLevel(levelValue);

  if (rawLevel === "hard") {
    tags.push("hard");
  }

  const hasFanficTag = tags.some(
    tag => tag.startsWith("fanfic::")
  );

  const hasBookTag = tags.some(
    tag => tag.startsWith("book::")
  );

  if (
    !normalizedLevel ||
    hasFanficTag ||
    hasBookTag
  ) {
    tags.push("free-vocabulary");
  }

  return [...new Set(tags)];
};


/* ------------------------------------- */
/* Seed                                  */
/* ------------------------------------- */

const seedVocabulary = async () => {

  try {

    await connectDB();


    const filePath = path.resolve(
      __dirname,
      "data/vocabulary.tsv"
    );


    const fileContent = fs.readFileSync(
      filePath,
      "utf-8"
    );


    const rows = parse(
      fileContent,
      {
        columns: true,    // First row contains column names
        delimiter: "\t",  // Tab-separated values
        skip_empty_lines: true, 
        trim: true,
        bom: true,        // Byte Order Mark (BOM) handling -  remove that marker if present
        quote: false      // Don't treat characters as quotes
      }
    ) as VocabularySeedRow[];


    console.log(
      `${rows.length} vocabulary rows loaded`
    );


    /*
     * Validate duplicate codes before
     * writing anything to MongoDB.
     */
    const codes = new Set<string>();


    for (const row of rows) {

      const code = cleanValue(
        row["code"]
      );

      const languageCode =
        cleanValue(row.languageCode)
          .toLowerCase();

      const term = cleanValue(row.term);

      const definition =
        cleanValue(row.definition);


      if (
        !code ||
        !languageCode ||
        !term ||
        !definition
      ) {
        throw new Error(
          `Invalid vocabulary row: ${row.sourceRow}`
        );
      }


      if (codes.has(code)) {
        throw new Error(
          `Duplicate vocabulary code: ${code}`
        );
      }

      codes.add(code);


      const level =
        normalizeLevel(row.level);

      const partOfSpeech =
        cleanValue(row.partOfSpeech);

      const example =
        cleanValue(row.example);

      const clozeExample =
        cleanValue(row.clozeExample);

      const pronunciation =
        cleanValue(row.pronunciation);

      const pronunciationSecondary =
        cleanValue(
          row.pronunciationSecondary
        );

      const imageFilename =
        cleanValue(row.mediaReferences);


      const vocabularyData: IVocabularyItem = {
        code,
        languageCode,
        term,
        definition,

        tags: buildTags(
          row.tags,
          row.level
        ),

        curriculumReferences:
          parseList(
            row.curriculumReferences
          ),

        ...(level && {
          level
        }),

        ...(partOfSpeech && {
          partOfSpeech
        }),

        ...(example && {
          example
        }),

        ...(clozeExample && {
          clozeExample
        }),

        ...(pronunciation && {
          pronunciation
        }),

        ...(pronunciationSecondary && {
          pronunciationSecondary
        }),

        ...(imageFilename && {
          image: {
            filename: imageFilename
          }
        })
      };


      /*
       * Do not replace the complete image
       * object when re-running the seed.
       *
       * Later this prevents Cloudinary's
       * url/publicId from being deleted.
       */
      const {
        image,
        ...vocabularyFields
      } = vocabularyData;


      const fieldsToSet: Record<
        string,
        unknown 
      > = {
        ...vocabularyFields
      };


      if (image?.filename) {
        fieldsToSet["image.filename"] =
          image.filename;
      }


      await VocabularyItem.updateOne(
        {
          code
        },
        {
          $set: fieldsToSet
        },
        {
          upsert: true
        }
      );
    }


    console.log(
      `${rows.length} vocabulary items seeded`
    );


  } catch (error) {

    console.error(
      "Error seeding vocabulary:",
      error
    );

    process.exitCode = 1;

  } finally {

    await mongoose.connection.close();

    console.log(
      "Database connection closed"
    );
  }
};


seedVocabulary();