/* Seeds exercise definitions and resolves their database references. */

import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

import Course from "../../api/models/Course.model";
import Exercise from "../../api/models/Exercise.model";
import VocabularyItem from "../../api/models/Vocabulary.model";
import { connectDB } from "../../config/db";


type ExerciseSeed = {
    courseCode: string;
    unitCode: string;
    title: string;
    description?: string;
    type: "vocabulary" | "conjugation";
    order: number;
    languageCode?: string;
    tag?: string;
};


const seedExercises = async () => {
    try {
        await connectDB();

        const filePath = path.resolve(
            __dirname,
            "data/exercises.json"
        );
        const exercises = JSON.parse(
            fs.readFileSync(filePath, "utf-8")
        ) as ExerciseSeed[];

        for (const exerciseData of exercises) {
            const course = await Course.findOne({
                code: exerciseData.courseCode,
            });

            if (!course) {
                throw new Error(
                    `Course not found: ${exerciseData.courseCode}`
                );
            }

            const unit = course.units.find(
                (courseUnit) =>
                    courseUnit.code === exerciseData.unitCode
            );

            if (!unit) {
                throw new Error(
                    `Unit not found: ${exerciseData.courseCode}/${exerciseData.unitCode}`
                );
            }

            if (!unit._id) {
                throw new Error(
                    `Unit has no id: ${exerciseData.courseCode}/${exerciseData.unitCode}`
                );
            }

            const vocabularyItems = [] as { _id: mongoose.Types.ObjectId }[];

            if (exerciseData.type === "vocabulary") {
                if (!exerciseData.languageCode || !exerciseData.tag) {
                    throw new Error(
                        `Vocabulary exercise filters are incomplete: ${exerciseData.courseCode}/${exerciseData.unitCode}`
                    );
                }

                vocabularyItems.push(
                    ...(await VocabularyItem.find({
                        languageCode: exerciseData.languageCode,
                        tags: exerciseData.tag,
                    }).select("_id"))
                );
            }

            if (
                exerciseData.type === "vocabulary" &&
                vocabularyItems.length === 0
            ) {
                throw new Error(
                    `No vocabulary found for ${exerciseData.courseCode}/${exerciseData.unitCode}`
                );
            }

            await Exercise.updateOne(
                {
                    course: course._id,
                    unitId: unit._id,
                    type: exerciseData.type,
                },
                {
                    $set: {
                        title: exerciseData.title,
                        description: exerciseData.description,
                        order: exerciseData.order,
                        vocabularyItems: vocabularyItems.map(
                            (item) => item._id
                        ),
                    },
                },
                { upsert: true }
            );
        }

        console.log(
            `${exercises.length} exercises seeded`
        );
    } catch (error) {
        console.error("Error seeding exercises:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
};

seedExercises();
