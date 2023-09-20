/*
  Warnings:

  - You are about to drop the column `archivedAt` on the `List` table. All the data in the column will be lost.
  - You are about to drop the column `archivedAt` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "List" DROP COLUMN "archivedAt",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "archivedAt",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "dueDate" TIMESTAMP(3);
