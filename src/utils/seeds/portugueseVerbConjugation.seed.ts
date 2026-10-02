/* Loads Anki verb rows into PortugueseVerbConjugation using their course and unit tags. */

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import mongoose, { Types } from "mongoose";

import { parse } from "csv-parse/sync";

import Course from "../../api/models/Course.model";
import PortugueseVerbConjugation, {
    type IPortugueseVerbConjugation,
    type IPortugueseVerbForms
} from "../../api/models/PortugueseVerbConjugation.model";
import { connectDB } from "../../config/db";


const SOURCE_FILE = "data/pt-verb-conjugations-newest.csv";
const TARGET_COURSE_CODE = "pt-conjugation";
const TARGET_COURSE_TAG = `course-code::${TARGET_COURSE_CODE}`;
const ANKI_COLUMN_COUNT = 25;
const LEGACY_UNIT_CODES: Record<string, string> = {
    present: "presente"
};

const cleanValue = (value?: string): string =>
    value?.trim() ?? "";

const parseTags = (value?: string): string[] =>
    [...new Set(
        cleanValue(value)
            .split(/\s+/)
            .filter(Boolean)
    )].sort();

const buildForms = (
    euValue?: string,
    tuValue?: string,
    eleElaVoceValue?: string,
    nosValue?: string,
    elesElasVocesValue?: string
): IPortugueseVerbForms | undefined => {
    const eu = cleanValue(euValue);
    const tu = cleanValue(tuValue);
    const eleElaVoce = cleanValue(eleElaVoceValue);
    const nos = cleanValue(nosValue);
    const elesElasVoces = cleanValue(elesElasVocesValue);
    const forms: IPortugueseVerbForms = {
        ...(eu && { eu }),
        ...(tu && { tu }),
        ...(eleElaVoce && { eleElaVoce }),
        ...(nos && { nos }),
        ...(elesElasVoces && { elesElasVoces })
    };

    return Object.keys(forms).length > 0
        ? forms
        : undefined;
};

const getTagValues = (
    tags: readonly string[],
    prefix: string
): string[] => {
    const tagPrefix = `${prefix}::`;

    return [...new Set(
        tags
            .filter((tag) => tag.startsWith(tagPrefix))
            .map((tag) => tag.slice(tagPrefix.length))
            .filter((value) => value && !value.includes("::"))
    )].sort();
};

const getRequiredTagValue = (
    tags: readonly string[],
    prefixes: readonly string[],
    label: string,
    csvRowNumber: number
): string => {
    for (const prefix of prefixes) {
        const values = getTagValues(tags, prefix);

        if (values.length === 1) {
            return values[0] as string;
        }

        if (values.length > 1) {
            throw new Error(
                `Multiple ${label} tags in CSV row ${csvRowNumber}`
            );
        }
    }

    throw new Error(
        `Missing ${label} tag in CSV row ${csvRowNumber}`
    );
};

const getUnitCode = (
    tags: readonly string[],
    course: {
        units: Array<{ code: string }>;
    },
    csvRowNumber: number
): string => {
    const tagValues = [
        ...getTagValues(
            tags,
            `verbs::unit-code::${TARGET_COURSE_CODE}`
        ),
        ...getTagValues(
            tags,
            `unit-code::${TARGET_COURSE_CODE}`
        )
    ];
    const matchingUnitCodes = [...new Set(
        tagValues.map(
            (unitCode) =>
                LEGACY_UNIT_CODES[unitCode] ?? unitCode
        )
    )]
        .filter((unitCode) =>
            course.units.some(
                (unit) => unit.code === unitCode
            )
        );

    if (matchingUnitCodes.length === 1) {
        return matchingUnitCodes[0] as string;
    }

    if (matchingUnitCodes.length > 1) {
        throw new Error(
            `Multiple configured unit tags in CSV row ${csvRowNumber}`
        );
    }

    throw new Error(
        `No configured ${TARGET_COURSE_CODE} unit tag ` +
        `in CSV row ${csvRowNumber}`
    );
};

const createSourceKey = (row: readonly string[]): string =>
    createHash("sha256")
        .update(row.join("\u001F"))
        .digest("hex");

const getCurriculumTags = (
    tags: readonly string[]
): string[] => [
    ...new Set(
        tags.flatMap((tag) => {
            const [group, facet, language, value, ...rest] =
                tag.split("::");

            if (
                group !== "verbs" ||
                language !== "pt" ||
                rest.length > 0 ||
                !facet ||
                !value ||
                !["ending", "family", "flag"].includes(facet)
            ) {
                return [];
            }

            return [`${facet}-${value}`];
        })
    )
].sort();

