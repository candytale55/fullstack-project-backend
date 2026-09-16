import { Router } from 'express'

import {
    getAllLanguages,
    getLanguage,
    createLanguage,
    updateLanguage,
    deleteLanguage
} from '../controllers/language.controller'

const languagesRouter = Router()

languagesRouter.get('/', getAllLanguages)
languagesRouter.get('/:id', getLanguage)
languagesRouter.post('/', createLanguage)
languagesRouter.put('/:id', updateLanguage)
languagesRouter.delete('/:id', deleteLanguage)

export default languagesRouter