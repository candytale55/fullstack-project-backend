/*
 * src/seeds/seedLanguages.ts
 *
 * Loads the initial language catalog from JSON into MongoDB.
 * Courses will later reference these records through their language ObjectId.
 */

import dotenv from "dotenv";
import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'

import Language from '../../api/models/Language.model'
import { connectDB } from '../../config/db'


type LanguageSeed = {
    name: string
    nativeName: string
    code: string
}


const seedLanguages = async () => {
    try {
        await connectDB()

        const filePath = path.resolve(
            __dirname,
            'data/languages.json'
        )

        const fileContent = fs.readFileSync(
            filePath,
            'utf-8'
        )

        const languages: LanguageSeed[] =
            JSON.parse(fileContent)

        await Language.deleteMany({})

        const createdLanguages =
            await Language.insertMany(languages)

        console.log(
            `${createdLanguages.length} languages seeded`
        )
    } catch (error) {
        console.error(
            'Error seeding languages:',
            error
        )
    } finally {
        await mongoose.connection.close()
    }
}


seedLanguages()