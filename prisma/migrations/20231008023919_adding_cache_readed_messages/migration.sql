-- CreateTable
CREATE TABLE "googleReadMessages" (
    "id" SERIAL NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "googleReadMessages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "googleReadMessages_messageId_key" ON "googleReadMessages"("messageId");
