export type PaginationParams = {
  page?: string | number;
  pageSize?: string | number;
  maxPageSize?: number;
};

export type PaginationResult = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

export function getPagination(params: PaginationParams): PaginationResult {
  const rawPage = params.page ?? 1;
  const rawPageSize = params.pageSize ?? 20;
  const maxPageSize = params.maxPageSize ?? 100;

  const page = Math.max(1, Number(rawPage) || 1);
  const pageSize = Math.min(
    Math.max(1, Number(rawPageSize) || 20),
    maxPageSize
  );

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return { page, pageSize, skip, take };
}