const seedPortugueseVerbConjugations = async () => {
    try {
        await connectDB();

        const filePath = path.resolve(
            __dirname,
            SOURCE_FILE
        );
        const fileContent = fs.readFileSync(
            filePath,
            "utf-8"
        );
        const rows = parse(fileContent, {
            from_line: 4,
            skip_empty_lines: true,
            trim: true,
            bom: true
        }) as string[][];
        const targetRows = rows.filter((row) =>
            parseTags(row[24]).includes(TARGET_COURSE_TAG)
        );

        if (targetRows.length === 0) {
            throw new Error(
                `No rows tagged ${TARGET_COURSE_TAG}`
            );
        }

        const course = await Course.findOne({
            code: TARGET_COURSE_CODE
        });

        if (!course) {
            throw new Error(
                `Course "${TARGET_COURSE_CODE}" not found`
            );
        }

        const conjugations: IPortugueseVerbConjugation[] = [];
        const seenSourceKeys = new Set<string>();

        for (const [index, row] of rows.entries()) {
            const csvRowNumber = index + 4;
            const tags = parseTags(row[24]);

            if (!tags.includes(TARGET_COURSE_TAG)) {
                continue;
            }

            if (row.length !== ANKI_COLUMN_COUNT) {
                throw new Error(
                    `Expected ${ANKI_COLUMN_COUNT} columns in ` +
                    `CSV row ${csvRowNumber}, found ${row.length}`
                );
            }

            const unitCode = getUnitCode(
                tags,
                course,
                csvRowNumber
            );
            const unit = course.units.find(
                (courseUnit) =>
                    courseUnit.code === unitCode
            );

            if (!unit?._id) {
                throw new Error(
                    `Unit "${unitCode}" not found in course ` +
                    `"${TARGET_COURSE_CODE}" ` +
                    `(CSV row ${csvRowNumber})`
                );
            }

            const infinitive = cleanValue(row[1])
                .toLocaleLowerCase("pt-PT");
            const mood = getRequiredTagValue(
                tags,
                ["verbs::mood::pt", "mood::pt"],
                "mood",
                csvRowNumber
            );
            const tense = getRequiredTagValue(
                tags,
                ["verbs::tense::pt", "tense::pt"],
                "tense",
                csvRowNumber
            );
            const forms = buildForms(
                row[3],
                row[4],
                row[5],
                row[6],
                row[7]
            );

            if (!infinitive || !forms) {
                throw new Error(
                    `Missing infinitive or forms in CSV row ${csvRowNumber}`
                );
            }

            const sourceKey = createSourceKey(row);

            if (seenSourceKeys.has(sourceKey)) {
                throw new Error(
                    `Duplicate Anki row in CSV row ${csvRowNumber}`
                );
            }

            seenSourceKeys.add(sourceKey);

            const pronunciation = buildForms(
                row[13],
                row[14],
                row[15],
                row[16],
                row[17]
            );
            const negativeForms = buildForms(
                row[8],
                row[9],
                row[10],
                row[11],
                row[12]
            );
            const negativePronunciation = buildForms(
                row[18],
                row[19],
                row[20],
                row[21],
                row[22]
            );

            conjugations.push({
                course: course._id as Types.ObjectId,
                unitId: unit._id as Types.ObjectId,
                sourceKey,
                infinitive,
                mood,
                tense,
                forms,
                ...(pronunciation && { pronunciation }),
                ...(negativeForms && { negativeForms }),
                ...(negativePronunciation && {
                    negativePronunciation
                }),
                tags,
                curriculumTags: getCurriculumTags(tags)
            });
        }

        // Replaces the old infinitive/mood/tense uniqueness index before import.
        await PortugueseVerbConjugation.syncIndexes();
        await PortugueseVerbConjugation.deleteMany({
            course: course._id
        });
        const createdConjugations =
            await PortugueseVerbConjugation.insertMany(conjugations);

        console.log(
            `${createdConjugations.length} Portuguese conjugations ` +
            `seeded for ${TARGET_COURSE_CODE}; ` +
            `${rows.length - targetRows.length} rows for other ` +
            `courses were left out`
        );
    } catch (error) {
        console.error(
            "Error seeding Portuguese verb conjugations:",
            error
        );
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
};

seedPortugueseVerbConjugations();
