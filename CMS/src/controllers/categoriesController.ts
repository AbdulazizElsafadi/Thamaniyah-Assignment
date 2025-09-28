import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
});

// GET /categories - List all categories
export async function listCategories(req: Request, res: Response) {
  try {
    const { name, slug } = req.query;

    // Build where clause for filters
    const whereClause: any = {};

    if (name) {
      whereClause.name = {
        contains: String(name),
        mode: "insensitive",
      };
    }

    if (slug) {
      whereClause.slug = {
        contains: String(slug),
        mode: "insensitive",
      };
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: {
        id: "desc",
      },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error("Error listing categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /categories/{id} - Get category by ID
export async function getCategory(req: Request, res: Response) {
  try {
    const idParam = req.params?.["id"];
    if (!idParam) {
      return res.status(400).json({ error: "Missing path parameter 'id'" });
    }

    const id = Number.parseInt(String(idParam), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid 'id' format" });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        programs: {
          select: {
            id: true,
            slug: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      programs: category.programs,
    };

    res.json(formattedCategory);
  } catch (error) {
    console.error("Error getting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /categories - Create new category
export async function createCategory(req: Request, res: Response) {
  try {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const { name, slug } = parsed.data;

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return res
        .status(409)
        .json({ error: "Category with this slug already exists" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });

    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
    };

    res.status(201).json(formattedCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /categories/{id} - Update category
export async function updateCategory(req: Request, res: Response) {
  try {
    const idParam = req.params?.["id"];
    if (!idParam) {
      return res.status(400).json({ error: "Missing path parameter 'id'" });
    }

    const id = Number.parseInt(String(idParam), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid 'id' format" });
    }

    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // If slug is being updated, check if it's already taken by another category
    if (parsed.data.slug && parsed.data.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: parsed.data.slug },
      });
      if (slugExists) {
        return res
          .status(409)
          .json({ error: "Category with this slug already exists" });
      }
    }

    // Filter out undefined values to satisfy Prisma's exactOptionalPropertyTypes
    const updateData: any = {};

    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name;
    }
    if (parsed.data.slug !== undefined) {
      updateData.slug = parsed.data.slug;
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        programs: {
          select: {
            id: true,
            slug: true,
            title: true,
            status: true,
          },
        },
      },
    });

    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      programs: category.programs,
    };

    res.json(formattedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /categories/{id} - Delete category
export async function deleteCategory(req: Request, res: Response) {
  try {
    const idParam = req.params?.["id"];
    if (!idParam) {
      return res.status(400).json({ error: "Missing path parameter 'id'" });
    }

    const id = Number.parseInt(String(idParam), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid 'id' format" });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        programs: true,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if category has programs
    if (existingCategory.programs.length > 0) {
      return res.status(400).json({
        error: "Cannot delete category with associated programs",
        programsCount: existingCategory.programs.length,
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
