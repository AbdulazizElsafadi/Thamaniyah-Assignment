import { Request, Response } from "express";
import { runImporter } from "../services/importer/orchestrator";
import { makeRssImporter } from "../services/importer/rssImporter";

export async function importProgramsBySource(req: Request, res: Response) {
  const source = String(req.params?.["source"] || "").toLowerCase();
  if (!source) return res.status(400).json({ error: "source is required" });

  if (source !== "rss") {
    return res
      .status(400)
      .json({ error: `Source '${source}' is not implemented` });
  }

  const feedUrl = String(
    (req.body as any)?.["feedUrl"] || (req.query as any)?.["feedUrl"] || ""
  ).trim();
  if (!feedUrl) return res.status(400).json({ error: "feedUrl is required" });

  console.log({ feedUrl });

  const summary = await runImporter(makeRssImporter({ feedUrl }));
  return res.status(200).json({ source: "rss", ...summary });
}
