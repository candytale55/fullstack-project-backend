/*
 * src/api/models/PortugueseVerbConjugation.model.ts
 *
 * Defines Portuguese verb conjugation data used by grammar exercises.
 * Each document represents one verb or verbal expression
 * in one mood and tense.
 *
 * Conjugations are imported from CSV files and linked to a Course.
 * They may optionally belong to an embedded Course unit.
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


            /*
             * Semantic tags.
             *
             * Example:
             * health
             */
            tags: {
                type: [String],
                default: []
            },


            /*
             * Grammar and curriculum classification.
             *
             * Examples:
             * ar
             * reflexos
             * irregular
             * derivados
             */
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
 * Prevents importing the same conjugation
 * more than once inside the same course.
 *
 * The complete infinitive/expression is used here,
 * so "gostar" and "gostar de" are treated as
 * different entries.
 */
portugueseVerbConjugationSchema.index(
    {
        course: 1,
        infinitive: 1,
        mood: 1,
        tense: 1
    },
    {
        unique: true
    }
);


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