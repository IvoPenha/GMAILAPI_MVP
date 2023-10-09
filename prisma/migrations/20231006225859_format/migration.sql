/*
  Warnings:

  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Perfil" (
    "id" SERIAL NOT NULL,
    "googleRefreshToken" TEXT,
    "microsoftRefreshToken" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "senha" TEXT NOT NULL,
    "perfilId" INTEGER NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anexo" (
    "id" SERIAL NOT NULL,
    "enviadoPor" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "dataEmail" TIMESTAMP(3) NOT NULL,
    "mensagemId" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "codigoBarras" TEXT NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION,
    "base64" TEXT NOT NULL,
    "perfilId" INTEGER NOT NULL,

    CONSTRAINT "Anexo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Perfil_usuarioId_key" ON "Perfil"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
