/*
  Warnings:

  - Added the required column `usuarioId` to the `googleReadMessages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "googleReadMessages" ADD COLUMN     "usuarioId" INTEGER NOT NULL;
