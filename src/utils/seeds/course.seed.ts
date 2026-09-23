/*
 * src/utils/seeds/course.seed.ts
 *
 * Loads courses and embedded units from JSON.
 * Language codes are resolved to MongoDB Language references before insertion.
 */

import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'

import Course from '../../api/models/Course.model'
import Language from '../../api/models/Language.model'
import { connectDB } from '../../config/db'


type UnitSeed = {
    code: string
    title: string
    description?: string
    order: number
}

type CourseSeed = {
    code: string
    languageCode: string
    title: string
    level: string
    description?: string
    structure: 'units' | 'exercises'
    units: UnitSeed[]
}


const seedCourses = async () => {
    try {
        await connectDB()

        const filePath = path.resolve(
            __dirname,
            'data/courses.json'
        )

        const fileContent = fs.readFileSync(
            filePath,
            'utf-8'
        )

        const courses: CourseSeed[] =
            JSON.parse(fileContent)

        for (const courseData of courses) {
            const language = await Language.findOne({
                code: courseData.languageCode,
            })

            if (!language) {
                throw new Error(
                    `Language not found: ${courseData.languageCode}`
                )
            }

            const {
                languageCode,
                ...course
            } = courseData

            await Course.updateOne(
                {
                    code: course.code
                },
                {
                    $set: {
                        ...course,
                        language: language._id
                    }
                },
                {
                    upsert: true
                }
            );
        }

        console.log(
            `${courses.length} courses seeded`
        )
    } catch (error) {
        console.error(
            'Error seeding courses:',
            error
        )
    } finally {
        await mongoose.connection.close()
        console.log(
            "Database connection closed"
        )
    }
}

seedCourses()