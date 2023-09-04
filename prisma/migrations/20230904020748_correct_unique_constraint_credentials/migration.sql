/*
  Warnings:

  - A unique constraint covering the columns `[label,userId]` on the table `credentials` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "credentials_label_username_key";

-- CreateIndex
CREATE UNIQUE INDEX "credentials_label_userId_key" ON "credentials"("label", "userId");
