import Parser from "rss-parser";
import { ProgramImporter, ImportProgramInput, RssImportOptions } from "./types";

export function makeRssImporter(options: RssImportOptions): ProgramImporter {
  const feedUrl = options.feedUrl;
  console.log({ feedUrl });
  return {
    source: "rss",
    async importPrograms(): Promise<ImportProgramInput[]> {
      const parser: Parser = new Parser({ timeout: 15000 });
      const feed = await parser.parseURL(feedUrl);
      const items = feed.items || [];

      const programs: ImportProgramInput[] = items.map((item) => {
        const link =
          (item as any).link || (item as any).guid || (item as any)["id"] || "";
        const pubDate: string | undefined =
          (item as any).isoDate || (item as any).pubDate || undefined;
        const durationInSeconds = parseItunesDurationToSeconds(
          (item as any)?.itunes?.duration
        );

        const obj: any = {
          slug: slugify(
            (item as any).title || link || Math.random().toString(36).slice(2)
          ),
          title: (item as any).title || "Untitled",
          externalSource: "rss",
        };
        const description =
          (item as any).contentSnippet || (item as any).content;
        if (typeof description === "string")
          obj.description = description as string;
        const language = (feed as any)["language"] as string | undefined;
        if (language) obj.language = language;
        if (typeof durationInSeconds === "number")
          obj.durationSeconds = durationInSeconds;
        if (pubDate) obj.publicationDate = new Date(pubDate);
        if (link) obj.externalId = link;
        console.log({ obj });
        return obj as ImportProgramInput;
      });

      console.log({ programs });
      return programs;
    },
  };
}

function slugify(input: string): string {
  console.log({ input });
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseItunesDurationToSeconds(duration: any): number | undefined {
  if (!duration) return undefined;
  if (typeof duration === "number") return duration;
  if (typeof duration !== "string") return undefined;
  const parts = duration.split(":").map((p) => parseInt(p, 10));
  if (parts.some((p) => Number.isNaN(p))) return undefined;
  if (
    parts.length === 3 &&
    parts[0] != null &&
    parts[1] != null &&
    parts[2] != null
  )
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2 && parts[0] != null && parts[1] != null)
    return parts[0] * 60 + parts[1];
  if (parts.length === 1 && parts[0] != null) return parts[0];
  return undefined;
}
