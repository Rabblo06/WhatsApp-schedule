import { Prisma, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export { Prisma, PrismaClient };

export type PrismaJsonInput = Prisma.InputJsonValue | Prisma.JsonNullValueInput;

export function toPrismaJsonValue(value: unknown): PrismaJsonInput {
  if (value === null) {
    return Prisma.JsonNull;
  }

  const jsonValue = toNestedPrismaJsonValue(value);
  return jsonValue === null ? Prisma.JsonNull : jsonValue;
}

function toNestedPrismaJsonValue(value: unknown): Prisma.InputJsonValue | null {
  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => toNestedPrismaJsonValue(item));
  }

  if (typeof value === "object") {
    const entries: Array<[string, Prisma.InputJsonValue | null]> = [];
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined && typeof entry !== "function" && typeof entry !== "symbol") {
        entries.push([key, toNestedPrismaJsonValue(entry)]);
      }
    }
    return Object.fromEntries(entries);
  }

  return String(value);
}
