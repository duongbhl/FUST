import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type ParsedRequestParts = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

export const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const parsed = schema.parse({ body: req.body, query: req.query, params: req.params }) as ParsedRequestParts;
  if (parsed.body !== undefined) req.body = parsed.body;
  if (parsed.query !== undefined) req.query = parsed.query as Request["query"];
  if (parsed.params !== undefined) req.params = parsed.params as Request["params"];
  next();
};
