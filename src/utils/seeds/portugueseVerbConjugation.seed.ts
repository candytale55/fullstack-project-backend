/*
 * src/utils/seeds/portugueseVerbConjugation.seed.ts
 *
 * Reads Portuguese verb conjugations from a CSV file
 * and inserts them into MongoDB.
 * The seed resolves those codes to their MongoDB ObjectIds
 * before creating the documents.
 */

import fs from "node:fs";
import path from "node:path";
import mongoose, { Types } from "mongoose";

import { parse } from "csv-parse/sync";

import Course from "../../api/models/Course.model";

import PortugueseVerbConjugation, {
  type IPortugueseVerbConjugation,
  type IPortugueseVerbForms
} from "../../api/models/PortugueseVerbConjugation.model";

import { connectDB } from "../../config/db";


/* ------------------------------------- */
/*           CSV Row Structure           */
/* ------------------------------------- */

/*
 * Represents one row from the CSV file.
 *
 * CSV values arrive as strings.
 * Optional fields may be empty.
 */
type PortugueseVerbConjugationSeed = {
  courseCode: string;
  unitCode: string;

  infinitive: string;
  mood: string;
  tense: string;

  // Affirmative forms
  eu?: string;
  tu?: string;
  eleElaVoce?: string;
  nos?: string;
  elesElasVoces?: string;

  // IPA for affirmative forms
  ipaEu?: string;
  ipaTu?: string;
  ipaEleElaVoce?: string;
  ipaNos?: string;
  ipaElesElasVoces?: string;

  // Negative forms
  negativeEu?: string;
  negativeTu?: string;
  negativeEleElaVoce?: string;
  negativeNos?: string;
  negativeElesElasVoces?: string;

  // IPA for negative forms
  negativeIpaEu?: string;
  negativeIpaTu?: string;
  negativeIpaEleElaVoce?: string;
  negativeIpaNos?: string;
  negativeIpaElesElasVoces?: string;

  // Semantic tags
  tags?: string;

  // Grammar / course tags
  curriculumTags?: string;
};


/* ------------------------------------- */
/*              Helpers                  */
/* ------------------------------------- */

/*
 * Removes spaces before and after a value.
 *
 * Empty or undefined values become an empty string.
 */
const cleanValue = (
  value?: string
): string => {
  return value?.trim() ?? "";
};


/*
 * Converts Anki-style space-separated tags
 * into an array.
 *
 * Example:
 *
 * "ar reflexos irregular"
 *
 * becomes:
 *
 * ["ar", "reflexos", "irregular"]
 */
