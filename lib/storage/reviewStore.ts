/**
 * Mock persistence for reviews and TADs using the filesystem.
 * - Reviews: data/reviews/{reviewId}.json
 * - TADs: data/tads/{reviewId}.json
 *
 * Use reviewId = "REV-001" for demo.
 */

import fs from "fs/promises";
import path from "path";
import type { ReviewResult, TechnicalArchitectureDocument } from "@/lib/types/review";
import { generateTAD } from "@/lib/tad/generateTAD";

const DATA_DIR = path.join(process.cwd(), "data");
const REVIEWS_DIR = path.join(DATA_DIR, "reviews");
const TADS_DIR = path.join(DATA_DIR, "tads");

/** Default review ID for demo. */
export const DEFAULT_REVIEW_ID = "REV-001";

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Saves a review as JSON and generates and saves the TAD for that review.
 * Files: data/reviews/{reviewId}.json, data/tads/{reviewId}.json
 *
 * Use saveReview(review) for demo (uses REV-001) or saveReview(reviewId, review) to set id.
 */
export async function saveReview(
  reviewIdOrReview: string | ReviewResult,
  review?: ReviewResult
): Promise<void> {
  const reviewId = typeof reviewIdOrReview === "string" ? reviewIdOrReview : DEFAULT_REVIEW_ID;
  const rev: ReviewResult = typeof reviewIdOrReview === "string" ? review! : reviewIdOrReview;
  await ensureDir(REVIEWS_DIR);
  await ensureDir(TADS_DIR);

  const reviewPath = path.join(REVIEWS_DIR, `${reviewId}.json`);
  const tadPath = path.join(TADS_DIR, `${reviewId}.json`);

  await fs.writeFile(reviewPath, JSON.stringify(rev, null, 2), "utf-8");

  const tad = generateTAD(rev);
  await fs.writeFile(tadPath, JSON.stringify(tad, null, 2), "utf-8");
}

/**
 * Loads a review from data/reviews/{reviewId}.json.
 * Returns null if the file does not exist.
 */
export async function getReview(reviewId: string): Promise<ReviewResult | null> {
  const reviewPath = path.join(REVIEWS_DIR, `${reviewId}.json`);
  try {
    const content = await fs.readFile(reviewPath, "utf-8");
    return JSON.parse(content) as ReviewResult;
  } catch {
    return null;
  }
}

/**
 * Loads a TAD from data/tads/{reviewId}.json.
 * Returns null if the file does not exist.
 */
export async function getTAD(reviewId: string): Promise<TechnicalArchitectureDocument | null> {
  const tadPath = path.join(TADS_DIR, `${reviewId}.json`);
  try {
    const content = await fs.readFile(tadPath, "utf-8");
    return JSON.parse(content) as TechnicalArchitectureDocument;
  } catch {
    return null;
  }
}
