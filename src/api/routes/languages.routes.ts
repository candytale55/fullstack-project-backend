/* Maps language URLs to language.controller operations consumed by LanguagesPage. */

import { Router } from 'express'

import {
    getAllLanguages,
    getLanguage,
    createLanguage,
    updateLanguage,
    deleteLanguage
} from '../controllers/language.controller'

// Mounted at /api/v1/languages. Route parameters are passed to the controller as
// req.params.id; the controller owns database lookup and error responses.
const languagesRouter = Router()

languagesRouter.get('/', getAllLanguages)
languagesRouter.get('/:id', getLanguage)
languagesRouter.post('/', createLanguage)
languagesRouter.put('/:id', updateLanguage)
languagesRouter.delete('/:id', deleteLanguage)

export default languagesRouter