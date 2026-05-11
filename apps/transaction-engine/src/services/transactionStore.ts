import { prisma } from "./prisma";

export const transactionStore = prisma.transaction;
