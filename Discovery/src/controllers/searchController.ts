import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getPagination } from "../utils/pagination";

const allowedSort = new Set(["recent", "oldest", "title_asc", "title_desc"]);

export async function search(req: Request, res: Response): Promise<void> {
  const q = (req.query["q"] as string | undefined)?.trim();
  const category = (req.query["category"] as string | undefined)?.trim();
  const language = (req.query["language"] as string | undefined)?.trim();
  const sort = (req.query["sort"] as string | undefined)?.trim();

  console.log({
    q,
    category,
    language,
    sort,
  });

  const page = req.query["page"] ?? 1;
  const pageSize = req.query["pageSize"] ?? 10;

  const { skip, take } = getPagination({
    page: page as string | number,
    pageSize: pageSize as string | number,
    maxPageSize: 100,
  });

  const where: any = {};
  if (category) where.category = category;
  if (language) where.language = language;

  if (q) {
    // Simple full-text like search on title/description
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy: any = { publishedAt: "desc" };
  if (sort && allowedSort.has(sort)) {
    switch (sort) {
      case "recent":
        orderBy = { publishedAt: "desc" };
        break;
      case "oldest":
        orderBy = { publishedAt: "asc" };
        break;
      case "title_asc":
        orderBy = { title: "asc" };
        break;
      case "title_desc":
        orderBy = { title: "desc" };
        break;
    }
  }

  const [items, total] = await Promise.all([
    prisma.program.findMany({ where, orderBy, skip, take }),
    prisma.program.count({ where }),
  ]);

  res.json({
    data: items,
    meta: {
      page,
      pageSize: Number(pageSize),
      total,
      totalPages: Math.ceil(total / Number(pageSize)),
      sort: sort || "recent",
      filters: {
        category: category || null,
        language: language || null,
        q: q || null,
      },
    },
  });
  return;
}

export async function suggest(req: Request, res: Response): Promise<void> {
  const q = (req.query["q"] as string | undefined)?.trim();
  if (!q || q.length < 1) {
    res.json({ suggestions: [] });
    return;
  }

  const suggestions = await prisma.program.findMany({
    where: { title: { contains: q, mode: "insensitive" } },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
    take: 10,
  });

  res.json({ suggestions });
  return;
}
