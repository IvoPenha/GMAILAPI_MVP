/*
  Warnings:

  - You are about to drop the column `Situacao` on the `Anexo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Anexo" DROP COLUMN "Situacao",
ADD COLUMN     "situacao" "Situacao" NOT NULL DEFAULT 'PENDENTE';
