/*
 * src/api/models/PortugueseVerbConjugation.model.ts
 *
 * Defines Portuguese verb conjugation data used by grammar exercises.
 * Each document represents one verb or verbal expression
 * in one mood and tense.
 *
 * Anki tags select the Course and its embedded unit during seeding.
 */

import mongoose, { Schema, Types } from "mongoose";


/* ------------------------------------- */
/*     Portuguese Conjugation Forms      */
/* ------------------------------------- */

/*
 * Portuguese grammatical persons used
 * by the conjugation dataset.
 *
 * All properties are optional because not every
 * verbal form uses every grammatical person.
 *
 * Example:
 * the imperative does not have an "eu" form.
 */
export interface IPortugueseVerbForms {
    eu?: string;
    tu?: string;
    eleElaVoce?: string;
    nos?: string;
    elesElasVoces?: string;
}


const portugueseVerbFormsSchema =
    new Schema<IPortugueseVerbForms>(
        {
            eu: {
                type: String,
                trim: true
            },

            tu: {
                type: String,
                trim: true
            },

            eleElaVoce: {
                type: String,
                trim: true
            },

            nos: {
                type: String,
                trim: true
            },

            elesElasVoces: {
                type: String,
                trim: true
            }
        },
        {
            /*
             * These forms are part of the parent document
             * and do not need their own MongoDB _id.
             */
            _id: false
        }
    );


/* ------------------------------------- */
/*     Portuguese Verb Conjugation       */
/* ------------------------------------- */

export interface IPortugueseVerbConjugation {
    course: Types.ObjectId;
    unitId?: Types.ObjectId;
    sourceKey: string;

    infinitive: string;

    mood: string;
    tense: string;

    forms: IPortugueseVerbForms;
    pronunciation?: IPortugueseVerbForms;

    negativeForms?: IPortugueseVerbForms;
    negativePronunciation?: IPortugueseVerbForms;

    tags: string[];
    curriculumTags: string[];
}


const portugueseVerbConjugationSchema =
    new Schema<IPortugueseVerbConjugation>(
        {
            /*
             * References the Course document.
             *
             * The language does not need to be stored here
             * because this collection is exclusively Portuguese
             * and the Course is already related to a Language.
             */
            course: {
                type: Schema.Types.ObjectId,
                ref: "Course",
                required: true
            },


            /*
             * References the _id of an embedded Course unit.
             *
             * There is no "Unit" ref because units are embedded
             * inside Course documents.
             */
            unitId: {
                type: Schema.Types.ObjectId
            },

            /* Identifies the complete source row so valid form variants coexist. */
            sourceKey: {
                type: String,
                required: true,
                trim: true
            },


            /*
             * Stores the verb or verbal expression.
             *
             * Examples:
             * falar
             * gostar
             * gostar de
             * lembrar-se de
             */
            infinitive: {
                type: String,
                required: true,
                trim: true,
                lowercase: true
            },


            /*
             * Grammatical mood.
             *
             * Examples:
             * indicativo
             * imperativo
             */
            mood: {
                type: String,
                required: true,
                trim: true,
                lowercase: true
            },


            /*
             * Tense or tense label used by the dataset.
             *
             * Examples:
             * presente
             * imperfeito
             * imperativo (presente)
             */
            tense: {
                type: String,
                required: true,
                trim: true,
                lowercase: true
            },


            /*
             * Affirmative conjugation forms.
             */
            forms: {
                type: portugueseVerbFormsSchema,
                required: true
            },


            /*
             * IPA pronunciation corresponding
             * to the affirmative forms.
             */
            pronunciation: {
                type: portugueseVerbFormsSchema
            },


            /*
             * Negative forms are optional because
             * they are not stored for every mood/tense.
             */
            negativeForms: {
                type: portugueseVerbFormsSchema
            },


            /*
             * IPA pronunciation corresponding
             * to the negative forms.
             */
            negativePronunciation: {
                type: portugueseVerbFormsSchema
            },


            /* Stores every normalized Anki tag for future exact-tag searches. */
            tags: {
                type: [String],
                default: []
            },


            /* Keeps the legacy grammar-tag view derived from the full tag set. */
            curriculumTags: {
                type: [String],
                default: []
            }
        },
        {
            timestamps: true
        }
    );


/*
 * Prevents importing an identical Anki row more than once for a course.
 * Form variants sharing an infinitive, mood, and tense remain distinct.
 */
portugueseVerbConjugationSchema.index(
    {
        course: 1,
        sourceKey: 1
    },
    {
        unique: true
    }
);

// Supports the unit query used when opening a conjugation exercise.
portugueseVerbConjugationSchema.index({
    unitId: 1,
    infinitive: 1
});

// Supports exact tag combinations requested by future practice selectors.
portugueseVerbConjugationSchema.index({
    tags: 1
});


/* ------------------------------------- */
/*              Model                    */
/* ------------------------------------- */

const PortugueseVerbConjugation =
    mongoose.model<IPortugueseVerbConjugation>(
        "PortugueseVerbConjugation",
        portugueseVerbConjugationSchema,
        "portugueseVerbConjugations"
    );


export default PortugueseVerbConjugation;