const parseTags = (
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
 * Creates a Portuguese conjugation forms object.
 *
 * Empty values are not included.
 *
 * This is important because some conjugations
 * do not use all grammatical persons.
 *
 * Example:
 * the imperative does not have an "eu" form.
 */
const buildForms = (
  euValue?: string,
  tuValue?: string,
  eleElaVoceValue?: string,
  nosValue?: string,
  elesElasVocesValue?: string
): IPortugueseVerbForms | undefined => {

  const eu = cleanValue(euValue);
  const tu = cleanValue(tuValue);
  const eleElaVoce =
    cleanValue(eleElaVoceValue);
  const nos = cleanValue(nosValue);
  const elesElasVoces =
    cleanValue(elesElasVocesValue);


  const forms: IPortugueseVerbForms = {
    ...(eu && { eu }),
    ...(tu && { tu }),
    ...(eleElaVoce && { eleElaVoce }),
    ...(nos && { nos }),
    ...(elesElasVoces && {
      elesElasVoces
    })
  };


  /*
   * If all values were empty,
   * return undefined.
   *
   * This prevents storing empty objects
   * such as:
   *
   * negativeForms: {}
   */
  return Object.keys(forms).length > 0
    ? forms
    : undefined;
};


/* ------------------------------------- */
/*              Seed                     */
/* ------------------------------------- */

const seedPortugueseVerbConjugations =
  async () => {

    try {

      /* --------------------------------- */
      /* 1. Connect to MongoDB             */
      /* --------------------------------- */

      await connectDB();


      /* --------------------------------- */
      /* 2. Locate CSV file                */
      /* --------------------------------- */

      const filePath = path.resolve(
        __dirname,
        "data/pt-verb-conjugations.csv"
      );


      /* --------------------------------- */
      /* 3. Read CSV using Node.js fs      */
      /* --------------------------------- */

      const fileContent = fs.readFileSync(
        filePath,
        "utf-8"
      );


      /* --------------------------------- */
      /* 4. Parse CSV                      */
      /* --------------------------------- */

      /*
       * columns: true
       * Uses the first row as column names.
       *
       * skip_empty_lines: true
       * Ignores empty CSV rows.
       *
       * trim: true
       * Removes extra whitespace.
       *
       * bom: true
       * Handles the UTF-8 BOM that Excel
       * may add when exporting CSV files.
       */
      const rows = parse(
        fileContent,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true
        }
      ) as PortugueseVerbConjugationSeed[];


      if (rows.length === 0) {
        throw new Error(
          "Portuguese verb CSV contains no data"
        );
      }


      console.log(
        `${rows.length} Portuguese verb rows loaded from CSV`
      );


      /* --------------------------------- */
      /* 5. Get Course documents          */
      /* --------------------------------- */

      /*
       * Extract unique course codes from
       * the CSV.
       */
      const courseCodes = [
        ...new Set(
          rows
            .map((row) =>
              cleanValue(
                row.courseCode
              ).toLowerCase()
            )
            .filter(Boolean)
        )
      ];


      /*
       * Find the corresponding courses
       * in MongoDB.
       */
      const courses = await Course.find({
        code: {
          $in: courseCodes
        }
      });


      /*
       * Creates a map such as:
       *
       * "pt-conjugation" -> Course document
       *
       * This avoids querying MongoDB again
       * for every CSV row.
       */
      const coursesByCode = new Map(
        courses.map((course) => [
          course.code,
          course
        ])
      );


      /* --------------------------------- */
      /* 6. Transform CSV rows             */
      /* --------------------------------- */

      const conjugations:
        IPortugueseVerbConjugation[] = [];


      /*
       * Used to detect duplicated
       * conjugations inside the CSV.
       */
      const seen =
        new Set<string>();


      for (
        let index = 0;
        index < rows.length;
        index++
      ) {

        const row = rows[index];

        if (!row) {
          continue;
        }


        /*
         * +2 because:
         *
         * index begins at 0
         * CSV row 1 contains headers
         */
        const csvRowNumber =
          index + 2;


        /* ------------------------------- */
        /* Required fields                 */
        /* ------------------------------- */

        const courseCode =
          cleanValue(
            row.courseCode
          ).toLowerCase();

        const unitCode =
          cleanValue(
            row.unitCode
          ).toLowerCase();

        const infinitive =
          cleanValue(
            row.infinitive
          ).toLowerCase();

        const mood =
          cleanValue(
            row.mood
          ).toLowerCase();

        const tense =
          cleanValue(
            row.tense
          ).toLowerCase();


        if (
          !courseCode ||
          !unitCode ||
          !infinitive ||
          !mood ||
          !tense
        ) {

          throw new Error(
            `Missing required data in CSV row ${csvRowNumber}`
          );
        }


        /* ------------------------------- */
        /* Resolve Course                  */
        /* ------------------------------- */

        const course =
          coursesByCode.get(
            courseCode
          );


        if (!course) {

          throw new Error(
            `Course "${courseCode}" not found ` +
            `(CSV row ${csvRowNumber})`
          );
        }


        /* ------------------------------- */
        /* Resolve embedded Unit           */
        /* ------------------------------- */

        /*
         * Units are embedded inside Course,
         * so we search inside course.units.
         */
        const unit =
          course.units.find(
            (courseUnit) =>
              courseUnit.code ===
              unitCode
          );


        if (!unit) {

          throw new Error(
            `Unit "${unitCode}" not found ` +
            `in course "${courseCode}" ` +
            `(CSV row ${csvRowNumber})`
          );
        }


        /*
         * The embedded unit has its own _id.
         */
        const unitId = (
          unit as typeof unit & {
            _id: Types.ObjectId;
          }
        )._id;


        /* ------------------------------- */
        /* Affirmative forms               */
        /* ------------------------------- */

        const forms = buildForms(
          row.eu,
          row.tu,
          row.eleElaVoce,
          row.nos,
          row.elesElasVoces
        );


        /*
         * Every conjugation must contain
         * at least one verbal form.
         */
        if (!forms) {

          throw new Error(
            `No conjugation forms found for ` +
            `"${infinitive}" ` +
            `(CSV row ${csvRowNumber})`
          );
        }


        /* ------------------------------- */
        /* Affirmative IPA                 */
        /* ------------------------------- */

        const pronunciation =
          buildForms(
            row.ipaEu,
            row.ipaTu,
            row.ipaEleElaVoce,
            row.ipaNos,
            row.ipaElesElasVoces
          );


        /* ------------------------------- */
        /* Negative forms                  */
        /* ------------------------------- */

        const negativeForms =
          buildForms(
            row.negativeEu,
            row.negativeTu,
            row.negativeEleElaVoce,
            row.negativeNos,
            row.negativeElesElasVoces
          );


        /* ------------------------------- */
        /* Negative IPA                    */
        /* ------------------------------- */

        const negativePronunciation =
          buildForms(
            row.negativeIpaEu,
            row.negativeIpaTu,
            row.negativeIpaEleElaVoce,
            row.negativeIpaNos,
            row.negativeIpaElesElasVoces
          );


        /* ------------------------------- */
        /* Duplicate validation            */
        /* ------------------------------- */

        /*
         * Must match the unique index
         * defined in the model:
         *
         * course + infinitive + mood + tense
         */
        const uniqueKey = [
          courseCode,
          infinitive,
          mood,
          tense
        ].join("::");


        if (seen.has(uniqueKey)) {

          throw new Error(
            `Duplicate conjugation ` +
            `"${uniqueKey}" ` +
            `(CSV row ${csvRowNumber})`
          );
        }


        seen.add(uniqueKey);


        /* ------------------------------- */
        /* Build MongoDB document          */
        /* ------------------------------- */

        conjugations.push({

          course:
            course._id as Types.ObjectId,

          unitId,

          infinitive,
          mood,
          tense,

          forms,


          /*
           * These properties are added
           * only when data exists.
           */
          ...(pronunciation && {
            pronunciation
          }),

          ...(negativeForms && {
            negativeForms
          }),

          ...(negativePronunciation && {
            negativePronunciation
          }),


          tags:
            parseTags(
              row.tags
            ),

          curriculumTags:
            parseTags(
              row.curriculumTags
            )
        });
      }


      /* --------------------------------- */
      /* 7. Get affected Course IDs        */
      /* --------------------------------- */

      const courseIds = [
        ...new Map(
          conjugations.map(
            (conjugation) => [
              conjugation.course.toString(),
              conjugation.course
            ]
          )
        ).values()
      ];


      /* --------------------------------- */
      /* 8. Remove previous seed data      */
      /* --------------------------------- */

      /*
       * This happens only AFTER all CSV
       * rows have passed validation.
       *
       * Only conjugations belonging to the
       * affected courses are removed.
       */
      await PortugueseVerbConjugation
        .deleteMany({
          course: {
            $in: courseIds
          }
        });


      console.log(
        "Previous Portuguese verb conjugations cleared"
      );


      /* --------------------------------- */
      /* 9. Insert new conjugations        */
      /* --------------------------------- */

      const createdConjugations =
        await PortugueseVerbConjugation
          .insertMany(
            conjugations
          );


      console.log(
        `${createdConjugations.length} ` +
        `Portuguese verb conjugations seeded`
      );


    } catch (error) {

      console.error(
        "Error seeding Portuguese verb conjugations:",
        error
      );

      process.exitCode = 1;


    } finally {

      /* --------------------------------- */
      /* 10. Close database connection     */
      /* --------------------------------- */

      await mongoose.connection.close();

      console.log(
        "Database connection closed"
      );
    }
  };


seedPortugueseVerbConjugations();