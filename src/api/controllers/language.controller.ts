/* Implements language CRUD used by language routes and the frontend catalog. */

import type { Request, Response } from 'express'

import Language from '../models/Language.model'

/* ------------------------------------- */
/*           Language Controllers        */
/* ------------------------------------- */

const getAllLanguages = async (
  _req: Request,
  res: Response) => {
  try {
    // Return the catalog as an array. An empty catalog is a successful response.
    const languages = await Language.find()
    return res.status(200).json(languages)
  } catch (error) {
    return res.status(400).json({
      error: "Failed to get all languages"
    })
  }
}

/* ========================================== */

const getLanguage = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    // findById accepts the route parameter and returns null when no language exists.
    // Invalid ObjectId strings throw a cast error and are handled by the catch block.
    const language = await Language.findById(
      req.params.id
    );

    if (!language) {
      return res.status(404).json({
        error: "Language not found"
      });
    }

    return res.status(200).json(language);

  } catch {
    return res.status(400).json({
      error: "Failed to get language"
    });
  }
};

/* ========================================== */

type CreateLanguageBody = {
  name: string;
  nativeName: string;
  code: string;
};

const createLanguage = async (
  req: Request<{}, {}, CreateLanguageBody>,
  res: Response
) => {
  try {
    // Schema constraints normalize `code` to lowercase and enforce unique names/codes.
    const language = await Language.create(req.body);

    return res.status(201).json(language);

  } catch {
    return res.status(400).json({
      error: "Failed to create language"
    });
  }
};

/* ========================================== */

type UpdateLanguageBody = {
  name?: string;
  nativeName?: string;
  code?: string;
};

const updateLanguage = async (
  req: Request<{ id: string }, {}, UpdateLanguageBody>,
  res: Response
) => {
  try {
    const language = await Language.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        // Mongoose update queries need these options to validate the changed fields
        // and to return the value after the update rather than the previous value.
        new: true,
        runValidators: true
      }
    );

    if (!language) {
      return res.status(404).json({
        error: "Language not found"
      });
    }

    return res.status(200).json(language);

  } catch {
    return res.status(400).json({
      error: "Failed to update language"
    });
  }
};

/* ========================================== */

const deleteLanguage = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const language = await Language.findByIdAndDelete(
      req.params.id
    );

    if (!language) {
      return res.status(404).json({
        error: "Language not found"
      });
    }

    return res.status(200).json({
      message: `Language ${language.name} deleted successfully`
    });

  } catch {
    return res.status(400).json({
      error: "Failed to delete language"
    });
  }
};

/* ========================================== */


export {
  getAllLanguages,
  getLanguage,
  createLanguage,
  updateLanguage,
  deleteLanguage
}