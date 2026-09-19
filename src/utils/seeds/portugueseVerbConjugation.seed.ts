/*
 * src/utils/seeds/portugueseVerbConjugation.seed.ts
 *
 * Loads Portuguese verb conjugations from CSV using Node.js fs.
 *
 * The CSV keeps readable course and unit codes.
 * Before inserting the data, those codes are resolved to their
 * corresponding MongoDB ObjectIds.
 *
 * Empty optional cells are omitted instead of being stored
 * as empty strings or empty objects.
 */

import fs from 'node:fs'
import path from 'node:path'
import mongoose, { Types } from 'mongoose'

import { parse } from 'csv-parse/sync'

import Course from '../../api/models/Course.model'

import PortugueseVerbConjugation, {
  type IPortugueseVerbConjugation,
  type IPortugueseVerbForms,
} from '../../api/models/PortugueseVerbConjugation.model'

import { connectDB } from '../../config/db'


/* ========================================== */
/*              CSV DATA TYPES                */
/* ========================================== */

/*
 * All values arrive from the CSV as strings.
 *
 * Optional fields can be empty because not every verbal form
 * uses every person or negative form.
 */
type PortugueseVerbConjugationSeed = {
  courseCode: string
  unitCode: string

  infinitive: string
  mood: string
  tense: string

  // Affirmative forms
  eu?: string
  tu?: string
  eleElaVoce?: string
  nos?: string
  elesElasVoces?: string

  // Pronunciation of affirmative forms
  ipaEu?: string
  ipaTu?: string
  ipaEleElaVoce?: string
  ipaNos?: string
  ipaElesElasVoces?: string

  // Negative forms
  negativeEu?: string
  negativeTu?: string
  negativeEleElaVoce?: string
  negativeNos?: string
  negativeElesElasVoces?: string

  // Pronunciation of negative forms
  negativeIpaEu?: string
  negativeIpaTu?: string
  negativeIpaEleElaVoce?: string
  negativeIpaNos?: string
  negativeIpaElesElasVoces?: string

  tags?: string
  curriculumTags?: string
}


/* ========================================== */
/*               HELPER FUNCTIONS             */
/* ========================================== */

/*
 * Removes spaces added accidentally before or after
 * values in the CSV.
 */
const cleanValue = (
  value?: string
): string => {
  return value?.trim() ?? ''
}


/*
 * Anki tags are separated by spaces.
 *
 * Example:
 *
 * "ar reflexos irregular"
 *
 * becomes:
 *
 * ["ar", "reflexos", "irregular"]
 *
 * Set removes possible duplicate tags.
 */
const parseTags = (
  value?: string
): string[] => {
  const cleanedValue = cleanValue(value)

  if (!cleanedValue) {
    return []
  }

  return [
    ...new Set(
      cleanedValue.split(/\s+/)
    )
  ]
}


/*
 * Builds one Portuguese verb-forms object.
 *
 * Empty cells are not included in the returned object.
 *
 * This is useful because some conjugations do not use
 * every grammatical person. For example, the imperative
 * does not have an "eu" form.
 *
 * The same helper can be reused for:
 *
 * - affirmative forms
 * - negative forms
 * - pronunciation
 * - negative pronunciation
 */
const buildForms = (
  euValue?: string,
  tuValue?: string,
  eleElaVoceValue?: string,
  nosValue?: string,
  elesElasVocesValue?: string
): IPortugueseVerbForms | undefined => {

  const eu = cleanValue(euValue)
  const tu = cleanValue(tuValue)

  const eleElaVoce =
    cleanValue(eleElaVoceValue)

  const nos = cleanValue(nosValue)

  const elesElasVoces =
    cleanValue(elesElasVocesValue)


  const forms: IPortugueseVerbForms = {
    ...(eu && { eu }),

    ...(tu && { tu }),

    ...(eleElaVoce && {
      eleElaVoce
    }),

    ...(nos && { nos }),

    ...(elesElasVoces && {
      elesElasVoces
    }),
  }


  /*
   * If all five cells were empty, return undefined.
   *
   * This prevents MongoDB from storing:
   *
   * negativeForms: {}
   *
   * when negative forms do not exist.
   */
  return Object.keys(forms).length > 0
    ? forms
    : undefined
}


