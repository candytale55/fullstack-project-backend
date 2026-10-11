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

// Builds the final set of tags for a vocabulary item based on its raw tags and level.
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
    const filePath = path.resolve(__dirname, "data/vocabulary.tsv");

    // Resolve the image directory relative to this seed file.
    const imageDirectory = path.resolve(__dirname, "../../assets/images");

    // Reads the content of the TSV file into memory before processing it.
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Parses the TSV content into an array of rows.
    // Discards empty lines and processes the UTF-8 BOM.
    const rows = parse(fileContent, {
      columns: true,
      delimiter: "\t", // Configures the parser to use tab
      skip_empty_lines: true,  // Discards empty lines
      trim: true,     // Trims whitespace from each field
      bom: true,      // Processes the UTF-8 BOM if present
      quote: false,   // Disables quote parsing //TODO ???
    }) as VocabularySeedRow[];

    console.log(`${rows.length} vocabulary rows loaded`);

    /*
      * Before connecting to external services or changing database records
      * three structures are used: codes, imageFilenames, and imagePaths.
      * This ensures that any issues are caught early and prevents
      * potential errors when interacting with external services or the 
      * database. (Fail-Fast pattern)
     */

    // Almacena los códigos de vocabulario ya procesados para detectar duplicados. //TODO ??
    const codes = new Set<string>();

    // Registra nombres de archivos de imagen únicos ya validados. Si varios términos reutilizan la misma imagen, se valida y añade una sola vez.
    const imageFilenames = new Set<string>();
    
    // Mapea el nombre de la imagen(clave) con su ruta absoluta resuelta en disco(valor).
    const imagePaths = new Map<string, string>();

    for (const row of rows) {

      // para asegurar que no haya valores nulos o cadenas compuestas solo por espacios
      const code = cleanValue(row.code);

      // Comprueba que los 4 campos estructurales esenciales existan. Si falta alguno, lanza una excepción que aborta el script indicando la fila problemática
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

      // Comprueba si el código de vocabulario ya ha sido procesado para evitar duplicados. Si se encuentra un duplicado, lanza una excepción.
      if (codes.has(code)) {
        throw new Error(
          `Duplicate vocabulary code: ${code}`
        );
      }

      codes.add(code);

      // Si la fila no especifica imagen o el archivo ya fue procesado y validado anteriormente, pasa a la siguiente fila mediante continue
      const filename = cleanValue(row.mediaReferences);

      if (!filename || imageFilenames.has(filename)) {
        continue;
      }

      // Previene navegación de directorios (Path Traversal)
      // Exige que el valor sea exclusivamente un nombre de archivo plano
      // (por ejemplo, sun.png o gato.jpg). Si contiene barras diagonales (estándar Unix/Linux/macOS) o invertidas (estándar Windows), se rechaza de inmediato.
      // Evita que se pasen alias de sistema que representen el directorio actual (.) o el directorio padre (..).
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


      // Concatena el directorio base(imageDirectory) con el nombre del archivo de forma segura y adaptada al separador del sistema operativo en ejecución.
      const imagePath = path.join(imageDirectory, filename);


      // Convención de nomenclatura heredada
      // Genera la ruta alternativa con un guion bajo prefijado al nombre del archivo, útil para casos donde la imagen original no existe.
      const underscoredImagePath = path.join(imageDirectory, `_${filename}`);

      // Si la comprobación original se cumple, asigna imagePath a resolvedImagePath; de lo contrario, asume como candidato el nombre con guion bajo (underscoredImagePath)
      const resolvedImagePath =
        fs.existsSync(imagePath) && fs.statSync(imagePath).isFile()
          ? imagePath
          : underscoredImagePath;

      // Verifica la existencia del archivo de imagen resuelto; si no existe, lanza una excepción.
      if (
        !fs.existsSync(resolvedImagePath) ||
        !fs.statSync(resolvedImagePath).isFile()
      ) {
        throw new Error(
          `Image file not found: ${imagePath}`
        );
      }

      // Agrega el nombre del archivo a un Set<string>. En las siguientes iteraciones del bucle, la condición if (imageFilenames.has(filename)) continue; saltará este archivo, evitando comprobar el disco varias veces para imágenes compartidas entre múltiples palabras de vocabulario
      imageFilenames.add(filename);
      imagePaths.set(filename, resolvedImagePath);
    }

    // At this point, all image filenames have been validated and their paths resolved.
    /* Al validar la presencia de todos los archivos locales en memoria antes de invocar connectDB() o llamar a Cloudinary, garantiza que el script no deje la base de datos a medio sincronizar ni gaste cuota en la API si faltaba alguna imagen. */

    // Connect only after validation
    await connectDB();


    // Connect to Cloudinary only if there are images to upload.
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


    // Delete all existing vocabulary items before seeding new ones.
    
/*     const deleteResult = await VocabularyItem.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing vocabulary items`); */

    
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

    await VocabularyItem.deleteMany({
      code: { $nin: vocabularyItems.map((item) => item.code) },
    });

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