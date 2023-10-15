-- CreateEnum
CREATE TYPE "Situacao" AS ENUM ('PAGO', 'PENDENTE', 'VENCIDO', 'CANCELADO');

-- AlterTable
ALTER TABLE "Anexo" ADD COLUMN     "Situacao" "Situacao" NOT NULL DEFAULT 'PENDENTE';
