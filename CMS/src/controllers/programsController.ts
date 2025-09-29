import { Request, Response } from "express";
import { PrismaClient, ProgramStatus, TargetType } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schemas
const createProgramSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.number().int().positive(),
  language: z.string().optional(),
  durationSeconds: z.number().int().positive().optional(),
  publicationDate: z.string().datetime().optional(),
});

const updateProgramSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  language: z.string().optional(),
  durationSeconds: z.number().int().positive().optional(),
  publicationDate: z.string().datetime().optional(),
});

// GET /programs - List all programs
export async function listPrograms(req: Request, res: Response) {
  try {
    const {
      title,
      slug,
      status,
      category,
      language,
      publicationDateStart,
      publicationDateEnd,
    } = req.query;

    // Build where clause for filters
    const whereClause: any = {};

    if (title) {
      whereClause.title = {
        contains: String(title),
        mode: "insensitive",
      };
    }

    if (slug) {
      whereClause.slug = {
        contains: String(slug),
        mode: "insensitive",
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = {
        slug: {
          contains: String(category),
          mode: "insensitive",
        },
      };
    }

    if (language) {
      whereClause.language = {
        contains: String(language),
        mode: "insensitive",
      };
    }

    if (publicationDateStart || publicationDateEnd) {
      whereClause.publicationDate = {};
      if (publicationDateStart) {
        whereClause.publicationDate.gte = new Date(
          String(publicationDateStart)
        );
      }
      if (publicationDateEnd) {
        whereClause.publicationDate.lte = new Date(String(publicationDateEnd));
      }
    }

    const programs = await prisma.program.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    const formattedPrograms = programs.map((program) => ({
      id: program.id,
      slug: program.slug,
      status: program.status,
      title: program.title,
      description: program.description,
      categoryId: program.categoryId,
      category: program.category
        ? {
            id: program.category.id,
            name: program.category.name,
            slug: program.category.slug,
          }
        : null,
      publicationDate: program.publicationDate,
      language: program.language,
      durationSeconds: program.durationSeconds,
    }));

    res.json(formattedPrograms);
  } catch (error) {
    console.error("Error listing programs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /programs/{id} - Get program by ID
export async function getProgram(req: Request, res: Response) {
  try {
    const idParam = req.params?.["id"];
    if (!idParam) {
      return res.status(400).json({ error: "Missing path parameter 'id'" });
    }

    const id = Number.parseInt(String(idParam), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid 'id' format" });
    }

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        category: true,
        published: true,
      },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    const formattedProgram = {
      id: program.id,
      slug: program.slug,
      status: program.status,
      title: program.title,
      description: program.description,
      categoryId: program.categoryId,
      category: program.category
        ? {
            id: program.category.id,
            name: program.category.name,
            slug: program.category.slug,
          }
        : null,
      publicationDate: program.publicationDate,
      language: program.language,
      durationSeconds: program.durationSeconds,
      published: program.published
        ? {
            slug: program.published.slug,
            title: program.published.title,
            description: program.published.description,
            categorySlug: program.published.categorySlug,
            language: program.published.language,
            durationSeconds: program.published.durationSeconds,
          }
        : null,
    };

    res.json(formattedProgram);
  } catch (error) {
    console.error("Error getting program:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /programs - Create new program
export async function createProgram(req: Request, res: Response) {
  try {
    const parsed = createProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const {
      slug,
      title,
      description,
      categoryId,
      language,
      durationSeconds,
      publicationDate,
    } = parsed.data;

    // Check if slug already exists
    const existingProgram = await prisma.program.findUnique({
      where: { slug },
    });

    if (existingProgram) {
      return res
        .status(409)
        .json({ error: "Program with this slug already exists" });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return res.status(400).json({ error: "Category not found" });
    }

    // Filter out undefined values to satisfy Prisma's exactOptionalPropertyTypes
    const programData: any = {
      slug,
      title,
      status: ProgramStatus.draft,
    };

    if (description !== undefined) {
      programData.description = description;
    }
    if (categoryId !== undefined) {
      programData.categoryId = categoryId;
    }
    if (language !== undefined) {
      programData.language = language;
    }
    if (durationSeconds !== undefined) {
      programData.durationSeconds = durationSeconds;
    }
    if (publicationDate !== undefined) {
      programData.publicationDate = new Date(publicationDate);
    }

    const program = await prisma.program.create({
      data: programData,
      include: {
        category: true,
      },
    });

    const formattedProgram = {
      id: program.id,
      slug: program.slug,
      status: program.status,
      title: program.title,
      description: program.description,
      categoryId: program.categoryId,
      category: program.category
        ? {
            id: program.category.id,
            name: program.category.name,
            slug: program.category.slug,
          }
        : null,
      publicationDate: program.publicationDate,
      language: program.language,
      durationSeconds: program.durationSeconds,
    };

    res.status(201).json(formattedProgram);
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /programs/{id} - Update program
export async function updateProgram(req: Request, res: Response) {
  try {
    const idParam = req.params?.["id"];
    if (!idParam) {
      return res.status(400).json({ error: "Missing path parameter 'id'" });
    }

    const id = Number.parseInt(String(idParam), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid 'id' format" });
    }

    const parsed = updateProgramSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id },
    });

    if (!existingProgram) {
      return res.status(404).json({ error: "Program not found" });
    }

    // If slug is being updated, check if it's already taken by another program
    if (parsed.data.slug && parsed.data.slug !== existingProgram.slug) {
      const slugExists = await prisma.program.findUnique({
        where: { slug: parsed.data.slug },
      });
      if (slugExists) {
        return res
          .status(409)
          .json({ error: "Program with this slug already exists" });
      }
    }

    // If categoryId is provided, verify it exists
    if (parsed.data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parsed.data.categoryId },
      });
      if (!category) {
        return res.status(400).json({ error: "Category not found" });
      }
    }

    // Filter out undefined values to satisfy Prisma's exactOptionalPropertyTypes
    const updateData: any = {};

    if (parsed.data.slug !== undefined) {
      updateData.slug = parsed.data.slug;
    }
    if (parsed.data.title !== undefined) {
      updateData.title = parsed.data.title;
    }
    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description;
    }
    if (parsed.data.categoryId !== undefined) {
      updateData.categoryId = parsed.data.categoryId;
    }
    if (parsed.data.language !== undefined) {
      updateData.language = parsed.data.language;
    }
    if (parsed.data.durationSeconds !== undefined) {
      updateData.durationSeconds = parsed.data.durationSeconds;
    }
    if (parsed.data.publicationDate !== undefined) {
      updateData.publicationDate = new Date(parsed.data.publicationDate);
    }

    const program = await prisma.program.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        published: true,
      },
    });

    const formattedProgram = {
      id: program.id,
      slug: program.slug,
      status: program.status,
      title: program.title,
      description: program.description,
      categoryId: program.categoryId,
      category: program.category
        ? {
            id: program.category.id,
            name: program.category.name,
            slug: program.category.slug,
          }
        : null,
      publicationDate: program.publicationDate,
      language: program.language,
      durationSeconds: program.durationSeconds,
      published: program.published
        ? {
            slug: program.published.slug,
            title: program.published.title,
            description: program.published.description,
            categorySlug: program.published.categorySlug,
            language: program.published.language,
            durationSeconds: program.published.durationSeconds,
          }
        : null,
    };

    res.json(formattedProgram);
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /programs/{id}/publish - Publish program
export async function publishProgram(req: Request, res: Response) {
  try {
    const idParam = req.params?.["id"];
    if (!idParam) {
      return res.status(400).json({ error: "Missing path parameter 'id'" });
    }

    const id = Number.parseInt(String(idParam), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid 'id' format" });
    }

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        category: true,
        published: true,
      },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    if (program.status === ProgramStatus.public) {
      return res.status(400).json({ error: "Program is already published" });
    }

    // Start a transaction to update program and create published version
    const result = await prisma.$transaction(async (tx) => {
      // Update program status to public
      const updatedProgram = await tx.program.update({
        where: { id },
        data: {
          status: ProgramStatus.public,
          publicationDate: new Date(),
        },
        include: {
          category: true,
        },
      });

      // Delete existing published version if it exists
      await tx.programPublished.deleteMany({
        where: { programId: id },
      });

      // Create new published version
      await tx.programPublished.create({
        data: {
          programId: id,
          slug: program.slug,
          title: program.title,
          description: program.description,
          categorySlug: program.category?.slug || null,
          language: program.language,
          durationSeconds: program.durationSeconds,
        },
      });

      // Insert audit log for publish action
      {
        const auditData: any = {
          action: "program.publish",
          targetType: TargetType.program,
          targetId: String(id),
          meta: {
            slug: program.slug,
            previousStatus: program.status,
            newStatus: ProgramStatus.public,
          },
        };
        if (req.user?.id !== undefined) auditData.actorId = req.user.id;
        if (req.ip) auditData.ip = req.ip;
        const ua = req.headers["user-agent"];
        if (typeof ua === "string") auditData.ua = ua;
        await tx.auditLog.create({ data: auditData });
      }

      return updatedProgram;
    });

    const formattedProgram = {
      id: result.id,
      slug: result.slug,
      status: result.status,
      title: result.title,
      description: result.description,
      categoryId: result.categoryId,
      category: result.category
        ? {
            id: result.category.id,
            name: result.category.name,
            slug: result.category.slug,
          }
        : null,
      publicationDate: result.publicationDate,
      language: result.language,
      durationSeconds: result.durationSeconds,
    };

    res.json(formattedProgram);
  } catch (error) {
    console.error("Error publishing program:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /programs/{id}/archive - Archive program
export async function archiveProgram(req: Request, res: Response) {
  try {
    const idParam = req.params?.["id"];
    if (!idParam) {
      return res.status(400).json({ error: "Missing path parameter 'id'" });
    }

    const id = Number.parseInt(String(idParam), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid 'id' format" });
    }

    const program = await prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    if (program.status === ProgramStatus.archived) {
      return res.status(400).json({ error: "Program is already archived" });
    }

    // Start a transaction to update program and remove published version
    const result = await prisma.$transaction(async (tx) => {
      // Update program status to archived
      const updatedProgram = await tx.program.update({
        where: { id },
        data: {
          status: ProgramStatus.archived,
        },
        include: {
          category: true,
        },
      });

      // Remove published version if it exists
      await tx.programPublished.deleteMany({
        where: { programId: id },
      });

      // Insert audit log for archive action
      {
        const auditData: any = {
          action: "program.archive",
          targetType: TargetType.program,
          targetId: String(id),
          meta: {
            slug: program.slug,
            previousStatus: program.status,
            newStatus: ProgramStatus.archived,
          },
        };
        if (req.user?.id !== undefined) auditData.actorId = req.user.id;
        if (req.ip) auditData.ip = req.ip;
        const ua = req.headers["user-agent"];
        if (typeof ua === "string") auditData.ua = ua;
        await tx.auditLog.create({ data: auditData });
      }

      return updatedProgram;
    });

    const formattedProgram = {
      id: result.id,
      slug: result.slug,
      status: result.status,
      title: result.title,
      description: result.description,
      categoryId: result.categoryId,
      category: result.category
        ? {
            id: result.category.id,
            name: result.category.name,
            slug: result.category.slug,
          }
        : null,
      publicationDate: result.publicationDate,
      language: result.language,
      durationSeconds: result.durationSeconds,
    };

    res.json(formattedProgram);
  } catch (error) {
    console.error("Error archiving program:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