/* ========================================== */
/*                SEED FUNCTION               */
/* ========================================== */

const seedPortugueseVerbConjugations =
  async () => {

    try {

      /* ---------------------------------- */
      /* Connect to MongoDB                 */
      /* ---------------------------------- */

      await connectDB()


      /* ---------------------------------- */
      /* Read CSV file with Node.js fs      */
      /* ---------------------------------- */

      const filePath = path.resolve(
        __dirname,
        'data/pt-verb-conjugations.csv'
      )

      const fileContent = fs.readFileSync(
        filePath,
        'utf-8'
      )


      /* ---------------------------------- */
      /* Parse CSV rows                     */
      /* ---------------------------------- */

      /*
       * columns: true
       * Uses the first CSV row as property names.
       *
       * skip_empty_lines: true
       * Ignores completely empty rows.
       *
       * trim: true
       * Removes external whitespace from CSV values.
       */
      const rows =
        parse(
          fileContent,
          {
            columns: true,
            skip_empty_lines: true,
            trim: true,
          }
        ) as PortugueseVerbConjugationSeed[]


      if (rows.length === 0) {
        throw new Error(
          'Portuguese verb CSV contains no data'
        )
      }


      console.log(
        `${rows.length} Portuguese verb rows loaded from CSV`
      )


      /* ================================== */
      /* Resolve courses used by the CSV    */
      /* ================================== */

      /*
       * Extract unique course codes.
       *
       * Currently the file uses pt-conjugation,
       * but keeping this generic makes the seed reusable.
       */
      const courseCodes = [
        ...new Set(
          rows.map((row) =>
            cleanValue(
              row.courseCode
            ).toLowerCase()
          )
        )
      ]


      const courses = await Course.find({
        code: {
          $in: courseCodes
        }
      })


      /*
       * Map provides quick access:
       *
       * "pt-conjugation" -> Course document
       */
      const coursesByCode =
        new Map(
          courses.map((course) => [
            course.code,
            course
          ])
        )


      /* ================================== */
      /* Transform CSV -> MongoDB documents */
      /* ================================== */

      const conjugations:
        IPortugueseVerbConjugation[] = []


      /*
       * Used to detect duplicate conjugations
       * before anything is written to MongoDB.
       */
      const seen =
        new Set<string>()


      for (
        let index = 0;
        index < rows.length;
        index++
      ) {
        const row = rows[index]

        if (!row) {
          continue
        }


        /*
         * +2 because:
         *
         * index starts at 0
         * CSV row 1 contains the headers
         */
        const csvRowNumber =
          index + 2


        /* -------------------------------- */
        /* Required textual fields          */
        /* -------------------------------- */

        const courseCode =
          cleanValue(
            row.courseCode
          ).toLowerCase()

        const unitCode =
          cleanValue(
            row.unitCode
          ).toLowerCase()

        const infinitive =
          cleanValue(
            row.infinitive
          ).toLowerCase()

        const mood =
          cleanValue(
            row.mood
          ).toLowerCase()

        const tense =
          cleanValue(
            row.tense
          ).toLowerCase()


        /*
         * These fields are necessary to identify
         * and relate every conjugation.
         */
        if (
          !courseCode ||
          !unitCode ||
          !infinitive ||
          !mood ||
          !tense
        ) {
          throw new Error(
            `Missing required data in CSV row ${csvRowNumber}`
          )
        }


        /* -------------------------------- */
        /* Resolve Course                   */
        /* -------------------------------- */

        const course =
          coursesByCode.get(
            courseCode
          )


        if (!course) {
          throw new Error(
            `Course not found: "${courseCode}" ` +
            `(CSV row ${csvRowNumber})`
          )
        }


        /* -------------------------------- */
        /* Resolve embedded Unit            */
        /* -------------------------------- */

        /*
         * Units are embedded inside Course,
         * so unitCode is resolved inside
         * course.units instead of using a
         * separate Unit collection.
         */
        const unit =
          course.units.find(
            (courseUnit) =>
              courseUnit.code ===
              unitCode
          )


        if (!unit) {
          throw new Error(
            `Unit "${unitCode}" not found ` +
            `in course "${courseCode}" ` +
            `(CSV row ${csvRowNumber})`
          )
        }


        /*
         * The Mongoose subdocument has an _id
         * because the Course unitSchema was
         * created with _id enabled.
         */
        const unitId = (
          unit as typeof unit & {
            _id: Types.ObjectId
          }
        )._id


        /* -------------------------------- */
        /* Affirmative conjugation forms    */
        /* -------------------------------- */

        const forms =
          buildForms(
            row.eu,
            row.tu,
            row.eleElaVoce,
            row.nos,
            row.elesElasVoces
          )


        /*
         * A conjugation must contain at least
         * one actual verbal form.
         */
        if (!forms) {
          throw new Error(
            `No verb forms found for "${infinitive}" ` +
            `(CSV row ${csvRowNumber})`
          )
        }


        /* -------------------------------- */
        /* Pronunciation                    */
        /* -------------------------------- */

        const pronunciation =
          buildForms(
            row.ipaEu,
            row.ipaTu,
            row.ipaEleElaVoce,
            row.ipaNos,
            row.ipaElesElasVoces
          )


        /* -------------------------------- */
        /* Negative forms                   */
        /* -------------------------------- */

        const negativeForms =
          buildForms(
            row.negativeEu,
            row.negativeTu,
            row.negativeEleElaVoce,
            row.negativeNos,
            row.negativeElesElasVoces
          )


        const negativePronunciation =
          buildForms(
            row.negativeIpaEu,
            row.negativeIpaTu,
            row.negativeIpaEleElaVoce,
            row.negativeIpaNos,
            row.negativeIpaElesElasVoces
          )


        /* -------------------------------- */
        /* Duplicate validation             */
        /* -------------------------------- */

        /*
         * This should match the logical unique
         * combination used by the model:
         *
         * course + infinitive + mood + tense
         */
        const uniqueKey = [
          courseCode,
          infinitive,
          mood,
          tense
        ].join('::')


        if (seen.has(uniqueKey)) {
          throw new Error(
            `Duplicate conjugation "${uniqueKey}" ` +
            `(CSV row ${csvRowNumber})`
          )
        }


        seen.add(uniqueKey)


        /* -------------------------------- */
        /* Build MongoDB document           */
        /* -------------------------------- */

        conjugations.push({
          course:
            course._id as Types.ObjectId,

          unitId,

          infinitive,
          mood,
          tense,

          forms,

          /*
           * Optional objects are included only
           * when they contain actual data.
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
            ),
        })
      }


      /* ================================== */
      /* Replace previous conjugation data  */
      /* ================================== */

      /*
       * We only reach this point after ALL CSV rows
       * have been successfully validated.
       *
       * Therefore a malformed CSV will not delete
       * the existing database data.
       */


      /*
       * Extract unique Course ObjectIds used by
       * this dataset.
       */
      const courseIds = [
        ...new Map(
          conjugations.map(
            (conjugation) => [
              conjugation.course.toString(),
              conjugation.course
            ]
          )
        ).values()
      ]


      /*
       * Remove only conjugations belonging to
       * the courses represented in this CSV.
       *
       * We do not clear unrelated data.
       */
      await PortugueseVerbConjugation
        .deleteMany({
          course: {
            $in: courseIds
          }
        })


      console.log(
        'Previous Portuguese verb conjugations cleared'
      )


      /* ================================== */
      /* Insert validated data              */
      /* ================================== */

      const createdConjugations =
        await PortugueseVerbConjugation
          .insertMany(
            conjugations
          )


      console.log(
        `${createdConjugations.length} Portuguese verb conjugations seeded`
      )


    } catch (error) {

      console.error(
        'Error seeding Portuguese verb conjugations:',
        error
      )

      process.exitCode = 1

    } finally {

      await mongoose.connection.close()

      console.log(
        'Database connection closed'
      )
    }
  }


seedPortugueseVerbConjugations()