/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name]` on the table `decks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "decks_user_id_name_key" ON "decks"("user_id", "name");
