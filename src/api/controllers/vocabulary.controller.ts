

import type { Request, Response } from "express";
import type { QueryFilter } from "mongoose";



import VocabularyItem, {
  type IVocabularyItem
} from "../models/Vocabulary.model";


type VocabularyQuery = {
  language?: string;
  level?: string;
  tag?: string;
  hasImage?: boolean;
};

/* ------------------------------------- */
/*         Vocabulary Controllers        */
/* ------------------------------------- */



const getAllVocabulary = async (
  req: Request<{}, {}, {}, VocabularyQuery>,
  res: Response
) => {
  try {
   
    const filter: QueryFilter<IVocabularyItem> = {};
    
    const {
      language,
      level,
      tag,
      hasImage
    } = req.query;

    if (language) {
      filter.languageCode = language;
    }
    if (level) {
      filter.level = level.trim();
    }
    if (tag) {
      filter.tags = tag.trim();
    }
    if (hasImage !== undefined && hasImage === true) {
      filter['image.filename'] = { $exists: true, $ne: "" };
    }

    const vocabulary =
      await VocabularyItem
        .find(filter)
        .sort({ term: 1 }); /* Sort vocabulary items alphabetically by term */

    return res.status(200).json(vocabulary);

  } catch {
    return res.status(400).json({
      error: "Failed to get vocabulary"
    });
  }
};


/* ========================================== */

const getVocabularyByCourse = async (
  req: Request<{ courseId: string }>,
  res: Response
) => {
  try {
    const vocabulary = await VocabularyItem.find({
      course: req.params.courseId
    });

    return res.status(200).json(vocabulary);

  } catch {
    return res.status(400).json({
      error: "Failed to get vocabulary"
    });
  }
};


/* ========================================== */

const getVocabularyByUnit = async (
  req: Request<{
    courseId: string;
    unitId: string;
  }>,
  res: Response
) => {
  try {
    const vocabulary = await VocabularyItem.find({
      course: req.params.courseId,
      unitId: req.params.unitId
    });

    return res.status(200).json(vocabulary);

  } catch {
    return res.status(400).json({
      error: "Failed to get vocabulary"
    });
  }
};


/* ========================================== */

const getVocabularyItem = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const vocabularyItem =
      await VocabularyItem.findById(
        req.params.id
      );

    if (!vocabularyItem) {
      return res.status(404).json({
        error: "Vocabulary item not found"
      });
    }

    return res.status(200).json(
      vocabularyItem
    );

  } catch {
    return res.status(400).json({
      error: "Failed to get vocabulary item"
    });
  }
};

/* ========================================== */

const createVocabularyItem = async (
  req: Request,
  res: Response
) => {
  try {
    const vocabularyItem =
      await VocabularyItem.create(
        req.body
      );

    return res.status(201).json(
      vocabularyItem
    );

  } catch {
    return res.status(400).json({
      error: "Failed to create vocabulary item"
    });
  }
};

/* ========================================== */

const updateVocabularyItem = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const vocabularyItem =
      await VocabularyItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

    if (!vocabularyItem) {
      return res.status(404).json({
        error: "Vocabulary item not found"
      });
    }

    return res.status(200).json(
      vocabularyItem
    );

  } catch {
    return res.status(400).json({
      error: "Failed to update vocabulary item"
    });
  }
};

/* ========================================== */

const deleteVocabularyItem = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const vocabularyItem =
      await VocabularyItem.findByIdAndDelete(
        req.params.id
      );

    if (!vocabularyItem) {
      return res.status(404).json({
        error: "Vocabulary item not found"
      });
    }

    return res.status(200).json({
      message: `Vocabulary item ${vocabularyItem.term} deleted successfully`
    });

  } catch {
    return res.status(400).json({
      error: "Failed to delete vocabulary item"
    });
  }
};

/* ========================================== */

export {
  getAllVocabulary,
  getVocabularyItem,
  createVocabularyItem,
  updateVocabularyItem,
  deleteVocabularyItem
};