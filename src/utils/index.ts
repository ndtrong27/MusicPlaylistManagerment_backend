export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export function createResponse<T>(data: T, message?: string) {
  return { success: true, data, ...(message && { message }) };
}

export function paginate<T>(
  items: T[],
  page: number,
  limit: number
): { data: T[]; total: number; page: number; limit: number } {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  };
}
