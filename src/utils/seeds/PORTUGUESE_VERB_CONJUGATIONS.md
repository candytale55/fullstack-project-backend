<!-- Documents how the Portuguese conjugation seed maps Anki tags to MongoDB and exercises. -->

# Portuguese verb-conjugation seed

`portugueseVerbConjugation.seed.ts` imports `data/pt-verb-conjugations-newest.csv` directly from Anki. The export has three metadata rows, no field-name header, and 25 comma-separated columns. The seed skips the metadata and maps affirmative forms, negative forms, IPA, negative IPA, and tags from their fixed positions.

## Current scope

Only rows with the exact tag `course-code::pt-conjugation` are imported. Rows belonging to other courses stay unchanged in the export and the seed reports how many it left out. Their course catalogues can be implemented later.

The course seed defines an exercise unit for each imported unit code. Run the language and course seeds first, then `npm run seed:ptverbs`, and finally the exercise seed.

## Stored tags

Every Anki tag is kept verbatim in the sorted, duplicate-free `tags` array. This preserves current and future filters such as:

- `verbs::ending::pt::ar`
- `verbs::family::pt::fazer`
- `verbs::flag::pt::tricky`
- any unrecognised tag from the exported note

`curriculumTags` is a derived convenience view, not a replacement for `tags`:

| Anki tag | Derived value |
| --- | --- |
| `verbs::ending::pt::ar` | `ending-ar` |
| `verbs::family::pt::fazer` | `family-fazer` |
| `verbs::flag::pt::tricky` | `flag-tricky` |

The API accepts repeated `tags` query parameters and applies MongoDB `$all`, allowing a future selector to require exact raw Anki tags.

## Structural tags

The seed extracts these fields without translating their values:

| Tag | MongoDB field |
| --- | --- |
| `course-code::pt-conjugation` | selects the imported course |
| `verbs::unit-code::pt-conjugation::<unit>` | `unitId` |
| `verbs::mood::pt::<mood>` | `mood` |
| `verbs::tense::pt::<tense>` | `tense` |

`presente` is the canonical course-unit code. The seed accepts a legacy `present` unit tag and maps it to `presente` while retaining the original tag in `tags`. Before the next export, remove redundant legacy tags such as `unit-code::pt-conjugation::present` and bare `pt`. Keep extra course tags only when the same Anki note is intentionally assigned to those future courses. Each imported note must still have one unambiguous unit and mood/tense tag for `pt-conjugation`; the seed rejects contradictory combinations instead of guessing.

## Source identity

The source file includes valid alternatives such as double participles. Those rows can share an infinitive, mood, and tense while keeping different forms or flags. A SHA-256 `sourceKey` based on the complete Anki row identifies each document, so these alternatives are retained instead of being collapsed by the MongoDB uniqueness index.
