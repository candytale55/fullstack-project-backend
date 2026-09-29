/* Loads vocabulary from a TSV and uploads its local images to Cloudinary. */

import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { parse } from "csv-parse/sync";

import VocabularyItem, {
  type IVocabularyItem,
  type IVocabularyImage,
} from "../../api/models/Vocabulary.model";

import { connectDB } from "../../config/db";
import { connectCloudinary } from "../../config/cloudinary";

// Describes the columns expected in each parsed TSV record.
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

// Trims a TSV value and turns missing values into an empty string.
const cleanValue = (value?: string): string => {
  return value?.trim() ?? "";
};

// Splits whitespace-separated tags/references and removes duplicates.
const parseList = (value?: string): string[] => {
  const cleanedValue = cleanValue(value);

  if (!cleanedValue) {
    return [];
  }

  return [...new Set(cleanedValue.split(/\s+/))];
};

// Keeps valid CEFR levels, including sublevels such as A2.1.
const normalizeLevel = (value?: string): string | undefined => {
  const level = cleanValue(value);

  if (!level) {
    // Combines TSV tags with derived tags based on the level and source category.
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
  const rawLevel = cleanValue(levelValue).toLowerCase();
  const normalizedLevel = normalizeLevel(levelValue);

  if (rawLevel === "hard") {
    tags.push("hard");
  }

  const hasFanficTag = tags.some(
    (tag) => tag.startsWith("fanfic::")
  );

  const hasBookTag = tags.some(
    (tag) => tag.startsWith("book::")
  );

  if (!normalizedLevel || hasFanficTag || hasBookTag) {
    tags.push("free-vocabulary");
  }

  return [...new Set(tags)];
};

/* ------------------------------------- */
/* Seed                                  */
/* ------------------------------------- */

// Validates the source data, resolves images, and replaces vocabulary records.
const seedVocabulary = async () => {
  try {
    // Resolve the TSV and image directory relative to this seed file.
    const filePath = path.resolve(
      __dirname,
      "data/vocabulary.tsv"
    );

    const imageDirectory = path.resolve(
      __dirname,
      "../../assets/images"
    );

    const fileContent = fs.readFileSync(filePath, "utf-8");

    const rows = parse(fileContent, {
      columns: true,
      delimiter: "\t",
      skip_empty_lines: true,
      trim: true,
      bom: true,
      quote: false,
    }) as VocabularySeedRow[];

    console.log(`${rows.length} vocabulary rows loaded`);

    /*
      * Validate every required field, duplicate code, and referenced image
      * before connecting to external services or changing database records.
     */
    const codes = new Set<string>();
    const imageFilenames = new Set<string>();
    const imagePaths = new Map<string, string>();

    for (const row of rows) {
      const code = cleanValue(row.code);

      if (
        !code ||
        !cleanValue(row.languageCode) ||
        !cleanValue(row.term) ||
        !cleanValue(row.definition)
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

      const filename = cleanValue(row.mediaReferences);

      if (!filename || imageFilenames.has(filename)) {
        continue;
      }

      // The TSV must contain a filename, not a directory path.
      if (
        filename.includes("/") ||
        filename.includes("\\") ||
        filename === "." ||
        filename === ".."
      ) {
        throw new Error(
          `Invalid image filename: ${filename}`
        );
      }

      const imagePath = path.join(
        imageDirectory,
        filename
      );
      const underscoredImagePath = path.join(
        imageDirectory,
        `_${filename}`
      );
      const resolvedImagePath =
        fs.existsSync(imagePath) && fs.statSync(imagePath).isFile()
          ? imagePath
          : underscoredImagePath;

      if (
        !fs.existsSync(resolvedImagePath) ||
        !fs.statSync(resolvedImagePath).isFile()
      ) {
        throw new Error(
          `Image file not found: ${imagePath}`
        );
      }

      imageFilenames.add(filename);
      imagePaths.set(filename, resolvedImagePath);
    }

    // Connect only after validation; configure Cloudinary only when images exist.
    await connectDB();


    const cloudinary = imageFilenames.size > 0
      ? connectCloudinary()
      : null;

    /*
     * Load saved Cloudinary metadata before replacing collection records,
     * allowing unchanged image files to be reused without uploading again.
     */
    const existingImages = imageFilenames.size > 0
      ? await VocabularyItem.find({
        "image.filename": {
          $in: [...imageFilenames],
        },
        "image.url": {
          $exists: true,
          $ne: "",
        },
        "image.publicId": {
          $exists: true,
          $ne: "",
        },
      })
        .select("image")
        .lean()
      : [];


    const imageCache = new Map<
      string,
      IVocabularyImage
    >();

    for (const item of existingImages) {
      if (
        item.image?.filename &&
        item.image.url &&
        item.image.publicId
      ) {
        imageCache.set(
          item.image.filename,
          item.image
        );
      }
    }

    let uploadedImages = 0;
    const vocabularyItems: IVocabularyItem[] = [];

    /*
     * Build the replacement dataset in memory. Upload missing images and
     * reuse cached metadata so database records remain untouched on failure.
     */
    for (const row of rows) {
      const code = cleanValue(row.code);

      const languageCode = cleanValue(
        row.languageCode
      ).toLowerCase();

      const term = cleanValue(row.term);
      const definition = cleanValue(row.definition);

      const level = normalizeLevel(row.level);
      const partOfSpeech = cleanValue(row.partOfSpeech);
      const example = cleanValue(row.example);
      const clozeExample = cleanValue(row.clozeExample);
      const pronunciation = cleanValue(
        row.pronunciation
      );

      const pronunciationSecondary = cleanValue(
        row.pronunciationSecondary
      );

      const imageFilename = cleanValue(
        row.mediaReferences
      );

      let image: IVocabularyImage | undefined;

      if (imageFilename) {
        image = imageCache.get(imageFilename);

        if (!image) {
          if (!cloudinary) {
            throw new Error(
              "Cloudinary is not configured"
            );
          }

          const imagePath = imagePaths.get(imageFilename);

          if (!imagePath) {
            throw new Error(
              `Image path not found for: ${imageFilename}`
            );
          }

          const uploaded = await cloudinary.uploader.upload(
            imagePath,
            {
              folder: "vocabulary",
              resource_type: "image",
            }
          );

          image = {
            filename: imageFilename,
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
          };

          // Another row with this filename reuses the result.
          imageCache.set(imageFilename, image);
          uploadedImages++;
        }
      }

      const vocabularyData: IVocabularyItem = {
        code,
        languageCode,
        term,
        definition,

        tags: buildTags(
          row.tags,
          row.level
        ),

        curriculumReferences: parseList(
          row.curriculumReferences
        ),

        ...(level && { level }),
        ...(partOfSpeech && { partOfSpeech }),
        ...(example && { example }),
        ...(clozeExample && { clozeExample }),
        ...(pronunciation && { pronunciation }),
        ...(pronunciationSecondary && {
          pronunciationSecondary,
        }),

        // Includes filename, URL and public ID when present.
        ...(image && { image }),
      };

      vocabularyItems.push(vocabularyData);
    }

    // Upsert current records first, then remove codes no longer present in the TSV.
    await VocabularyItem.bulkWrite(
      vocabularyItems.map((item) => ({
        replaceOne: {
          filter: { code: item.code },
          replacement: item,
          upsert: true,
        },
      }))
    );

    const deleteResults = await VocabularyItem.deleteMany({
      code: { $nin: vocabularyItems.map((item) => item.code) },
    });

    console.log(
      `${deleteResults.deletedCount} obsolete vocabulary items deleted`
    );

    console.log(
      `${rows.length} vocabulary items seeded; ` +
      `${uploadedImages} images uploaded`
    );

  } catch (error) {
    console.error(
      "Error seeding vocabulary:",
      error
    );

    process.exitCode = 1;

  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

seedVocabulary();