import { Program } from "@prisma/client";

// Currently supported source: "rss". Keep open union for future extensibility.
export type ImportSource = "rss" | (string & {});

export interface ImportProgramInput {
  slug: string;
  title: string;
  description?: string | null;
  categorySlug?: string | null;
  language?: string | null;
  durationSeconds?: number | null;
  publicationDate?: Date | null;
  externalSource?: string | null;
  externalId?: string | null;
}

export interface ImportResultSummary {
  insertedCount: number;
  updatedCount: number;
}

export interface ProgramImporter {
  readonly source: ImportSource;
  importPrograms(): Promise<ImportProgramInput[]>;
}

export interface CsvImportOptions {
  filePath: string;
}

export interface RssImportOptions {
  feedUrl: string;
}

export interface AppleImportOptions {
  feedUrl: string; // Apple Podcasts also provides RSS feeds
}

export interface ImportOrchestratorOptions {
  // When true, programs will be created as draft if missing required relations
  softCreate?: boolean;
}

export type UpsertOutcome = "inserted" | "updated" | "skipped";

export interface UpsertResult {
  outcome: UpsertOutcome;
  program: Program;
}
