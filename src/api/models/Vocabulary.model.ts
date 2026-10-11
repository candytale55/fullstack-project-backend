/* Defines vocabulary documents linked to courses or embedded course units. */

import mongoose, { Schema } from "mongoose";



export interface IVocabularyImage {
  // `filename` refers to the local source asset used by the seed. URL and publicId
  // are added after the asset has been uploaded to Cloudinary.
  filename: string;
  url?: string;
  publicId?: string; // Cloudinary public ID for the image
}

export interface IVocabularyItem {
  // `code` is the stable source-data key; languageCode groups vocabulary without a
  // Course reference because imported vocabulary can be shared across courses.
  code: string;
  languageCode: string;

  term: string;
  level?: string;
  partOfSpeech?: string;

  definition: string;
  example?: string;
  clozeExample?: string;

  pronunciation?: string;
  pronunciationSecondary?: string;

  tags: string[];
  curriculumReferences: string[];

  image?: IVocabularyImage;
}

/* ------------------------------- */

// Images are embedded value objects rather than their own collection, so they do
// not need independent _id values.
const vocabularyImageSchema =
  new Schema<IVocabularyImage>(
    {
      filename: {
        type: String,
        required: true,
        trim: true
      },
      url: {
        type: String,
        trim: true
      },
      publicId: {
        type: String,
        trim: true
      }
    },
    {
      _id: false /* Prevents mongoose _id  */
    }
  );

// The seed and administrative API both rely on this schema to normalize text and
// enforce the required code, language, term, and definition fields.
const vocabularySchema =
  new Schema<IVocabularyItem>(
    {
      code: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      languageCode: {
        type: String,
        required: true,
        trim: true
      },
      term: {
        type: String,
        required: true,
        trim: true
      },
      level: {
        type: String,
        trim: true
      },
      partOfSpeech: {
        type: String,
        trim: true
      },
      definition: {
        type: String,
        required: true,
        trim: true
      },
      example: {
        type: String,
        trim: true
      },
      clozeExample: {
        type: String,
        trim: true
      },
      pronunciation: {
        type: String,
        trim: true
      },
      pronunciationSecondary: {
        type: String,
        trim: true
      },
      tags: {
        type: [String],
        default: []
      },
      curriculumReferences: {
        type: [String],
        default: []
      },
      image: {
        type: vocabularyImageSchema,
      }
    },
    {
      timestamps: true
    }
  );


/* ------------------------------- */

const VocabularyItem =
  mongoose.model<IVocabularyItem>(
    "VocabularyItem",
    vocabularySchema,
    "vocabulary"
  );


export default VocabularyItem;