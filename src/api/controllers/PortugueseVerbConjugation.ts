/* Returns conjugations for exercise clients, optionally filtered by stored Anki tags. */

import type { Request, Response } from "express";
import mongoose from "mongoose";

import PortugueseVerbConjugation
  from "../models/PortugueseVerbConjugation.model";


/* ------------------------------------- */
/*   Get Portuguese Verb Conjugations    */
/* ------------------------------------- */

export const getPortugueseVerbConjugations =
  async (
    req: Request,
    res: Response
  ) => {

    try {
      const { courseId, unitId } = req.query;
      
      const filter: {
        course?: string;
        unitId?: string;
        tags?: {
          $all: string[];
        };
      } = {};

      /* Validate optional query filters before using them in MongoDB. */
      if (typeof courseId === "string") {

        if (
          !mongoose.Types.ObjectId.isValid(
            courseId
          )
        ) {
          return res.status(400).json({
            message: "Invalid course id"
          });
        }
        filter.course = courseId;
      }


      /* Validate and add unit filter */
      if (typeof unitId === "string") {
        if (
          !mongoose.Types.ObjectId.isValid(
            unitId
          )
        ) {
          return res.status(400).json({
            message: "Invalid unit id"
          });
        }
        filter.unitId = unitId;
      }

      const tagQuery = req.query.tags;
      const tagValues = typeof tagQuery === "string"
        ? [tagQuery]
        : Array.isArray(tagQuery)
          ? tagQuery
          : tagQuery === undefined
            ? []
            : null;
      const requestedTags: string[] = [];

      if (tagValues === null) {
        return res.status(400).json({
          message: "Invalid tag filter"
        });
      }

      for (const tag of tagValues) {
        if (typeof tag !== "string" || !tag.trim()) {
          return res.status(400).json({
            message: "Invalid tag filter"
          });
        }

        requestedTags.push(tag.trim());
      }

      if (requestedTags.length) {
        filter.tags = {
          $all: requestedTags
        };
      }


      const conjugations =
        await PortugueseVerbConjugation
          .find(filter)
          .sort({
            infinitive: 1
          });


      return res.status(200).json(
        conjugations
      );


    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Unknown error";

      return res.status(500).json({
        message:
          "Error getting Portuguese verb conjugations",
        error: message
      });
    }
  };