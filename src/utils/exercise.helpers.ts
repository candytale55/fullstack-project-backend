/*
 * src/api/utils/exercise.helpers.ts
 *
 * Implements the Content Resolution Strategy pattern.
 * Resolves declarative exercise criteria into dataset items and provides
 * transparency into the underlying MongoDB query syntax for the backend.
 */

// TODO: This is all for Mongoose, should be abstracted for other databases as well.

import { IExercise } from '../api/models/Exercise.model';


/* ---------------------------------------- */
// TODO: Copied from the frontend 

// Criteria for Verb Conjugations
export interface ConjugationCriteria {
    tense?: string[]  // ['presente', 'imperfeito']
    infinitives?: string[]  // ['falar', 'comer']
    mood?: string // (e.g. 'indicativo','conjuntivo')
    verbTags?: string[]  // ['irregular', 'reflexo']
    limit?: number // cap on questions
}

// Criteria for Vocabulary Exercises
export interface VocabularyCriteria {
    languageCode: string // (e.g. 'pt', 'es', 'en')
    level?: string // (A2, B1, B2.1, C1.2, C2)
    tags?: string[]  // ['fruits']
    optionalTags?: string[]  // TODO ?? ['citrus']
    partOfSpeech?: string // ['n', 'v'] (noun, verb)
    excludeTags?: string[]  // ['hard', 'crazy-difficult']
    limit?: number // cap on questions
}
/* ---------------------------------------- */

export interface QueryDescriptor {
    modelName: string;
    collection: string;
    query: Record<string, any>;
    projection?: Record<string, any>;
    limit?: number | undefined;
    explanation: string;
}

// TODO: Solve the T=any issue.
export interface ExerciseContent<T = any> {
    exercise: IExercise;
    items: T[];
    queryDescriptor: QueryDescriptor;
}

/* ------------------------------------------ */
/* ------------ Query Generation ------------ */
/* ------------------------------------------ */

/**
 * Generates the exact query filter that the  backend will run.
 */

export function buildQuery(
    type: string,
    criteria: Record<string, any>
): QueryDescriptor {

    /* ----------------------- */
    if (type === 'conjugation') {
        const filter: Record<string, any> = {};
        const c = criteria as ConjugationCriteria;

        // Matches ANY selected tense ($in)
        if (c.tense && c.tense.length > 0) {
            filter.tense = { $in: c.tense };
        }

        // Matches ANY selected infinitive ($in)
        if (c.infinitives && c.infinitives.length > 0) {
            filter.infinitive = { $in: c.infinitives.map(v => v.toLowerCase().trim()) };
        }

        // Optional mood constraint
        if (c.mood && c.mood.trim()) {
            filter.mood = c.mood.toLowerCase().trim();
        }

        // Matches ALL required verb tags ($all)
        if (c.verbTags && c.verbTags.length > 0) {
            filter.tags = { $all: c.verbTags };
        }

        return {
            modelName: 'PortugueseVerbConjugation',
            collection: 'portugueseVerbConjugations',
            query: filter,
            limit: c.limit,
            explanation: 'Queries verb conjugations matching ' + 
                (c.tense?.length ? `tense(s): ${c.tense.join(', ')}` : 'all tenses') +
                (c.infinitives?.length ? `, for verb(s): [${c.infinitives.join(', ')}] ` : '') +
                (c.verbTags?.length ? `, with required tags: [${c.verbTags.join(', ')}]` : ''),
        }

    }

    /* ----------------------- */
    if (type === 'vocabulary') { 
        const filter: Record<string, any> = {};
        const c = criteria as VocabularyCriteria;

        if (c.languageCode) {
            filter.languageCode = c.languageCode;
        }

        if (c.level) {
            filter.level = c.level;
        }

        // Required tags ($all)
        if (c.tags && c.tags.length > 0) {
            filter.tags = { $all: c.tags };
        }

        // Optional tags ($in)
        if (c.optionalTags && c.optionalTags.length > 0) {
            filter.tags = { ...(filter.tags || {}), $in: c.optionalTags };
        }

        if (c.partOfSpeech) {
            filter.partOfSpeech = c.partOfSpeech;
        }

        if (c.excludeTags && c.excludeTags.length > 0) {
            filter.tags = { ...(filter.tags || {}), $nin: c.excludeTags };
        }

        return {
            modelName: 'VocabularyItem',
            collection: 'vocabulary',
            query: filter,
            limit: c.limit,
            explanation:
                `Queries vocabulary for language "${c.languageCode}"` +
                (c.level ? ` at level ${c.level}` : '') +
                (c.tags?.length ? ` having tags [${c.tags.join(', ')}]` : ''),
        };
    }

    return {
        modelName: '',
        collection: '',
        query: criteria,
        explanation: 'Generic query criteria'
    };


}

