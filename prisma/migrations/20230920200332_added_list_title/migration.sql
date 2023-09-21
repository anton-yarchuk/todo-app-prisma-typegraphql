/*
  Warnings:

  - Added the required column `title` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "List" ADD COLUMN     "title" TEXT NOT NULL;
