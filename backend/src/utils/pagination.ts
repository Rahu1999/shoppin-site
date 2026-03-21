export const getPaginationParams = (
  page?: string | number,
  limit?: string | number
): { page: number; limit: number; skip: number } => {
  const p = Math.max(1, parseInt(String(page ?? '1'), 10));
  const l = Math.min(100, Math.max(1, parseInt(String(limit ?? '20'), 10)));
  return { page: p, limit: l, skip: (p - 1) * l };
};

export const buildPaginationMeta = ( page: number, limit: number, total: number ) => {
  const totalPages = Math.ceil(total / limit);
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
};
