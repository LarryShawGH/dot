import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const AUDIT_LOG_FILE = path.join(DATA_DIR, "audit.log");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const APPROVALS_FILE = path.join(DATA_DIR, "approvals.json");
const PROVISIONING_FILE = path.join(DATA_DIR, "provisioning.json");
const REVIEWS_SUBDIR = path.join(DATA_DIR, "reviews");
const TADS_SUBDIR = path.join(DATA_DIR, "tads");

export type AuditEntry = {
  timestamp: string;
  reviewId: string;
  action: string;
  actor?: string;
  details?: Record<string, unknown>;
};

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function appendAuditLog(entry: AuditEntry): Promise<void> {
  await ensureDataDir();
  const line = JSON.stringify(entry) + "\n";
  await fs.appendFile(AUDIT_LOG_FILE, line);
}

export async function readAuditLog(reviewId?: string): Promise<AuditEntry[]> {
  await ensureDataDir();
  try {
    const content = await fs.readFile(AUDIT_LOG_FILE, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);
    const entries = lines.map((line) => JSON.parse(line) as AuditEntry);
    if (reviewId) {
      return entries.filter((e) => e.reviewId === reviewId);
    }
    return entries;
  } catch {
    return [];
  }
}

export async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function readReviews(): Promise<Record<string, { createdAt: string; productName?: string }>> {
  return readJsonFile(REVIEWS_FILE, {});
}

export async function writeReviews(data: Record<string, { createdAt: string; productName?: string }>): Promise<void> {
  return writeJsonFile(REVIEWS_FILE, data);
}

export async function readApprovals(): Promise<Record<string, { state: string; updatedAt: string }>> {
  return readJsonFile(APPROVALS_FILE, {});
}

export async function writeApprovals(data: Record<string, { state: string; updatedAt: string }>): Promise<void> {
  return writeJsonFile(APPROVALS_FILE, data);
}

export async function readProvisioning(): Promise<Record<string, { status: string; completedAt?: string }>> {
  return readJsonFile(PROVISIONING_FILE, {});
}

export async function writeProvisioning(data: Record<string, { status: string; completedAt?: string }>): Promise<void> {
  return writeJsonFile(PROVISIONING_FILE, data);
}

export function generateReviewId(): string {
  return `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function clearJsonFilesInDir(dir: string): Promise<void> {
  try {
    const files = await fs.readdir(dir);
    await Promise.all(files.map((f) => fs.unlink(path.join(dir, f))));
  } catch {
    /* directory may not exist */
  }
}

/**
 * Resets all API-written demo data to initial state. Used by Reset Demo Data (admin).
 * Clears reviews.json, approvals.json, provisioning.json, audit.log, and all files under data/reviews and data/tads.
 */
export async function resetDemoData(): Promise<void> {
  await ensureDataDir();
  await writeReviews({});
  await writeApprovals({});
  await writeProvisioning({});
  await fs.writeFile(AUDIT_LOG_FILE, "", "utf-8");
  await clearJsonFilesInDir(REVIEWS_SUBDIR);
  await clearJsonFilesInDir(TADS_SUBDIR);
}
