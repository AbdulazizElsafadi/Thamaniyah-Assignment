import { PrismaClient, ProgramStatus } from "@prisma/client";
import {
  ImportOrchestratorOptions,
  ImportProgramInput,
  ImportResultSummary,
  ProgramImporter,
} from "./types";

const prisma = new PrismaClient();

export async function runImporters(
  importers: ProgramImporter[],
  _options: ImportOrchestratorOptions = {}
): Promise<void> {
  for (const importer of importers) {
    await runImporter(importer);
  }
}

export async function runImporter(
  importer: ProgramImporter
): Promise<ImportResultSummary> {
  const source = importer.source;
  let inserted = 0;
  let updated = 0;
  let errorText: string | null = null;

  try {
    const items = await importer.importPrograms();
    console.log({ items });
    for (const item of items) {
      const { created, updated: wasUpdated } = await upsertProgram(item);
      if (created) inserted += 1;
      else if (wasUpdated) updated += 1;
    }
  } catch (err: any) {
    errorText = err?.message || String(err);
  }

  console.log({ inserted, updated, errorText });

  await prisma.importLog.create({
    data: {
      source,
      status: errorText ? "failed" : "success",
      insertedCount: inserted,
      updatedCount: updated,
      errorText: errorText || null,
    },
  });

  return { insertedCount: inserted, updatedCount: updated };
}

async function upsertProgram(
  item: ImportProgramInput
): Promise<{ created: boolean; updated: boolean }> {
  let categoryId: number | undefined = undefined;
  if (item.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
    });
    if (category) categoryId = category.id;
  }

  const existing = await prisma.program.findUnique({
    where: { slug: item.slug },
  });
  console.log({ existing });
  if (!existing) {
    const data: any = {
      slug: item.slug,
      title: item.title,
      status: ProgramStatus.draft,
    };
    if (item.description !== undefined) data.description = item.description;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (item.language !== undefined) data.language = item.language;
    if (item.durationSeconds !== undefined)
      data.durationSeconds = item.durationSeconds;
    if (item.publicationDate !== undefined)
      data.publicationDate = item.publicationDate;
    if (item.externalSource !== undefined)
      data.externalSource = item.externalSource;
    if (item.externalId !== undefined) data.externalId = item.externalId;

    await prisma.program.create({ data });
    return { created: true, updated: false };
  }

  const updateData: any = {};
  if (item.title !== undefined) updateData.title = item.title;
  if (item.description !== undefined) updateData.description = item.description;
  if (categoryId !== undefined) updateData.categoryId = categoryId;
  if (item.language !== undefined) updateData.language = item.language;
  if (item.durationSeconds !== undefined)
    updateData.durationSeconds = item.durationSeconds;
  if (item.publicationDate !== undefined)
    updateData.publicationDate = item.publicationDate;
  if (item.externalSource !== undefined)
    updateData.externalSource = item.externalSource;
  if (item.externalId !== undefined) updateData.externalId = item.externalId;

  await prisma.program.update({ where: { id: existing.id }, data: updateData });
  return { created: false, updated: true };
}
