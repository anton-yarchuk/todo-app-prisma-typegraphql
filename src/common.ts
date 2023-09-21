import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  userId?: string;
}

export const context: Context = {
  prisma: prisma,
};

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}
