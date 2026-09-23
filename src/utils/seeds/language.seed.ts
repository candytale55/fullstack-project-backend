/*
 * src/seeds/seedLanguages.ts
 *
 * Loads the initial language catalog from JSON into MongoDB.
 * Courses will later reference these records through their language ObjectId.
 */

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

        for (const language of languages) {

            const existingLanguage = await Language.findOne({
                code: language.code
            })

            if (existingLanguage) { 

                existingLanguage.name = language.name
                existingLanguage.nativeName = language.nativeName
                await existingLanguage.save()
                console.log(`Language ${language.code} already exists and was updated`)
                continue    
            }

            await Language.updateOne(
                {
                    code: language.code
                },
                {
                    $set: language
                },
                {
                    upsert: true
                }
            );
        }

        console.log(
            `${languages.length} languages seeded`
        );

    } catch (error) {
        console.error(
            'Error seeding languages:',
            error
        )
    } finally {
        await mongoose.connection.close()
        console.log(
            "Database connection closed"
        )
    }
}

seedLanguages()