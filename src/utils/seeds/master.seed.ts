/*
 * src/utils/seeds/master.seed.ts
 *
 * Runs all existing seed scripts in dependency order.
 * Each seed remains independent.
 */

import { execSync } from 'node:child_process'


const runSeed = (
    name: string,
    script: string
) => {

    console.log(
        `\n========================================`
    )

    console.log(
        `Running seed: ${name}`
    )

    console.log(
        `========================================\n`
    )


    execSync(
        `npm run ${script}`,
        {
            stdio: 'inherit'
        }
    )
}


try {

    // 1. Independent collection
    runSeed(
        'Users',
        'seed:users'
    )


    // 2. Must exist before Courses
    runSeed(
        'Languages',
        'seed:languages'
    )


    // 3. Depends on Languages
    runSeed(
        'Courses',
        'seed:courses'
    )


    // 4. Depends on Courses and Units
    runSeed(
        'Portuguese Verb Conjugations',
        'seed:portuguese-verbs'
    )


    console.log(
        '\n========================================'
    )

    console.log(
        'All seeds completed successfully.'
    )

    console.log(
        '========================================\n'
    )


} catch (error) {

    console.error(
        '\nMaster seed failed.'
    )

    console.error(
        'Remaining seeds were not executed.'
    )

    process.exit(1)
}